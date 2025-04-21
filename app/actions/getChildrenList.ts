"use server";

import { Role } from "../enums/Role.enum";
import { apiClient } from "./apiClient";

type UserInfoType = {
  role: Role;
  id: string;
};

type GetChildrenListType = {
  userInfo: UserInfoType;
  page?: number;
};

export async function getChildrenList({ userInfo, page }: GetChildrenListType) {
  try {
    if (userInfo.role === Role.INSTITUTION) {
      const response = await apiClient({
        path: `/children?institutionId=${userInfo.id}${
          page ? `&page=${page}` : ""
        }&limit=10`,
        method: "GET",
      });

      const { children } = await response.json();

      return children;
    }
    if (userInfo.role === Role.RESPONSIBLE) {
      const response = await apiClient({
        path: `/children/by-responsible-id/${userInfo.id}`,
        method: "GET",
      });

      const { children } = await response.json();

      return children;
    }
  } catch (error: unknown) {
    console.error("Erro ao buscar os dados:", error);
    return {
      status: 500,
      message: "Erro interno no servidor. Tente novamente mais tarde.",
    };
  }
}
