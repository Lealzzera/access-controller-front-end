import styled from "styled-components";

export const LoginPageContainer = styled.section`
  background-color: var(--blue-200);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: auto;
`;

export const LoginPageForm = styled.form`
  width: 80vw;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  flex-direction: column;
  @media (min-width: 800px) {
    background-color: var(--gray-100);
    width: 600px;
    min-height: 600px;
    margin: 1rem;
  }
`;

export const LoginTitle = styled.h1`
  font-size: 32px;
  margin-bottom: 50px;

  @media (min-width: 800px) {
    margin-top: 50px;
  }
`;

export const WrappedFields = styled.div`
  width: 250px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 40px;

  @media (min-width: 400px) {
    width: 300px;
  }

  @media (min-width: 800px) {
    width: 400px;
  }
`;

export const ButtonContainer = styled.div`
  width: 250px;
  margin-top: 20px;

  @media (min-width: 400px) {
    width: 300px;
  }

  @media (min-width: 800px) {
    width: 400px;
  }
`;

export const InfoContainer = styled.div`
  width: 250px;
  margin-top: 40px;

  @media (min-width: 400px) {
    width: 300px;
  }

  @media (min-width: 800px) {
    width: 400px;
    margin-top: 80px;
  }
`;

export const CreateAccountLink = styled.p`
  cursor: pointer;
  font-weight: 700;
  color: var(--blue-400);
`;

export const ForgotPassowordText = styled.p`
  & span {
    color: purple;
    cursor: pointer;
    font-weight: 700;
  }
`;

export const ErrorMessage = styled.span`
  font-size: 14px;
  color: red;
`;
