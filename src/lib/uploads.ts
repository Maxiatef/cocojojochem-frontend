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
