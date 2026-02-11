'use server';

import { apiClient } from './apiClient';

export async function registerResponsible(formData: FormData) {
  try {
    console.log(formData);
    const response = await apiClient({
      path: '/responsible/register',
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
