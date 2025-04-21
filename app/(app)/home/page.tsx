"use client";

import CardInfoComponent from "@/app/components/CardInfoComponent/CardInfoComponent";
import style from "./style.module.css";

export default function Home() {
  return (
    <section className={style.container}>
      <div className={style.containerCard}>
        <CardInfoComponent />
      </div>{" "}
      <div className={style.containerCard}>
        <CardInfoComponent />
      </div>{" "}
      <div className={style.containerCard}>
        <CardInfoComponent />
      </div>{" "}
      <div className={style.containerCard}>
        <CardInfoComponent />
      </div>{" "}
      <div className={style.containerCard}>
        <CardInfoComponent />
      </div>{" "}
      <div className={style.containerCard}>
        <CardInfoComponent />
      </div>{" "}
      <div className={style.containerCard}>
        <CardInfoComponent />
      </div>{" "}
      <div className={style.containerCard}>
        <CardInfoComponent />
      </div>{" "}
      <div className={style.containerCard}>
        <CardInfoComponent />
      </div>{" "}
      <div className={style.containerCard}>
        <CardInfoComponent />
      </div>
    </section>
  );
}
