'use server';

import { apiClient } from './apiClient';

interface RegisterResponsibleData {
  institutionId: string;
  childId: string;
  name: string;
  email: string;
  password: string;
  cpf: string;
  kinshipId: string;
}

export async function registerResponsible({
  institutionId, childId, name, email, password, cpf, kinshipId}: RegisterResponsibleData) {
  try {
    const body = JSON.stringify({institutionId, childId, name, email, password, cpf, kinshipId});

    const response = await apiClient({
      path: '/responsible/register',
      method: 'POST',
      body,
    });

    const data = await response.json();

    return data;
  } catch (error: unknown) {
    console.error('Error to register:', error);
    return {
      status: 500,
      message: 'Internal error server, try it again later.',
    };
  }
}
