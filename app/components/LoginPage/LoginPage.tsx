'use client';

import { loginUser } from '@/app/actions/loginUser';
import { CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { SyntheticEvent, useState } from 'react';
import ButtonComponent from '../ButtonComponent/ButtonComponent';
import InputFieldComponent from '../InputFieldComponent/InputFieldComponent';
import {
  ButtonContainer,
  ErrorMessage,
  InfoContainer,
  LoginPageContainer,
  LoginPageForm,
  LoginTitle,
  WrappedFields,
} from './styles';

export default function LoginPage() {
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const route = useRouter();

  const handleLogin = async () => {
    if (emailValue.length && passwordValue.length) {
      setLoading(true);
      setErrorMessage('');
      const response = await loginUser({
        email: emailValue,
        password: passwordValue,
      });

      if (response.status !== 200) {
        setLoading(false);
        setErrorMessage('Usuário ou senha inválidos.');
        return;
      }

      setLoading(false);
      route.push('/home');
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
            required
            disabled={loading}
          />

          <InputFieldComponent
            required
            inputLabel="Senha:"
            idInput="senha"
            showError={errorMessage.length > 0}
            inputType="password"
            inputValue={passwordValue}
            setInputValue={setPasswordValue}
            disabled={loading}
          />
          <ErrorMessage>{errorMessage}</ErrorMessage>
        </WrappedFields>
        <ButtonContainer>
          <ButtonComponent
            disabled={!emailValue.length || !passwordValue.length}
            type="submit"
            buttonText={
              !loading ? (
                'Login'
              ) : (
                <CircularProgress
                  size={28}
                  style={{
                    color: '#fafafa',
                  }}
                />
              )
            }
          />
        </ButtonContainer>
        <InfoContainer>
          {/* <CreateAccountLink>Criar conta</CreateAccountLink>
          <ForgotPassowordText>
            Esqueceu a sua senha? <span>Clique aqui!</span>
          </ForgotPassowordText> */}
        </InfoContainer>
      </LoginPageForm>
    </LoginPageContainer>
  );
}
