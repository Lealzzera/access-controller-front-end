import styled from "styled-components";

export const LoginPageContainer = styled.section`
  background-color: var(--blue-200);
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const LoginPageForm = styled.div`
  height: 80vh;
  width: 80vw;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  flex-direction: column;
  @media (min-width: 800px) {
    background-color: var(--gray-100);
    width: 600px;
    height: 700px;
  }
`;

export const LoginTitle = styled.h1`
  font-size: 32px;
  margin-top: 50px;
  margin-bottom: 90px;
`;

export const WrappedFields = styled.div`
  width: 250px;
  margin: 0 auto;
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
  }
`;

export const CreateAccountLink = styled.p`
  cursor: pointer;
  font-weight: 700;
`;

export const ForgotPassowordText = styled.p`
  & span {
    color: purple;
    cursor: pointer;
    font-weight: 700;
  }
`;
