import { useState, useRef, useEffect } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FaceDetectionProps {
  onDetected: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function FaceDetection({
  onDetected,
  isOpen,
  onClose,
}: FaceDetectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Error accessing camera:", err);
        });
    }
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [isOpen]);

  const handleVerify = () => {
    setIsLoading(true);
    // Simulate face detection
    setTimeout(() => {
      setIsLoading(false);
      onDetected();
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Face Verification</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-2 border-primary rounded-lg" />
          </div>
          <Button
            onClick={handleVerify}
            className="w-full"
            disabled={isLoading}
          >
            <Camera className="mr-2 h-4 w-4" />
            {isLoading ? "Verifying..." : "Verify Face"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
