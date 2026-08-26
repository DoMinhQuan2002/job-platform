"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ResumeUploadBoxProps {
  onUpload: (file: File) => Promise<void>;
  maxFilesCount?: number;
  currentCount?: number;
}

export const ResumeUploadBox: React.FC<ResumeUploadBoxProps> = ({
  onUpload,
  maxFilesCount = 5,
  currentCount = 0,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);

      if (currentCount >= maxFilesCount) {
        setError(`Bạn chỉ được phép tải lên tối đa ${maxFilesCount} CV.`);
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_SIZE) {
        setError("Dung lượng file vượt quá 10MB.");
        return;
      }

      try {
        setIsUploading(true);
        await onUpload(file);
        toast.success("Tải CV lên thành công!");
      } catch (err: any) {
        const errorMsg = err.message || "Tải lên thất bại. Vui lòng thử lại.";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload, currentCount, maxFilesCount]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  return (
    <div className="mb-8">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer
        ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-primary/40 bg-blue-50/30 hover:bg-blue-50/50 hover:border-primary/60"
        }`}
      >
        <input {...getInputProps()} />
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <CloudUpload className="w-8 h-8 text-primary" strokeWidth={1.5} />
        </div>
        <p className="text-lg font-medium text-foreground mb-2">
          Kéo và thả file PDF vào đây
        </p>
        <p className="text-sm text-muted-foreground mb-4">hoặc</p>
        
        {/* We use standard button but stopPropagation to allow clicking */}
        <Button 
          type="button" 
          disabled={isUploading}
          className="rounded-full px-6 bg-primary text-white hover:bg-primary-hover shadow-sm"
          onClick={(e) => {
            // Dropzone handles click implicitly on the wrapper, 
            // but if button is clicked, we just let dropzone do its thing
            // or explicitly open it if needed. Dropzone root wrapper handles it.
          }}
        >
          {isUploading ? "Đang tải lên..." : "Chọn file từ máy tính"}
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Định dạng: PDF. Dung lượng tối đa: 10MB
        </p>
      </div>
      
      {error && (
        <div className="mt-3 flex items-center text-sm text-destructive">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}
    </div>
  );
};
