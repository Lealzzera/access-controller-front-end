import styled from "styled-components";

export const ButtonContainer = styled.div`
  width: 100%;
  & .MuiButton-root {
    background-color: var(--gray-900);
  }

  & .Mui-disabled {
    background-color: var(--gray-900);
    opacity: 50%;
    color: var(--white);
  }
`;
