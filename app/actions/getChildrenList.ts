"use server";

import { Role } from "../enums/Role.enum";
import { UserInfoType } from "../types/userInfo.type";
import { apiClient } from "./apiClient";

type GetChildrenListType = {
  userInfo: UserInfoType;
  page?: number;
};

const getEndpointByRole = {
  [Role.INSTITUTION]: (id: string, page?: number) =>
    `/children?institutionId=${id}${page ? `&page=${page}` : ""}&limit=30`,
  [Role.RESPONSIBLE]: (id: string) => `/children/by-responsible-id/${id}`,
};

export async function getChildrenList({ userInfo, page }: GetChildrenListType) {
  try {
    const currentEndpoint = getEndpointByRole[userInfo.role];
    if (!currentEndpoint) {
      return {
        status: 400,
        message: "Invalid Role to get the actual endpoint.",
      };
    }

    const endpoint = currentEndpoint(userInfo.id, page);
    const response = await apiClient({ path: endpoint, method: "GET" });

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
