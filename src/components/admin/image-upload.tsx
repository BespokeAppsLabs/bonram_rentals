"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { useUploadFile, useFileUrl } from "@/hooks/use-files";
import { Id } from "../../../convex/_generated/dataModel";

// ============================================
// IMAGE UPLOAD COMPONENT
// For Admin Product Management
// ============================================

interface ImageUploadProps {
  productId?: Id<"products">;
  currentImageUrl?: string;
  currentStorageId?: Id<"_storage">;
  onImageUploaded?: (storageId: Id<"_storage">) => void;
  onImageUrlSet?: (url: string) => void;
  className?: string;
  accept?: string;
  maxSizeMB?: number;
}

export function ImageUpload({
  productId,
  currentImageUrl,
  currentStorageId,
  onImageUploaded,
  onImageUrlSet,
  className,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile } = useUploadFile();
  
  // Get URL from storage ID if available
  const storageUrl = useFileUrl(currentStorageId);
  const displayUrl = previewUrl || currentImageUrl || storageUrl;

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!accept.split(",").some((type) => file.type === type.trim())) {
      return "Invalid file type. Please upload a valid image file.";
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File is too large. Maximum size is ${maxSizeMB}MB.`;
    }

    return null;
  };

  // Handle file upload
  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // Validate
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload
      setIsUploading(true);
      try {
        const storageId = await uploadFile(file, productId);
        if (storageId) {
          onImageUploaded?.(storageId);
        } else {
          setError("Failed to upload image. Please try again.");
          setPreviewUrl(null);
        }
      } catch (err) {
        setError("Failed to upload image. Please try again.");
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
      }
    },
    [productId, uploadFile, onImageUploaded, maxSizeMB, accept]
  );

  // Drag handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  // File input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // Clear image
  const handleClear = () => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Open file picker
  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl transition-all duration-200",
          isDragging
            ? "border-gold bg-gold/5"
            : "border-gray-light hover:border-navy/50",
          displayUrl ? "p-4" : "p-8"
        )}
      >
        {displayUrl ? (
          // Show preview
          <div className="relative aspect-video rounded-lg overflow-hidden bg-mist">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayUrl}
              alt="Product image preview"
              className="w-full h-full object-cover"
            />
            
            {/* Overlay controls */}
            <div className="absolute inset-0 bg-navy/0 hover:bg-navy/40 transition-colors group">
              <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBrowse}
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Change
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  disabled={isUploading}
                  className="bg-white/90 hover:bg-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Uploading overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-navy/50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            )}
          </div>
        ) : (
          // Show upload prompt
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-mist flex items-center justify-center mb-4">
              {isUploading ? (
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray" />
              )}
            </div>
            
            <p className="text-charcoal font-medium mb-1">
              {isUploading ? "Uploading..." : "Drop image here"}
            </p>
            <p className="text-gray text-sm mb-4">
              or click to browse
            </p>
            
            <Button
              variant="outline"
              onClick={handleBrowse}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Browse Files
            </Button>
            
            <p className="text-xs text-gray mt-3">
              Max file size: {maxSizeMB}MB
            </p>
          </div>
        )}

        {/* Drag overlay */}
        {isDragging && !displayUrl && (
          <div className="absolute inset-0 bg-gold/10 rounded-xl flex items-center justify-center">
            <p className="text-gold font-medium">Drop image here</p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-2">
          <X className="w-4 h-4" />
          {error}
        </p>
      )}

      {/* External URL input (optional) */}
      {onImageUrlSet && (
        <div className="pt-3 border-t border-gray-light">
          <label className="block text-sm font-medium text-charcoal mb-2">
            Or enter image URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-light focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm"
              onChange={(e) => onImageUrlSet(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;