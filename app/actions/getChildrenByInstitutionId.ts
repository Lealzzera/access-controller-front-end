"use server";

import { apiClient } from "./apiClient";

export async function getChildrenByInstitutionId(
  institutionId: string,
  page?: number
) {
  try {
    const response = await apiClient({
      path: `/children?institutionId=${institutionId}${
        page ? `&page=${page}` : ""
      }&limit=10`,
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
