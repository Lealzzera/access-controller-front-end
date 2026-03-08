'use server';

import { apiClient } from './apiClient';

export default async function getResponsibleById(responsibleId: string) {
  try {
    const response = await apiClient({
      path: `/responsible/${responsibleId}`,
      method: 'GET',
    });
    const responseJson = await response.json();
    return responseJson;
  } catch (err) {
    console.error('Error getting responsible by ID', err);
    throw err;
  }
}
