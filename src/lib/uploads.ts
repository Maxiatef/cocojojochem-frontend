import { getToken } from './auth';
import { ApiError } from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
    url: string;
    path: string;
  };
}

// Mirrors the real cocojojo.com upload endpoints exactly: multipart upload to
// a purpose-specific route, returning an absolute, ready-to-use image URL
// (the backend already builds the full URL via BASE_URL — no origin-joining needed here).
async function upload(endpoint: string, file: File): Promise<string> {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/uploads/${endpoint}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message || 'Upload failed');
  }

  const body: UploadResponse = await res.json();
  return body.data.url;
}

export const uploadProductImage = (file: File) => upload('product-image', file);
export const uploadVariantImage = (file: File) => upload('variant-image', file);
export const uploadCategoryImage = (file: File) => upload('category-image', file);

interface MultipleUploadResponse {
  success: boolean;
  message: string;
  data: { filename: string; originalName: string; size: number; mimetype: string; url: string; path: string }[];
}

// For the product image gallery — uploads several files in one request to
// POST /uploads/multiple-images (subfolder defaults to "gallery" server-side),
// returning each file's ready-to-use local URL in the same order they were sent.
export async function uploadMultipleProductImages(files: File[]): Promise<string[]> {
  const token = getToken();
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const res = await fetch(`${API_URL}/uploads/multiple-images`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message || 'Upload failed');
  }

  const body: MultipleUploadResponse = await res.json();
  return body.data.map((f) => f.url);
}
