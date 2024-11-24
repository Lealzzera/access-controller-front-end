"use client";

import { useState } from "react";
import InputFieldComponent from "../InputFieldComponent/InputFieldComponent";
import {
  ButtonContainer,
  CreateAccountLink,
  ForgotPassowordText,
  InfoContainer,
  LoginPageContainer,
  LoginPageForm,
  LoginTitle,
  WrappedFields,
} from "./styles";
import ButtonComponent from "../ButtonComponent/ButtonComponent";

export default function LoginPage() {
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  return (
    <LoginPageContainer>
      <LoginPageForm>
        <LoginTitle>Login</LoginTitle>
        <WrappedFields>
          <InputFieldComponent
            inputLabel="E-mail:"
            idInput="email"
            inputValue={emailValue}
            setInputValue={setEmailValue}
          />

          <InputFieldComponent
            inputLabel="Senha:"
            idInput="senha"
            inputValue={passwordValue}
            setInputValue={setPasswordValue}
          />
        </WrappedFields>
        <ButtonContainer>
          <ButtonComponent />
        </ButtonContainer>
        <InfoContainer>
          <CreateAccountLink>Criar conta</CreateAccountLink>
          <ForgotPassowordText>
            Esqueceu a sua senha? <span>Clique aqui!</span>
          </ForgotPassowordText>
        </InfoContainer>
      </LoginPageForm>
    </LoginPageContainer>
  );
}
