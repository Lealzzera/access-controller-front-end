'use server';

import { apiClient } from './apiClient';

interface UpdateResponsibleData {
  id: string;
  name?: string;
  password?: string;
  picture?: string;
}

export async function updateResponsible({
  id,
  name,
  password,
  picture,
}: UpdateResponsibleData): Promise<any> {
  try {
    const body = JSON.stringify({
      name,
      password,
      picture,
    });

    const response = await apiClient({
      path: `/responsible/${id}`,
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
