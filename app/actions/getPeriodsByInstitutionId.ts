'use server';

import { apiClient } from './apiClient';

export async function getPeriodsByInstituionId(institutionId: string) {
  try {
    const response = await apiClient({
      path: `/period/${institutionId}`,
      method: 'GET',
    });

    const { periods } = await response.json();
    return periods;
  } catch (error: unknown) {
    console.error('Erro ao buscar os dados:', error);
    return {
      status: 500,
      message: 'Erro interno no servidor. Tente novamente mais tarde.',
    };
  }
}
