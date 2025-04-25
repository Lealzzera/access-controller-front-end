"use client";

import { useRef, useState } from "react";
import style from "./style.module.css";
import { useRouter } from "next/navigation";
import InputFieldComponent from "../InputFieldComponent/InputFieldComponent";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SelectComponent from "../SelectComponent/SelectComponent";

const periodOptions = [
  {
    id: 1,
    optionLabel: "Manhã",
  },
  {
    id: 2,
    optionLabel: "Tarde",
  },
  {
    id: 3,
    optionLabel: "Noite",
  },
];

export default function ModalRegisterComponent() {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [period, setPeriod] = useState("");
  const [grade, setGrade] = useState("");

  const modalContainer = useRef(null);
  const router = useRouter();

  const handleCloseModal = (event: any) => {
    if (event.target === modalContainer.current) router.back();
  };

  const handleRegister = (event: any) => {
    event;
    console.log(event);
  };

  return (
    <div
      onClick={handleCloseModal}
      ref={modalContainer}
      className={`${style.modalContainer}`}
    >
      <div className={style.modalContentWrapped}>
        <div className={style.closeButtonContainer}>
          <CloseRoundedIcon
            onClick={() => router.back()}
            fontSize="large"
            className={style.closeIcon}
          />
        </div>
        <div className={style.registerInformationText}>
          <h1 className={style.registerTitle}>Cadastrar criança</h1>
          <p className={style.registerDescription}>
            Vamos lá! Para cadastrar uma nova criança, basta inserir os dados
            abaixo.
          </p>
        </div>
        <form className={style.formContainer} action={handleRegister}>
          <InputFieldComponent
            idInput="name"
            inputLabel="Nome"
            setInputValue={setName}
            inputValue={name}
            inputType="text"
          />
          <InputFieldComponent
            idInput="cpf"
            inputLabel="CPF"
            setInputValue={setCpf}
            inputValue={cpf}
            inputType="text"
          />
          <SelectComponent
            selectId="period"
            selectLabel="Período"
            selectOptions={periodOptions}
            selectName="period"
          />
        </form>
      </div>
    </div>
  );
}
