import React, { useEffect, useRef, useState } from 'react';

interface BarcodeScannerProps {
    onScan: (barcode: string) => void;
    onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!('BarcodeDetector' in window)) {
            setError('Barcode Detector API is not supported in this browser.');
            return;
        }

        const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'],
        });

        let stream: MediaStream | null = null;
        let animationFrameId: number;
        let isMounted = true;

        const startScan = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }

                const detectBarcode = async () => {
                    if (!isMounted) return;
                    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                        try {
                            const barcodes = await barcodeDetector.detect(videoRef.current);
                            if (barcodes.length > 0) {
                                onScan(barcodes[0].rawValue);
                                return; // Stop scanning once found
                            }
                        } catch (err) {
                            console.error('Barcode detection failed:', err);
                        }
                    }
                    animationFrameId = requestAnimationFrame(detectBarcode);
                };
                detectBarcode();

            } catch (err) {
                console.error('Error accessing camera:', err);
                if (err instanceof Error) {
                    if (err.name === 'NotAllowedError') {
                        setError('Camera permission denied. Please enable camera access in your browser settings.');
                    } else {
                        setError(`Error accessing camera: ${err.message}`);
                    }
                }
            }
        };

        startScan();

        // Cleanup function
        return () => {
            isMounted = false;
            cancelAnimationFrame(animationFrameId);
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [onScan]);

    return (
        <div className="fixed inset-0 bg-black flex flex-col justify-center items-center z-50 p-4">
            <div className="relative w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
                <video ref={videoRef} className="w-full h-full object-cover" />
                <div className="absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
                    <div className="absolute top-1/2 left-1/2 w-[90%] h-[70%] -translate-x-1/2 -translate-y-1/2">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 shadow-[0_0_10px_2px_rgba(239,68,68,0.7)] animate-pulse"></div>
                    </div>
                </div>
            </div>
            
            <p className="text-white mt-6 text-center max-w-md">Point the camera at a barcode to scan a product.</p>
            
            {error && <div className="mt-4 p-4 bg-red-900 text-white rounded-lg max-w-md text-center border border-red-700">{error}</div>}

            <button 
                onClick={onClose} 
                className="mt-8 px-8 py-3 rounded-full bg-white dark:bg-slate-200 text-slate-800 dark:text-slate-900 font-semibold hover:bg-slate-200 dark:hover:bg-slate-300 transition-colors focus:outline-none focus:ring-4 focus:ring-white/50"
            >
                Cancel
            </button>
        </div>
    );
};

export default BarcodeScanner;