"use server";

import { Role } from "../enums/Role.enum";
import { UserInfoType } from "../types/userInfo.type";
import { apiClient } from "./apiClient";

const endpointByRole = {
  [Role.RESPONSIBLE]: (id: string) => `/responsible/${id}`,
  [Role.INSTITUTION]: (id: string) => `/institution/${id}`,
};

export async function getUserInfoById({
  id,
  role,
}: UserInfoType): Promise<any> {
  try {
    const endpoint = endpointByRole[role as Role];

    if (!endpoint) {
      return {
        status: 400,
        message: "Função não suportada para o role informado.",
      };
    }

    const response = await apiClient({
      path: endpoint(id),
      method: "GET",
    });

    const data = await response.json();

    const userData = data[role.toLowerCase()];
    return { userData };
  } catch (error: unknown) {
    console.error("Erro ao buscar os dados:", error);
    return {
      status: 500,
      message: "Erro interno no servidor. Tente novamente mais tarde.",
    };
  }
}
