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
  const { userInfo } = useUser();
  const [childrenData, setChildrenData] = useState<ChildrenDataType[]>([]);

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

  return (
    <section className={style.container}>
      {childrenData.map((child) => (
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
