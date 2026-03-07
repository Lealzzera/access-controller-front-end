'use server';

import { apiClient } from './apiClient';

type GetChildrenListType = {
  cursor?: string;
  institutionId: string;
  take?: number;
  active?: boolean;
};

export async function getChildrenList({
  cursor,
  institutionId,
  take,
  active,
}: GetChildrenListType) {
  try {
    const response = await apiClient({
      method: 'GET',
      path: `/children?institutionId=${institutionId}${cursor ? `&cursor=${cursor}` : ''}${take ? `&take=${take}` : '&take=20'}${active ? `&active=${active}` : ''}`,
    });
    const responseJson = await response.json();
    return responseJson;
  } catch (error: unknown) {
    console.error('Erro ao buscar os dados:', error);
    return {
      status: 500,
      message: 'Erro interno no servidor. Tente novamente mais tarde.',
    };
  }
}
