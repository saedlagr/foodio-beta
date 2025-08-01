import { Loader2 } from "lucide-react";

export const CookingLoader = ({ isUploading }: { isUploading: boolean }) => {
  if (!isUploading) return null;

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Processing...</p>
    </div>
  );
};