"use server";

export interface LoginResponse {
  status: number;
  message?: string;
}

export default async function postPictureToS3(uploadUrl: string, file: File) {
  try {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-type": file.type,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error("Error to upload the content.");
    }

    return { status: 200 };
  } catch (error: unknown) {
    return {
      status: 500,
      message: "Internal server error. Try it again later.",
    };
  }
}
