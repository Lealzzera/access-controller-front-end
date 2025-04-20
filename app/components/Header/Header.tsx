"use client";
import { useUser } from "@/app/context/userContext";
import style from "./style.module.css";
import logout from "@/app/helpers/logout";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const { userInfo } = useUser();
  const [userName, setUserName] = useState<string | undefined>("");

  const logoutFunction = async () => {
    await logout();
    window.localStorage.clear();
    router.push("/");
  };

  useEffect(() => {
    setUserName(userInfo?.userInfo.name);
  }, [userInfo]);
  return (
    <header className={style.headerContainer}>
      <div className={style.wrappedContent}>
        <span>{userName}</span>
        <p onClick={logoutFunction}>SAIR</p>
      </div>
    </header>
  );
}
