'use server';

import { apiClient } from './apiClient';

type CreatePeriodType = {
  name: string;
  institutionId: string;
};

export async function createPeriod({ name, institutionId }: CreatePeriodType) {
  try {
    const response = await apiClient({
      path: '/period/create',
      method: 'POST',
      body: JSON.stringify({ name, institutionId }),
    });

    const result = await response.json();
    return result;
  } catch (error: unknown) {
    console.error('Erro ao criar período:', error);
    return {
      status: 500,
      message: 'Erro interno no servidor. Tente novamente mais tarde.',
    };
  }
}
