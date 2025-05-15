'use server';

import { apiClient } from './apiClient';

export async function getResponsibleListByChildId(childId: string) {
  try {
    const response = await apiClient({
      path: `/responsible/by-child-id/${childId}`,
      method: 'GET',
    });

    const responsibleList = await response.json();
    return responsibleList;
  } catch (error: unknown) {
    console.error('Erro ao buscar os dados:', error);
    return {
      status: 500,
      message: 'Erro interno no servidor. Tente novamente mais tarde.',
    };
  }
}
