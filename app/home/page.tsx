"use client";

import { useEffect } from "react";
import { me } from "../actions/me";
import { setUserInLocalStorage } from "../helpers/setUserInLocalStorage";

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
