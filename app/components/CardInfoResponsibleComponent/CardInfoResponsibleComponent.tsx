'use client';

import Image from 'next/image';
import imageError from '@/app/assets/error-image.png';
import style from './styles.module.css';

type CardInfoResponsibleComponentProps = {
  name: string;
  email: string;
  cpf: string;
  phoneNumber: string;
  picture: string;
  onClick?: () => void;
};

export default function CardInfoResponsibleComponent({
  name,
  email,
  cpf,
  phoneNumber,
  picture,
  onClick,
}: CardInfoResponsibleComponentProps) {
  return (
    <div className={style.cardContainer} onClick={onClick}>
      <div className={style.imageContainer}>
        {picture ? (
          <Image
            className={style.imgContent}
            src={picture}
            width={300}
            height={300}
            alt={name}
            priority
          />
        ) : (
          <Image
            className={style.imgContent}
            src={imageError}
            width={300}
            height={300}
            alt={name}
            priority
          />
        )}
      </div>
      <div className={style.infoContainer}>
        <p>
          <span>Nome: </span>
          {name}
        </p>
        <p>
          <span>CPF: </span>
          {cpf}
        </p>
        <p>
          <span>Telefone: </span>
          {phoneNumber}
        </p>
      </div>
    </div>
  );
}
