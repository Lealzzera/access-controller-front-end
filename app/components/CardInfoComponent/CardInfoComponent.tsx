'use client';

import Image, { StaticImageData } from 'next/image';
import style from './style.module.css';
import { useState } from 'react';
import imageError from '@/app/assets/error-image.png';

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
  const [imageSrc, setImageSrc] = useState<StaticImageData | string>(pictureUrl);

  return (
    <div className={style.cardContainer}>
      <div className={style.imageContainer}>
        <Image
          src={imageSrc}
          width={300}
          height={300}
          alt={name}
          className={style.imgContent}
          priority
          onError={() => setImageSrc(imageError)}
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
          <span className={style.active}></span>
          Ativo
        </p>
      </div>
    </div>
  );
}
