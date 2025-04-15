"use server";

import { apiClient } from "./apiClient";

export async function me() {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    const response = await apiClient({
      path: "/me",
      method: "GET",
      headers,
    });

    const { id, role } = await response.json();

    return { id, role };
  } catch (error: unknown) {
    console.error("Erro ao buscar os dados:", error);
    return {
      status: 500,
      message: "Erro interno no servidor. Tente novamente mais tarde.",
    };
  }
}
