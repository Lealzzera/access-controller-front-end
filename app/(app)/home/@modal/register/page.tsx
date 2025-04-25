"use client";
import { useRouter } from "next/navigation";

export default function RegisterModal() {
  const router = useRouter();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 100,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
        }}
      >
        <h1>Modal de Registro</h1>
        <button onClick={() => router.back()}>Fechar</button>
      </div>
    </div>
  );
}
