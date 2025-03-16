"use server";

import { cookies } from "next/headers";

interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: number;
  message?: string;
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

    if (data.statusCode !== 200) {
      return {
        status: data.statusCode,
        message: data.message || "Erro ao realizar login.",
      };
    }

    const cookieStore = await cookies();
    cookieStore.set("access_token", data.user.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 20, // 20 dias
    });

    return { status: 200 };
  } catch (error: unknown) {
    console.error("Erro ao realizar login:", error);
    return {
      status: 500,
      message: "Erro interno no servidor. Tente novamente mais tarde.",
    };
  }
}
