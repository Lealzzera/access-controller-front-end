'use server';

import { apiClient } from './apiClient';

type ConfigureInstitutionType = {
  institutionId: string;
  periods: string[];
  grades: string[];
};

export async function configureInstitution({
  institutionId,
  periods,
  grades,
}: ConfigureInstitutionType) {
  try {
    const response = await apiClient({
      path: '/institution/configure',
      method: 'POST',
      body: JSON.stringify({ institutionId, periods, grades }),
    });

    const result = await response.json();
    return result;
  } catch (error: unknown) {
    console.error('Erro ao configurar instituição:', error);
    return {
      status: 500,
      message: 'Erro interno no servidor. Tente novamente mais tarde.',
    };
  }
}
