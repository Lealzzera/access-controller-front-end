'use server';

import { apiClient } from './apiClient';

type ChildrenPaginatedType = {
  institutionId: string;
  cursor?: string;
  take?: number;
};

export async function getChildrenPaginated({ institutionId, cursor, take }: ChildrenPaginatedType) {
  try {
    let path = `/children?institutionId=${institutionId}&take=${take}`;
    if (cursor) path += `&cursor=${cursor}`;

    const response = await apiClient({
      path,
      method: 'GET',
    });

    const childrenList = await response.json();
    return childrenList;
  } catch (error: unknown) {
    return {
      status: 400,
      message: 'Erro ao buscar crianças.',
      error,
    };
  }
}
