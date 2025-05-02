'use server';

import { apiClient } from './apiClient';

interface UpdateChildData {
  id: string;
  name?: string;
  periodId?: string;
  gradeId?: string;
  institutionId?: string;
  picture?: string;
}

export async function updateChild({
  id,
  name,
  periodId,
  gradeId,
  institutionId,
  picture,
}: UpdateChildData): Promise<any> {
  try {
    const body = JSON.stringify({
      name,
      periodId,
      gradeId,
      institutionId,
      picture,
    });

    const response = await apiClient({
      path: `/children/${id}`,
      method: 'PATCH',
      body,
    });

    const data = await response.json();

    if (response.status !== 200) {
      return {
        status: data.statusCode,
        message: data.message || 'Erro ao atualizar os dados.',
      };
    }
    return {
      child: data.child,
      status: 200,
    };
  } catch (error: unknown) {
    console.error('Erro ao realizar login:', error);
    return {
      status: 500,
      message: 'Erro interno no servidor. Tente novamente mais tarde.',
    };
  }
}
