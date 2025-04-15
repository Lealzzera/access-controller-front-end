"use server";

import { cookies } from "next/headers";
import { apiClient } from "./apiClient";

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
    const headers = {
      "Content-Type": "application/json",
    };

    const body = JSON.stringify({ email, password });

    const response = await apiClient({
      path: "/auth/sessions",
      method: "POST",
      headers,
      body,
    });

    const data = await response.json();

    if (data.statusCode !== 200) {
      return {
        status: data.statusCode,
        message: data.message || "Erro ao realizar login.",
      };
    }

    const cookieFromResponse = response.headers.get("set-cookie")?.split(";");
    if (cookieFromResponse) {
      const tokenFromCookie = cookieFromResponse[0].split("=")[1];
      const maxAge = cookieFromResponse[1].split("=")[1];

      const cookieStore = await cookies();
      cookieStore.set("access_token", tokenFromCookie, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: Number(maxAge),
      });
    }

    return { status: 200 };
  } catch (error: unknown) {
    console.error("Erro ao realizar login:", error);
    return {
      status: 500,
      message: "Erro interno no servidor. Tente novamente mais tarde.",
    };
  }
}
