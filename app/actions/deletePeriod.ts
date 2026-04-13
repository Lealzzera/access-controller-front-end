'use server';

import { apiClient } from './apiClient';

export async function deletePeriod(periodId: string) {
  try {
    const response = await apiClient({
      path: `/period/delete/${periodId}`,
      method: 'DELETE',
    });

    const result = await response.json();
    return result;
  } catch (error: unknown) {
    console.error('Erro ao deletar período:', error);
    return {
      status: 500,
      message: 'Erro interno no servidor. Tente novamente mais tarde.',
    };
  }
}
