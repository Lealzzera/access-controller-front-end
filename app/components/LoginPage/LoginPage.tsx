"use client";

import { SyntheticEvent, useState } from "react";
import InputFieldComponent from "../InputFieldComponent/InputFieldComponent";
import {
  ButtonContainer,
  CreateAccountLink,
  ErrorMessage,
  ForgotPassowordText,
  InfoContainer,
  LoginPageContainer,
  LoginPageForm,
  LoginTitle,
  WrappedFields,
} from "./styles";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import { useRouter } from "next/navigation";
import { loginUser } from "@/app/actions/loginUser";

export default function LoginPage() {
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const route = useRouter();

  const handleLogin = async () => {
    if (emailValue.length && passwordValue.length) {
      setErrorMessage("");
      const response = await loginUser({
        email: emailValue,
        password: passwordValue,
      });
      if (response.status !== 200) {
        setErrorMessage("Usuário ou senha inválidos.");
        return;
      }
      route.push("/home");
    }
  };

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    await handleLogin();
  };
  return (
    <LoginPageContainer>
      <LoginPageForm onSubmit={handleSubmit}>
        <LoginTitle>Login</LoginTitle>
        <WrappedFields>
          <InputFieldComponent
            inputLabel="E-mail:"
            idInput="email"
            showError={errorMessage.length > 0}
            inputType="email"
            inputValue={emailValue}
            setInputValue={setEmailValue}
          />

          <InputFieldComponent
            inputLabel="Senha:"
            idInput="senha"
            showError={errorMessage.length > 0}
            inputType="password"
            inputValue={passwordValue}
            setInputValue={setPasswordValue}
          />
          <ErrorMessage>{errorMessage}</ErrorMessage>
        </WrappedFields>
        <ButtonContainer>
          <ButtonComponent
            disabled={!emailValue.length || !passwordValue.length}
            type="submit"
            buttonText="Login"
          />
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
