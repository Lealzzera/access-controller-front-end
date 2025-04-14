"use client";

import { useEffect } from "react";
import decodeToken from "../helpers/decodeToken";

export default function Home() {
  const saveUserIdInLocalStorage = async () => {
    const response = await fetch("api/getToken");
    const { value } = await response.json();

    const { sub } = await decodeToken(value);

    localStorage.setItem("user_id", JSON.stringify(sub));
  };

  useEffect(() => {
    saveUserIdInLocalStorage();
  }, []);

  return <div>homepage</div>;
}
