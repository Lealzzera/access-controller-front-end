'use server';

import { apiClient } from './apiClient';

export const getChildById = async (childId: string) => {
  try {
    const response = await apiClient({
      path: `/children/${childId}`,
      method: 'GET',
    });
    const data = await response.json();

    return data;
  } catch (error: unknown) {
    console.error('Erro ao buscar a criança:', error);
    return {
      status: 500,
      message: 'Erro interno no servidor. Tente novamente mais tarde.',
    };
  }
};
