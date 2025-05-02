'use server';

//TODO: FIX THIS REQUEST, NOW IT'S NOT BEING USED BUT IT'LL BE IN THE FUTURE.
import { apiClient } from './apiClient';

export async function getPresignedDownloadURL(files: string[]) {
  try {
    const body = JSON.stringify(files);
    const response = await apiClient({
      path: `/download/generate-presigned-url`,
      method: 'POST',
      body,
    });

    const url = await response.json();

    return url;
  } catch (error: unknown) {
    console.error('Error to get the pre signed URL: ', error);
    return {
      status: 500,
      message: 'Internal server error. Try it again later.',
    };
  }
}
