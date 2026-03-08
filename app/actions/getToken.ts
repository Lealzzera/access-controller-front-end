'use server';

import { cookies } from 'next/headers';

export async function getToken() {
  const token = (await cookies()).get('access_token');
  return token?.value ?? null;
}
