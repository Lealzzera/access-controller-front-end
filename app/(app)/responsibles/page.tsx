'use client';

import { useState } from 'react';
import ButtonComponent from '@/app/components/ButtonComponent/ButtonComponent';
import ModalResponsibleInfoComponent from '@/app/components/ModalResponsibleInfoComponent/ModalResponsibleInfoComponent';
import style from './styles.module.css';
import ModalRegisterResponsibleComponent from '@/app/components/ModalRegisterResponsibleComponent/ModalRegisterResponsibleComponent';

export default function Responsibles() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegisterModalOPen, setIsRegisterModalOpen] = useState(false);
  const [selectedResponsible, setSelectedResponsible] = useState(null);

  const handleOpenModalForNewResponsible = () => {
    setIsRegisterModalOpen(true);
  };

  return (
    <div className={style.responsiblesContainer}>
      <ModalRegisterResponsibleComponent
        isModalOpen={isRegisterModalOPen}
        setIsModalOpen={setIsRegisterModalOpen}
      />
      <div className={style.responsiblesTitleContainer}>
        <h1 className={style.responsiblesTitle}>Lista de responsáveis:</h1>
        <div>
          <ButtonComponent onClick={handleOpenModalForNewResponsible} buttonText="+" />
        </div>
      </div>
      <div
        style={{
          height: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p>Não há responsáveis cadastrados</p>
      </div>
      {/* <ul className={style.responsiblesList}>
        {mockResponsibleList.map((item) => (
          <li key={item.id}>a
            <CardInfoResponsibleComponent
              name={item.name}
              email={item.email}
              cpf={item.cpf}
              phoneNumber={item.phoneNumber}
              picture={item.picture}
              onClick={() => handleOpenModal(item)}
            />
          </li>
        ))}
      </ul> */}
      <ModalResponsibleInfoComponent
        isModalResponsibleInfoOpen={isModalOpen}
        setIsModalResponsibleInfoOpen={setIsModalOpen}
        responsibleInfo={selectedResponsible}
      />
    </div>
  );
}
