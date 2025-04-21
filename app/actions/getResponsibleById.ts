"use server";

import { apiClient } from "./apiClient";

export async function getResponsibleById(responsibleId: string) {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    const response = await apiClient({
      path: `/responsible/${responsibleId}`,
      method: "GET",
      headers,
    });

    const { responsible } = await response.json();

    return { responsible };
  } catch (error: unknown) {
    console.error("Erro ao buscar os dados:", error);
    return {
      status: 500,
      message: "Erro interno no servidor. Tente novamente mais tarde.",
    };
  }
}
