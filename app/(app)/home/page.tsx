"use client";

import { me } from "@/app/actions/me";
import { setUserInLocalStorage } from "@/app/helpers/setUserInLocalStorage";
import { useEffect } from "react";

export default function Home() {
  const settingInitialUserConfig = async () => {
    const response = await me();
    setUserInLocalStorage(response);
  };

  useEffect(() => {
    settingInitialUserConfig();
  }, []);

  return <div></div>;
}
