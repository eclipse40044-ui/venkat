import React, { useEffect, useRef, useState, useCallback } from 'react';

interface BarcodeScannerProps {
    onScan: (barcode: string) => void;
    onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const barcodeDetectorRef = useRef<any>(null);

    const [error, setError] = useState<string | null>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [currentDeviceId, setCurrentDeviceId] = useState<string | undefined>();
    const [isScanning, setIsScanning] = useState(true);

    // Memoize the barcode detector initialization
    useEffect(() => {
        if (!('BarcodeDetector' in window)) {
            setError('Barcode Detector API is not supported in this browser.');
            return;
        }
        try {
            barcodeDetectorRef.current = new (window as any).BarcodeDetector({
                formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'],
            });
        } catch (e) {
            console.error('Error creating BarcodeDetector:', e);
            setError('Could not initialize barcode detector.');
        }
    }, []);

    const stopStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    // Effect to start the stream and handle device selection
    useEffect(() => {
        let isMounted = true;

        const startStream = async (deviceId?: string) => {
            stopStream();
            setError(null);

            const constraints: MediaStreamConstraints = {
                audio: false,
                video: deviceId
                    ? { deviceId: { exact: deviceId } }
                    : { facingMode: { ideal: 'environment' } }
            };

            try {
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                if (!isMounted) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }
                
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }

                // After stream is active, enumerate devices to get accurate list and labels
                const allDevices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
                if (isMounted) {
                    setDevices(videoDevices);
                    const currentTrack = stream.getVideoTracks()[0];
                    if (currentTrack) {
                        const settings = currentTrack.getSettings();
                        setCurrentDeviceId(settings.deviceId);
                    }
                }
            } catch (err) {
                if (!isMounted) return;
                console.error('Error starting camera:', err);

                // If environment camera fails, try with default camera
                if (!deviceId && (err as Error).name !== 'NotAllowedError') {
                    console.log('Falling back to default camera.');
                    try {
                        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                        if (!isMounted) {
                           fallbackStream.getTracks().forEach(track => track.stop());
                           return;
                        }
                        streamRef.current = fallbackStream;
                        if (videoRef.current) {
                            videoRef.current.srcObject = fallbackStream;
                            await videoRef.current.play();
                        }
                    } catch (fallbackErr) {
                         console.error('Fallback camera error:', fallbackErr);
                         setError('Could not access any camera.');
                    }
                } else if ((err as Error).name === 'NotAllowedError') {
                    setError('Camera permission denied. Please enable camera access in your browser settings.');
                } else {
                    setError(`Error accessing camera: ${(err as Error).message}`);
                }
            }
        };

        startStream(currentDeviceId);

        return () => {
            isMounted = false;
            stopStream();
        };
    }, [currentDeviceId, stopStream]);

    // Effect for barcode detection loop
    useEffect(() => {
        let animationFrameId: number;
        
        const detectBarcode = async () => {
            if (isScanning && videoRef.current && barcodeDetectorRef.current && videoRef.current.readyState >= 2) { // HAVE_CURRENT_DATA or more
                try {
                    const barcodes = await barcodeDetectorRef.current.detect(videoRef.current);
                    if (barcodes.length > 0 && barcodes[0].rawValue) {
                        setIsScanning(false); // Prevent multiple scans
                        onScan(barcodes[0].rawValue);
                        return;
                    }
                } catch (err) {
                    console.error('Barcode detection failed:', err);
                }
            }
            if (isScanning) {
                animationFrameId = requestAnimationFrame(detectBarcode);
            }
        };
        
        detectBarcode();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isScanning, onScan]);

    const handleSwitchCamera = () => {
        if (devices.length < 2) return;
        const currentIndex = devices.findIndex(d => d.deviceId === currentDeviceId);
        const nextIndex = (currentIndex + 1) % devices.length;
        setCurrentDeviceId(devices[nextIndex].deviceId);
    };

    return (
        <div className="fixed inset-0 bg-black flex flex-col justify-center items-center z-50 p-4">
            <div className="relative w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                <div className="absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
                    <div className="absolute top-1/2 left-1/2 w-[90%] h-[70%] -translate-x-1/2 -translate-y-1/2">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 shadow-[0_0_10px_2px_rgba(239,68,68,0.7)] animate-pulse"></div>
                    </div>
                </div>
                {devices.length > 1 && (
                     <button
                        onClick={handleSwitchCamera}
                        className="absolute bottom-4 right-4 p-3 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label="Switch camera"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                            <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/>
                            <path d="M13 5H20a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-5"/>
                            <path d="m18 15-3-3 3-3"/>
                            <path d="m6 9 3 3-3 3"/>
                        </svg>
                    </button>
                )}
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
