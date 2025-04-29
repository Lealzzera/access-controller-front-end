"use server";

import { apiClient } from "./apiClient";

interface RegisterChildData {
  name: string;
  cpf: string;
  periodId: string;
  gradeId: string;
  birthDate: Date | null;
  institutionId: string;
}

export async function registerChild({
  name,
  cpf,
  periodId,
  gradeId,
  birthDate,
  institutionId,
}: RegisterChildData) {
  try {
    const body = JSON.stringify({
      name,
      cpf,
      periodId,
      gradeId,
      birthDate,
      institutionId,
    });

    const response = await apiClient({
      path: "/children/register",
      method: "POST",
      body,
    });

    const data = await response.json();

    if (response.status !== 201) {
      return {
        status: data.statusCode,
        message: data.message || "Error to register a child.",
      };
    }
    return { child: data.child, status: 200 };
  } catch (error: unknown) {
    console.error("Error to register:", error);
    return {
      status: 500,
      message: "Internal error server, try it again later.",
    };
  }
}
