'use server';

import { apiClient } from './apiClient';

type ResposniblesPaginatedType = {
  institutionId: string;
  cursor?: string;
  take?: number;
};

export async function getResponsiblesPaginated({
  institutionId,
  cursor,
  take,
}: ResposniblesPaginatedType) {
  try {
    const response = await apiClient({
      path: `/responsible?institutionId=${institutionId}&cursor=${cursor}&take=${take}`,
      method: 'GET',
    });

    const responsibleList = await response.json();
    return responsibleList;
  } catch (error: unknown) {
    return {
      status: 400,
      message: 'Erro ao buscar responsáveis.',
      error,
    };
  }
}
