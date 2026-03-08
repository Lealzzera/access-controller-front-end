'use server';

import { apiClient } from './apiClient';

export async function acceptSolicitation(solicitationId: string) {
  try {
    const response = await apiClient({
      path: `/solicitation/${solicitationId}/accept`,
      method: 'PATCH',
    });

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    return {
      status: 400,
      message: 'Erro ao aceitar solicitação.',
      error,
    };
  }
}
