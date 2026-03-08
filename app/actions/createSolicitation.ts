'use server';

import { apiClient } from './apiClient';

type CreateSolicitationType = {
  type: 'DROP_OFF' | 'PICK_UP';
  childId: string;
};

export async function createSolicitation({ type, childId }: CreateSolicitationType) {
  try {
    const response = await apiClient({
      path: '/solicitation',
      method: 'POST',
      body: JSON.stringify({ type, childId }),
    });

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    return {
      status: 400,
      message: 'Erro ao criar solicitação.',
      error,
    };
  }
}
