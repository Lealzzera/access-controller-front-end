"use server";

import { apiClient } from "./apiClient";

export async function getGradesByInstituionId(institutionId: string) {
  try {
    const response = await apiClient({
      path: `/grade/${institutionId}`,
      method: "GET",
    });

    const { grades } = await response.json();
    return grades;
  } catch (error: unknown) {
    console.error("Erro ao buscar os dados:", error);
    return {
      status: 500,
      message: "Erro interno no servidor. Tente novamente mais tarde.",
    };
  }
}
