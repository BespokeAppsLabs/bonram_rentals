"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// ============================================
// FILE STORAGE HOOKS
// ============================================

/**
 * Hook to get a file upload URL
 * Use this to upload files to Convex storage
 */
export function useUploadFile() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const setImage = useMutation(api.products.setImage);

  const uploadFile = async (
    file: File,
    productId?: Id<"products">
  ): Promise<Id<"_storage"> | null> => {
    try {
      // Step 1: Get a short-lived upload URL
      const uploadUrl = await generateUploadUrl();

      // Step 2: POST the file to the URL
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error(`Upload failed: ${result.statusText}`);
      }

      // Step 3: Get the storage ID from the response
      const { storageId } = await result.json();

      // Step 4: If productId provided, associate with product
      if (productId) {
        await setImage({ id: productId, imageStorageId: storageId });
      }

      return storageId;
    } catch (error) {
      console.error("File upload error:", error);
      return null;
    }
  };

  return { uploadFile };
}

/**
 * Hook to get a file URL from storage ID
 */
export function useFileUrl(storageId: Id<"_storage"> | undefined) {
  const url = useQuery(
    api.files.getFileUrl,
    storageId ? { storageId } : "skip"
  );
  
  return url;
}

/**
 * Hook to delete a file
 */
export function useDeleteFile() {
  const deleteFile = useMutation(api.files.deleteFile);
  return { deleteFile };
}