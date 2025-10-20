import React, { useEffect, useRef, useState } from 'react';

interface CameraCaptureProps {
    onCapture: (imageDataUrl: string) => void;
    onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;
        let isMounted = true;

        const startCamera = async () => {
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error('Camera API is not available in this browser.');
                }
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                });
                if (isMounted && videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            } catch (err) {
                console.error('Error accessing camera:', err);
                if (isMounted) {
                    if (err instanceof Error) {
                        if (err.name === 'NotAllowedError') {
                            setError('Camera permission denied. Please enable it in your browser settings.');
                        } else {
                            setError(`Error accessing camera: ${err.message}`);
                        }
                    } else {
                        setError('An unknown error occurred while accessing the camera.');
                    }
                }
            }
        };

        startCamera();

        return () => {
            isMounted = false;
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
                onCapture(imageDataUrl);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black flex flex-col justify-center items-center z-[60] p-4">
            <div className="relative w-full max-w-2xl aspect-video bg-slate-900 rounded-lg overflow-hidden shadow-2xl">
                <video ref={videoRef} className="w-full h-full object-cover" />
                {error && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
                        <p className="text-white text-center">{error}</p>
                    </div>
                )}
            </div>

            <div className="mt-6 flex items-center justify-center gap-16">
                <button
                    onClick={onClose}
                    className="px-6 py-2 rounded-lg bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleCapture}
                    disabled={!!error}
                    className="p-4 rounded-full bg-white hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Take Photo"
                >
                    <div className="w-12 h-12 rounded-full bg-indigo-600 border-4 border-white"></div>
                </button>
                 {/* Empty div for spacing */}
                <div className="w-[88px]"></div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default CameraCapture;