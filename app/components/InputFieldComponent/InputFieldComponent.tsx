import { InputProps } from "@mui/material";
import { InputField, InputLabel } from "./styles";

interface InputFieldComponentProps extends InputProps {
  inputType: "text" | "email" | "password";
  inputValue: string;
  idInput: string;
  inputLabel: string;
  setInputValue: (value: string) => void;
  showError?: boolean;
  required?: boolean;
}

export default function InputFieldComponent({
  inputType = "text",
  inputValue,
  idInput,
  inputLabel,
  setInputValue,
  showError,
  required,
  ...props
}: InputFieldComponentProps) {
  return (
    <div>
      <InputLabel className={required ? "required" : ""} htmlFor={idInput}>
        {inputLabel}
      </InputLabel>
      <InputField
        {...props}
        className={showError ? "error" : ""}
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        type={inputType}
        id={idInput}
      />
    </div>
  );
}
