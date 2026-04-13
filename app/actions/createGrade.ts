'use server';

import { apiClient } from './apiClient';

type CreateGradeType = {
  name: string;
  institutionId: string;
};

export async function createGrade({ name, institutionId }: CreateGradeType) {
  try {
    const response = await apiClient({
      path: '/grade/create',
      method: 'POST',
      body: JSON.stringify({ name, institutionId }),
    });

    const result = await response.json();
    return result;
  } catch (error: unknown) {
    console.error('Erro ao criar turma:', error);
    return {
      status: 500,
      message: 'Erro interno no servidor. Tente novamente mais tarde.',
    };
  }
}
