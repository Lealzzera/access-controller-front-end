"use server";

import { apiClient } from "./apiClient";

export async function getChildrenByResponsibleId(responsibleId: string) {
  try {
    const response = await apiClient({
      path: `/children/by-responsible-id/${responsibleId}`,
      method: "GET",
    });

    const { children } = await response.json();

    return children;
  } catch (error: unknown) {
    console.error("Erro ao buscar os dados:", error);
    return {
      status: 500,
      message: "Erro interno no servidor. Tente novamente mais tarde.",
    };
  }
}
