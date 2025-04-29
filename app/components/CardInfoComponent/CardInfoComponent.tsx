import Image from "next/image";
import style from "./style.module.css";

type CardInfoComponentProps = {
  name: string;
  period: string;
  grade: string;
  pictureUrl: string;
};

export default function CardInfoComponent({
  name,
  period,
  grade,
  pictureUrl,
}: CardInfoComponentProps) {
  return (
    <div className={style.cardContainer}>
      <div className={style.imageContainer}>
        <Image
          src={pictureUrl}
          width={300}
          height={300}
          alt={name}
          className={style.imgContent}
        />
      </div>
      <div className={style.infoContainer}>
        <p>
          <span className={style.titleInfo}>Nome: </span>
          {name}
        </p>
        <p>
          <span className={style.titleInfo}>Período: </span>
          {period}
        </p>
        <p>
          <span className={style.titleInfo}>Turma: </span>
          {grade}
        </p>
        <p className={style.statusContainer}>
          <span className={style.titleInfo}>Status: </span>
          <span className={style.active}></span>Ativo
        </p>
      </div>
    </div>
  );
}
