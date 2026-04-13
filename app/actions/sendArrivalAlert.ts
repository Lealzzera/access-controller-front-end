'use server';

import { apiClient } from './apiClient';

export type ArrivalAlertMinutes = 'MINUTES_30' | 'MINUTES_15';

export async function sendArrivalAlert({
  minutes,
  childId,
}: {
  minutes: ArrivalAlertMinutes;
  childId: string;
}) {
  try {
    const response = await apiClient({
      path: '/solicitation/notify-arrival',
      method: 'POST',
      body: JSON.stringify({ minutes, childId }),
    });

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    return {
      status: 500,
      message: 'Erro ao enviar aviso de chegada.',
      error,
    };
  }
}
