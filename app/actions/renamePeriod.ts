'use server';

import { apiClient } from './apiClient';

export async function renamePeriod(periodId: string, name: string) {
  try {
    const response = await apiClient({
      path: `/institution/period/${periodId}`,
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });

    const result = await response.json();
    return result;
  } catch (error: unknown) {
    console.error('Erro ao renomear período:', error);
    return {
      status: 500,
      message: 'Erro interno no servidor. Tente novamente mais tarde.',
    };
  }
}
