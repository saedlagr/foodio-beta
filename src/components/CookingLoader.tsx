import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const processingMessages = [
  "Processing your image...",
  "Enhancing quality...",
  "Almost done..."
];

export const CookingLoader = ({ isUploading }: { isUploading: boolean }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isUploading) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % processingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isUploading]);

  if (!isUploading) return null;

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">
        {processingMessages[messageIndex]}
      </p>
    </div>
  );
};