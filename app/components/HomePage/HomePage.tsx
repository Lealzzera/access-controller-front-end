"use client"

import CardInfoComponent from "@/app/components/CardInfoComponent/CardInfoComponent";
import style from "./style.module.css";
import { useUser } from "@/app/context/userContext";
import { useEffect, useState } from "react";
import { getChildrenList } from "@/app/actions/getChildrenList";
import { PERIOD } from "@/app/enums/Period.enum";

type ChildrenDataType = {
    id: string;
    name: string;
    period: string;
    teacher: string;
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
      {childrenData.map((item) => (
        <div key={item.id} className={style.containerCard}>
          <CardInfoComponent
            name={item.name}
            period={item.period === PERIOD.TARDE ? "Tarde" : "Manhã"}
            teacher={item.teacher}
          />
        </div>
      ))}
    </section>
  );
}