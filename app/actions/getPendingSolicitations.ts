'use server';

import { apiClient } from './apiClient';

export async function getPendingSolicitations(institutionId: string) {
  try {
    const response = await apiClient({
      path: `/solicitation/pending/${institutionId}`,
      method: 'GET',
    });

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    return {
      status: 400,
      message: 'Erro ao buscar solicitações pendentes.',
      error,
    };
  }
}
