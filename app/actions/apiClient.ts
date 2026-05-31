import { cookies } from 'next/headers';

type ApiClientType = {
  path: string;
  method: string;
  headers?: HeadersInit | undefined;
  body?: BodyInit | null | undefined;
};

export async function apiClient({ path, method, headers, body }: ApiClientType) {
  const userTokenFromCookie = (await cookies()).get('access_token');
  const isFormData = body instanceof FormData;
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    throw new Error('BACKEND_URL environment variable is not configured.');
  }

  const url = `${backendUrl}${path}`;
  const response = await fetch(url, {
    method,
    headers: {
      ...headers,
      Authorization: userTokenFromCookie ? `Bearer: ${userTokenFromCookie.value}` : '',
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    },
    body,
    credentials: 'include',
  });

  return response;
}
