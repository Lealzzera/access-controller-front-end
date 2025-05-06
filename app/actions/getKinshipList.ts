'use server';

import { apiClient } from './apiClient';

export async function getKinshipList() {
  try {
    const response = await apiClient({
      path: '/kinship',
      method: 'GET',
    });

    const {kinship} = await response.json();
    
    return kinship
  } catch (error: unknown) {
    console.error('Erro ao buscar os dados:', error);
    return {
      status: 500,
      message: 'Erro interno no servidor. Tente novamente mais tarde.',
    };
  }
}
