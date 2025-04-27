import imageCompression from "browser-image-compression";

export default async function compressFile(file: File): Promise<File> {
  const maxFileSizeMB = 1;
  const currentFileSizeMB = file.size / 1024 / 1024;

  if (currentFileSizeMB <= maxFileSizeMB) {
    return file;
  }

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 800,
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (err) {
    console.error("Error to compress image: ", err);
    return file;
  }
}
