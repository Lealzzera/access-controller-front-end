import React from 'react';
import inputStyle from './InputFieldComponent.module.css';

interface InputFieldComponentProps {
  inputType?: 'text' | 'email' | 'password';
  inputValue: string;
  idInput: string;
  inputLabel: string;
  setInputValue: (value: string) => void;
  showError?: boolean;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  style?: React.CSSProperties;
}

export default function InputFieldComponent({
  inputType = 'text',
  inputValue,
  idInput,
  inputLabel,
  setInputValue,
  showError,
  required,
  disabled,
  placeholder,
  style,
}: InputFieldComponentProps) {
  return (
    <div>
      <label
        className={`${inputStyle.label} ${required ? inputStyle.required : ''}`}
        htmlFor={idInput}
      >
        {inputLabel}
      </label>
      <input
        className={`${inputStyle.input} ${showError ? inputStyle.error : ''}`}
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        type={inputType}
        id={idInput}
        disabled={disabled}
        placeholder={placeholder}
        style={style}
      />
    </div>
  );
}
