"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Role } from "../enums/Role.enum";
import { Responsible } from "../types/responsible.type";
import { Institution } from "../types/institution.type";
import { setUserInLocalStorage } from "../helpers/setUserInLocalStorage";
import { me } from "../actions/me";
import { getUserInfoById } from "../actions/getUserInfoById";

type User = {
  id: string;
  role: Role;
  userInfo: Responsible | Institution;
};

type UserContextType = {
  userInfo: User | undefined;
  setUserInfo: (user: User) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userInfo, setUserInfo] = useState<User | undefined>(undefined);

  const settingInitialUserConfig = async () => {
    const localStorage = window.localStorage.getItem("userData");
    if (localStorage) {
      const userInfoJson = JSON.parse(localStorage);
      setUserInfo({
        id: userInfoJson.userId,
        role: userInfoJson.userRole,
        userInfo: userInfoJson.userInfo,
      });
      return;
    }

    const { id, role } = await me();

    const { userData } = await getUserInfoById({
      id,
      role,
    });

    setUserInLocalStorage("userData", {
      userId: id,
      userRole: role,
      userInfo: userData,
    });

    setUserInfo({
      id: id,
      role: role,
      userInfo: userData,
    });
  };

  useEffect(() => {
    settingInitialUserConfig();
  }, []);

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used inside of a UserProvider");
  }

  return context;
}
