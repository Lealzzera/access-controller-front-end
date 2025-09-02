import style from './style.module.css';

type SelectOptionsType = {
  id?: string | number;
  name: string;
};

interface SelectComponentProps {
  selectName: string;
  selectOptions: SelectOptionsType[];
  selectId: string;
  selectLabel: string;
  setSelectValue: (value: any) => void;
  required?: boolean;
  labelText: string;
  disabled: boolean;
}

export default function SelectComponent({
  selectName,
  selectOptions,
  selectId,
  selectLabel,
  setSelectValue,
  required,
  labelText,
  disabled,
}: SelectComponentProps) {
  return (
    <div>
      <label
        className={`${style.selectLabel} ${required ? style.required : ''}`}
        htmlFor={selectId}
      >
        {selectLabel}
      </label>
      <select
        onChange={(event) => setSelectValue(event.target.value)}
        className={style.selectComponent}
        id={selectId}
        name={selectName}
        disabled={disabled}
      >
        <option
          value=""
          defaultValue={
            selectOptions && selectOptions.length > 0
              ? labelText
              : 'Não existem opções para selecionar'
          }
          hidden
        >
          {selectOptions && selectOptions.length > 0
            ? labelText
            : 'Não existem opções para selecionar'}
        </option>
        {selectOptions?.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}
