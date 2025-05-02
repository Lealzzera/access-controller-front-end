'use client';

import { useUser } from '@/app/context/userContext';
import style from './style.module.css';
import { SyntheticEvent, useRef, useState } from 'react';
import InputFieldComponent from '../InputFieldComponent/InputFieldComponent';

export default function ModalRegisterResponsibleComponent() {
  const { registerResponsibleModalOpen, setRegisterResponsibleModalOpen } = useUser();

  const [responsibleName, setResponsibleName] = useState('');

  const modalBg = useRef<HTMLDivElement | null>(null);

  const handleClickOutSide = (event: SyntheticEvent) => {
    if (event.target !== modalBg.current) return;
    setRegisterResponsibleModalOpen(false);
  };

  return (
    <>
      {registerResponsibleModalOpen && (
        <div ref={modalBg} onClick={handleClickOutSide} className={style.registerModalBg}>
          <div className={style.registerModalContent}>
            <div>
              <h1 className={style.modalTitleMessage}>
                Agora vamos cadastrar um responsável para o <span>FULANO.</span>
              </h1>
            </div>
            <form>
              <InputFieldComponent
                idInput="name"
                inputLabel="Nome"
                inputType="text"
                inputValue={responsibleName}
                setInputValue={(event) => setResponsibleName(event)}
              />
              <InputFieldComponent
                idInput="name"
                inputLabel="Nome"
                inputType="text"
                inputValue={responsibleName}
                setInputValue={(event) => setResponsibleName(event)}
              />
              <InputFieldComponent
                idInput="name"
                inputLabel="Nome"
                inputType="text"
                inputValue={responsibleName}
                setInputValue={(event) => setResponsibleName(event)}
              />{' '}
              <InputFieldComponent
                idInput="name"
                inputLabel="Nome"
                inputType="text"
                inputValue={responsibleName}
                setInputValue={(event) => setResponsibleName(event)}
              />
            </form>
          </div>
        </div>
      )}
    </>
  );
}
