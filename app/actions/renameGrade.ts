'use server';

import { apiClient } from './apiClient';

export async function renameGrade(gradeId: string, name: string) {
  try {
    const response = await apiClient({
      path: `/institution/grade/${gradeId}`,
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });

    const result = await response.json();
    return result;
  } catch (error: unknown) {
    console.error('Erro ao renomear turma:', error);
    return {
      status: 500,
      message: 'Erro interno no servidor. Tente novamente mais tarde.',
    };
  }
}
