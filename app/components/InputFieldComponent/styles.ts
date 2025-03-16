import styled from "styled-components";

export const InputField = styled.input`
  padding: 10px;
  width: 100%;
  border-radius: 6px;
  border-color: var(--gray-600);

  &.error {
    border-color: red;
  }
`;

export const InputLabel = styled.label`
  cursor: pointer;
  font-size: 1rem;
  font-family: var(--main-font-sans);
`;
