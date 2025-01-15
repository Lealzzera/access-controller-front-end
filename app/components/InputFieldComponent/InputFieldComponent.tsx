import { InputField, InputLabel } from "./styles";

type InputFieldComponentProps = {
  inputType: "text" | "email" | "password";
  inputValue: string;
  idInput: string;
  inputLabel: string;
  setInputValue: (value: string) => void;
  showError?: boolean;
};

export default function InputFieldComponent({
  inputType = "text",
  inputValue,
  idInput,
  inputLabel,
  setInputValue,
  showError,
}: InputFieldComponentProps) {
  return (
    <div>
      <InputLabel htmlFor={idInput}>{inputLabel}</InputLabel>
      <InputField
        className={showError ? "error" : ""}
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        type={inputType}
        id={idInput}
      />
    </div>
  );
}
