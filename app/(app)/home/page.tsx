"use client";

import CardInfoComponent from "@/app/components/CardInfoComponent/CardInfoComponent";
import style from "./style.module.css";
import { useUser } from "@/app/context/userContext";
import { useEffect, useState } from "react";
import { getChildrenByResponsibleId } from "@/app/actions/getChildrenByResponsibleId";
import { Role } from "@/app/enums/Role.enum";
import { getChildrenByInstitutionId } from "@/app/actions/getChildrenByInstitutionId";

type ChildrenDataType = {
  id: string;
  name: string;
  period: string;
  teacher: string;
};

export default function Home() {
  const { userInfo } = useUser();
  const [childrenData, setChildrenData] = useState<ChildrenDataType[]>([]);

  const getChildrenByUserId = async () => {
    if (userInfo) {
      const response = await getChildrenByResponsibleId(userInfo?.id);
      setChildrenData(response);
    }
  };

  const getChildrenInfoByInstitutionId = async () => {
    if (userInfo) {
      const response = await getChildrenByInstitutionId(userInfo.id);
      setChildrenData(response);
    }
  };

  useEffect(() => {
    if (userInfo?.role === Role.RESPONSIBLE) {
      getChildrenByUserId();
    }

    if (userInfo?.role === Role.INSTITUTION) {
      getChildrenInfoByInstitutionId();
    }
  }, [userInfo]);

  return (
    <section className={style.container}>
      {childrenData.map((item) => (
        <div key={item.id} className={style.containerCard}>
          <CardInfoComponent
            name={item.name}
            period={item.period === "AFTERNOON" ? "Tarde" : "Manhã"}
            teacher={item.teacher}
          />
        </div>
      ))}
    </section>
  );
}
