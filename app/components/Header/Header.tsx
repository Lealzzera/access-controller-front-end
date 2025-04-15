"use client";
import style from "./style.module.css";
import logout from "@/app/helpers/logout";
import { useRouter } from "next/navigation";

type HeaderProps = {
  userName?: string;
};

export default function Header({ userName }: HeaderProps) {
  const router = useRouter();

  const logoutFunction = async () => {
    await logout();
    window.localStorage.clear();
    router.push("/");
  };
  return (
    <header className={style.headerContainer}>
      <div></div>
      <span>Teste teste teste da silva</span>
      <p onClick={logoutFunction}>SAIR</p>
    </header>
  );
}
