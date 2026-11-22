import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertTriangle, Upload, Eye, Image as ImageIcon } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  areaTitle: string;
  guidanceText: string;
  onClose: () => void;
  onPhotoCaptured: (dataUrl: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  areaTitle,
  guidanceText,
  onClose,
  onPhotoCaptured,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLightingGood, setIsLightingGood] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, capturedImage]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(
        'Direct camera access unavailable. You can use your device file/gallery picker to snap or upload a photo.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    // Simple luminance/brightness check
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let totalBrightness = 0;
      for (let i = 0; i < imgData.data.length; i += 40) {
        const r = imgData.data[i];
        const g = imgData.data[i + 1];
        const b = imgData.data[i + 2];
        totalBrightness += (r + g + b) / 3;
      }
      const avgBrightness = totalBrightness / (imgData.data.length / 40);
      setIsLightingGood(avgBrightness > 35 && avgBrightness < 240);
    } catch {
      setIsLightingGood(true);
    }

    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onPhotoCaptured(capturedImage);
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCapturedImage(result);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-stone-900 text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-stone-800">
        {/* Header */}
        <div className="px-5 py-3.5 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">{areaTitle}</h3>
              <p className="text-[10px] text-stone-400">Visual Clinical Screening</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-800 rounded-full text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guidance Prompt */}
        <div className="px-5 py-2 bg-stone-800/60 border-b border-stone-800 text-[11px] text-stone-300 flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>{guidanceText}</span>
        </div>

        {/* Camera Viewfinder / Preview */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] overflow-hidden">
          {capturedImage ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <img
                src={capturedImage}
                alt="Captured visual"
                className="w-full h-auto max-h-[360px] object-contain"
              />
              {!isLightingGood && (
                <div className="absolute top-3 left-3 right-3 p-2 bg-amber-900/80 border border-amber-600 rounded-xl text-amber-200 text-[10px] font-semibold flex items-center gap-1.5 backdrop-blur-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Low lighting detected. Ensure adequate light before proceeding.</span>
                </div>
              )}
            </div>
          ) : cameraError ? (
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
                {cameraError}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 mx-auto"
              >
                <Upload className="w-4 h-4" />
                <span>Snap or Upload Photo</span>
              </button>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Guide Overlay Frame */}
              <div className="absolute inset-8 border-2 border-dashed border-emerald-400/60 rounded-3xl pointer-events-none flex items-center justify-center">
                <span className="text-[10px] uppercase font-bold text-emerald-300 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                  Frame area here
                </span>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Controls Footer */}
        <div className="p-4 bg-stone-900 border-t border-stone-800 flex items-center justify-between">
          {capturedImage ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Save Photograph</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-1.5"
                title="Upload from device gallery"
              >
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Gallery</span>
              </button>

              <button
                type="button"
                onClick={handleCapturePhoto}
                disabled={Boolean(cameraError)}
                className="w-14 h-14 rounded-full bg-white hover:bg-stone-200 border-4 border-stone-400 flex items-center justify-center shadow-lg transition-all active:scale-90 mx-auto"
                title="Take photo"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-600" />
              </button>

              <div className="w-12" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
