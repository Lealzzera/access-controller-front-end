"use server";

import { cookies } from "next/headers";

interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: number;
  data: {
    accessToken: string;
  };
}

export async function loginUser({
  email,
  password,
}: LoginData): Promise<LoginResponse> {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/auth/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    const cookieStore = await cookies();
    cookieStore.set("access_token", data.user.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 20,
    });

    return { data, status: response.status };
  } catch (error: any) {
    return error;
  }
}
