'use server';

import { apiClient } from './apiClient';

type getPreSignedUPloadURLBody = {
  folderName: string;
  fileName: string;
  fileType: string;
};

export async function getPreSignedUploadURL({
  folderName,
  fileName,
  fileType,
}: getPreSignedUPloadURLBody) {
  const body = JSON.stringify({ fileName: `${folderName}/${fileName}`, fileType });
  try {
    const response = await apiClient({
      path: `/s3/upload/get-presigned-url`,
      method: 'POST',
      body,
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
