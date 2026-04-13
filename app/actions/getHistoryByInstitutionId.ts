'use server';

import { apiClient } from './apiClient';

type GetHistoryParams = {
  institutionId: string;
  dateFrom?: string;
  dateTo?: string;
};

export async function getHistoryByInstitutionId({
  institutionId,
  dateFrom,
  dateTo,
}: GetHistoryParams) {
  try {
    let path = `/history/institution/${institutionId}`;
    const params = new URLSearchParams();
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    if (params.toString()) path += `?${params.toString()}`;

    const response = await apiClient({ path, method: 'GET' });
    const data = await response.json();
    return data;
  } catch (error: unknown) {
    console.error('Erro ao buscar histórico:', error);
    return {
      status: 500,
      message: 'Erro interno no servidor. Tente novamente mais tarde.',
    };
  }
}
