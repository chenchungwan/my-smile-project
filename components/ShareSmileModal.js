
import React, { useState, useRef } from "react";
import { UploadFile, InvokeLLM } from "@/integrations/Core";
import { SharedSmile } from "@/entities/SharedSmile";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImagePlus, Camera, Send, Loader2, AlertCircle, X } from "lucide-react";
import { motion } from "framer-motion";

export default function ShareSmileModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: choose method, 2: preview & description
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const resetModal = () => {
    setStep(1);
    setImageFile(null);
    setPreviewUrl(null);
    setDescription("");
    setError(null);
    setShowCamera(false);
    stopCamera();
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setStep(2);
      setError(null);
    } else {
      setError("Please select a valid image file.");
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraReady(true);
      setShowCamera(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please try uploading a file instead.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !isCameraReady) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      stopCamera();
      setStep(2);
    }, 'image/jpeg', 0.8);
  };

  const handleSubmit = async () => {
    if (!imageFile || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Get location
      const location = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });
      const { latitude, longitude } = location.coords;

      // 2. Reverse-geocode to get location name
      const geocodeResponse = await InvokeLLM({
        prompt: `Provide the city, state/region, and country for the following coordinates: latitude ${latitude}, longitude ${longitude}.`,
        response_json_schema: {
          type: "object",
          properties: {
            city: { type: "string" },
            region: { type: "string" },
            country: { type: "string" },
          },
        },
      });
      const locationName = [geocodeResponse.city, geocodeResponse.region, geocodeResponse.country]
        .filter(Boolean)
        .join(", ");

      // 3. Upload image
      const { file_url } = await UploadFile({ file: imageFile });

      // 4. Create SharedSmile record
      await SharedSmile.create({
        image_url: file_url,
        description: description || "A beautiful smile",
        latitude,
        longitude,
        location_name: locationName,
      });

      // 5. Success
      resetModal();
      onSuccess();
      onClose();

    } catch (err) {
      console.error("Error sharing smile:", err);
      setError("Could not share your smile. Please check location permissions and try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            💖 Share a Smile
          </DialogTitle>
        </DialogHeader>

        {step === 1 && !showCamera && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-gray-600 text-sm text-center">
              Add a photo from...
            </p>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-28 flex-col gap-2 border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700"
                onClick={startCamera}
              >
                <Camera className="w-8 h-8 text-gray-600" />
                <span className="text-sm font-medium">Camera</span>
              </Button>

              <Button
                variant="outline"
                className="h-28 flex-col gap-2 border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="w-8 h-8 text-gray-600" />
                <span className="text-sm font-medium">Photos</span>
              </Button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-100 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <p>{error}</p>
              </div>
            )}
          </motion.div>
        )}

        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
              {!isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                    Loading camera...
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={stopCamera}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={capturePhoto}
                disabled={!isCameraReady}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Camera className="w-4 h-4 mr-2" />
                Capture
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="aspect-square rounded-lg overflow-hidden">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <Textarea
                placeholder="Add a caption... (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white/80"
                rows={3}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-100 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <p>{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sharing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Share
                  </div>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
