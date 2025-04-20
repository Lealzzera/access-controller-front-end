"use server";

import { apiClient } from "./apiClient";

export async function getInstitutionById(institutionId: string) {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    const param = new URLSearchParams({
      institutionId,
    });

    const response = await apiClient({
      path: `/institution/?institutionId=${param.get("institutionId")}`,
      method: "GET",
      headers,
    });

    const { institution } = await response.json();

    return { institution };
  } catch (error: unknown) {
    console.error("Erro ao buscar os dados:", error);
    return {
      status: 500,
      message: "Erro interno no servidor. Tente novamente mais tarde.",
    };
  }
}
