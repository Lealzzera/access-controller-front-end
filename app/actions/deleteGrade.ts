'use server';

import { apiClient } from './apiClient';

export async function deleteGrade(gradeId: string) {
  try {
    const response = await apiClient({
      path: `/grade/delete/${gradeId}`,
      method: 'DELETE',
    });

    const result = await response.json();
    return result;
  } catch (error: unknown) {
    console.error('Erro ao deletar turma:', error);
    return {
      status: 500,
      message: 'Erro interno no servidor. Tente novamente mais tarde.',
    };
  }
}
