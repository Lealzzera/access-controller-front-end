"use server";

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
export default async function logout() {
  await cookies().clear();
}
