'use client';

import Image from 'next/image';
import style from './style.module.css';
import imageError from '@/app/assets/error-image.png';

type CardInfoComponentProps = {
  name: string;
  period: string;
  grade: string;
  pictureUrl: string;
  onClickCard: (value: any) => void;
};

export default function CardInfoComponent({
  name,
  period,
  grade,
  pictureUrl,
  onClickCard,
}: CardInfoComponentProps) {
  return (
    <div className={style.cardContainer} onClick={onClickCard}>
      <div className={style.imageContainer}>
        {pictureUrl ? (
          <Image
            src={pictureUrl}
            width={300}
            height={300}
            alt={name}
            className={style.imgContent}
            priority
          />
        ) : (
          <Image
            src={imageError}
            width={300}
            height={300}
            alt={name}
            className={style.imgContent}
            priority
          />
        )}
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
          <span className={style.active}></span>
          Ativo
        </p>
      </div>
    </div>
  );
}
