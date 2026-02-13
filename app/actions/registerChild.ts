'use server';

import { apiClient } from './apiClient';

export async function registerChild(formData: FormData) {
  try {
    const response = await apiClient({
      path: '/children/register',
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    return data;
  } catch (error: unknown) {
    console.error('Error to register:', error);
    return {
      status: 500,
      message: 'Internal error server, try it again later.',
    };
  }
}
