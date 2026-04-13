'use server';

import { apiClient } from './apiClient';

export async function unlinkResponsibleFromChild(childId: string, responsibleId: string) {
  try {
    const response = await apiClient({
      path: `/children/${childId}/responsible/${responsibleId}`,
      method: 'DELETE',
    });

    if (response.status === 204) {
      return { status: 204 };
    }

    const result = await response.json();
    return result;
  } catch (error: unknown) {
    console.error('Erro ao desvincular responsável:', error);
    return {
      status: 500,
      message: 'Erro interno no servidor. Tente novamente mais tarde.',
    };
  }
}
