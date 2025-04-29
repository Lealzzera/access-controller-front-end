"use client";

import CardInfoComponent from "@/app/components/CardInfoComponent/CardInfoComponent";
import style from "./style.module.css";
import { useUser } from "@/app/context/userContext";
import { useEffect, useState } from "react";
import { getChildrenList } from "@/app/actions/getChildrenList";

type ChildrenDataType = {
  id: string;
  name: string;
  period: { id: string; name: string };
  grade: { id: string; name: string };
  picture: string;
};

export default function HomePage() {
  const { userInfo, registerModalOpen } = useUser();
  const [childrenData, setChildrenData] = useState<ChildrenDataType[]>([]);

  //TODO: FIX THIS METHOD TO GET CHILDLIST ACCORDING THE PAGE, CAUSE IT NEED A FILTER TO NOT LIST ALL KIDS FROM DB
  const getChildrenListByUserId = async () => {
    if (userInfo) {
      const response = await getChildrenList({
        userInfo: { id: userInfo.id, role: userInfo.role },
      });

      setChildrenData(response);
    }
  };

  useEffect(() => {
    getChildrenListByUserId();
  }, [userInfo]);

  useEffect(() => {
    if (!registerModalOpen) {
      getChildrenListByUserId();
    }
  }, [registerModalOpen]);

  return (
    <section className={style.container}>
      {childrenData &&
        childrenData.map((child) => (
          <div key={child.id} className={style.containerCard}>
            <CardInfoComponent
              name={child.name}
              period={child.period.name}
              grade={child.grade.name}
              pictureUrl={child.picture}
            />
          </div>
        ))}
    </section>
  );
}
