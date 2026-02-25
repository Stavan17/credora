import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';

const SelfieCapture = ({ onCapture, preview }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [captured, setCaptured] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup: stop camera when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      setError('');
      setIsCapturing(true);
      console.log('🎥 Starting camera...');
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('❌ Camera API not available');
        throw new Error('Camera API not supported in this browser');
      }
      
      console.log('✅ Camera API available, requesting access...');
      
      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Front-facing camera for selfie
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      console.log('✅ Camera access granted, stream received:', mediaStream);
      console.log('📹 Video tracks:', mediaStream.getVideoTracks());
      
      setStream(mediaStream);
      
      // Wait a bit for React to update the ref
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Wait for video element to be ready
      if (videoRef.current) {
        console.log('📺 Video element found, attaching stream...');
        videoRef.current.srcObject = mediaStream;
        setVideoReady(false);
        
        // Wait for video to load metadata
        await new Promise((resolve) => {
          if (videoRef.current) {
            const handleLoadedMetadata = () => {
              console.log('📊 Video metadata loaded');
              if (videoRef.current) {
                console.log('▶️ Attempting to play video...');
                videoRef.current.play()
                  .then(() => {
                    console.log('✅ Video playing successfully');
                    console.log('📐 Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
                    setVideoReady(true);
                    resolve();
                  })
                  .catch((playErr) => {
                    console.error('❌ Error playing video:', playErr);
                    setError('Unable to start video. Please try again.');
                    setVideoReady(false);
                    resolve();
                  });
              }
            };
            
            const handleCanPlay = () => {
              console.log('✅ Video can play');
              if (videoRef.current && !videoReady) {
                setVideoReady(true);
              }
            };
            
            videoRef.current.onloadedmetadata = handleLoadedMetadata;
            videoRef.current.oncanplay = handleCanPlay;
            
            // Fallback: if metadata already loaded
            if (videoRef.current.readyState >= 1) {
              console.log('📊 Video already has metadata, readyState:', videoRef.current.readyState);
              handleLoadedMetadata();
            }
            
            // Timeout fallback
            setTimeout(() => {
              if (!videoReady && videoRef.current && videoRef.current.readyState >= 2) {
                console.log('⏰ Timeout fallback: Video ready, forcing play');
                videoRef.current.play()
                  .then(() => setVideoReady(true))
                  .catch(err => console.error('Play failed:', err));
                resolve();
              }
            }, 2000);
          } else {
            console.error('❌ Video ref is null');
            setError('Video element not found. Please refresh the page.');
            resolve();
          }
        });
      } else {
        console.error('❌ Video ref is null after stream received');
        setError('Video element not ready. Please try again.');
      }
    } catch (err) {
      console.error('❌ Error accessing camera:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      
      let errorMessage = 'Unable to access camera. ';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += 'Please grant camera permissions and try again.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera found. Please connect a camera and try again.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage += 'Camera is being used by another application.';
      } else {
        errorMessage += err.message || 'Please ensure camera permissions are granted.';
      }
      
      setError(errorMessage);
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCapturing(false);
      setVideoReady(false);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref not available');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Check if video is ready
    if (video.readyState < 2) {
      setError('Video not ready. Please wait a moment and try again.');
      return;
    }
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    
    // Draw video frame to canvas (mirror it back for the final image)
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.scale(-1, 1); // Flip horizontally
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        // Create a File object from blob
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
        setCaptured(true);
        onCapture(file);
        stopCamera();
      } else {
        setError('Failed to capture image. Please try again.');
      }
    }, 'image/jpeg', 0.9);
  };

  const retakePhoto = () => {
    setCaptured(false);
    startCamera();
  };

  // If preview exists (from parent), show it
  if (preview && !stream && captured) {
    return (
      <div className="relative">
        <div className="border-2 border-green-300 bg-green-50 rounded-xl p-4">
          <img
            src={preview}
            alt="Captured selfie"
            className="w-full h-64 object-cover rounded-lg mb-3"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-600" size={20} />
              <p className="text-sm font-medium text-green-800">Selfie captured</p>
            </div>
            <button
              type="button"
              onClick={retakePhoto}
              className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Retake
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {!stream && !captured && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <Camera className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Capture Live Selfie</h3>
          <p className="text-sm text-gray-600 mb-4">
            Click below to start your camera and capture a live selfie
          </p>
          {!navigator.mediaDevices && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                ⚠️ Camera access requires HTTPS. If testing locally, use <code className="bg-yellow-100 px-1 rounded">localhost</code> or enable HTTPS.
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={startCamera}
            disabled={isCapturing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCapturing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Starting...
              </>
            ) : (
              <>
                <Camera size={20} />
                Start Camera
              </>
            )}
          </button>
        </div>
      )}

      {stream && !captured && (
        <div className="relative">
          <div className="border-2 border-blue-300 rounded-xl overflow-hidden bg-black relative" style={{ minHeight: '300px' }}>
            {!videoReady && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-white text-sm">Starting camera...</p>
                </div>
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto block"
              style={{ 
                maxHeight: '500px',
                minHeight: '300px',
                width: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)', // Mirror the video for selfie view
                display: videoReady ? 'block' : 'none',
                backgroundColor: '#000'
              }}
              onLoadedMetadata={() => {
                console.log('📊 onLoadedMetadata fired');
                if (videoRef.current) {
                  videoRef.current.play().catch(err => console.error('Play error:', err));
                }
              }}
              onCanPlay={() => {
                console.log('✅ onCanPlay fired');
                setVideoReady(true);
              }}
              onPlay={() => {
                console.log('▶️ onPlay fired');
                setVideoReady(true);
              }}
              onError={(e) => {
                console.error('❌ Video error:', e);
                setError('Video playback error. Please try again.');
              }}
            />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                <div className="bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                  Live Camera
                </div>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="bg-black/50 text-white p-2 rounded-lg hover:bg-black/70 transition pointer-events-auto"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={stopCamera}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={capturePhoto}
              disabled={!videoReady}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera size={20} />
              {videoReady ? 'Capture Photo' : 'Loading...'}
            </button>
          </div>
        </div>
      )}

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default SelfieCapture;
