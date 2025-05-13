'use server';

import { apiClient } from './apiClient';

export async function getPreSignedUploadURL(
  photoId: string,
  fileType: string | undefined,
  folder: string
) {
  try {
    const response = await apiClient({
      path: `/uploads/generate-presigned-url?fileName=${folder}/${photoId}&fileType=${fileType}`,
      method: 'GET',
    });

    const { url } = await response.json();

    return url;
  } catch (error: unknown) {
    console.error('Error to get the pre signed URL: ', error);
    return {
      status: 500,
      message: 'Internal server error. Try it again later.',
    };
  }
}
