import style from "./style.module.css";

type SelectOptionsType = {
  id?: string | number;
  optionLabel: string;
};

type SelectComponentProps = {
  selectName: string;
  selectOptions: SelectOptionsType[];
  selectId: string;
  selectLabel: string;
  setSelectValue: (value: any) => void;
  required?: boolean;
};

export default function SelectComponent({
  selectName,
  selectOptions,
  selectId,
  selectLabel,
  setSelectValue,
  required,
}: SelectComponentProps) {
  return (
    <div>
      <label
        className={`${style.selectLabel} ${required ? style.required : ""}`}
        htmlFor={selectId}
      >
        {selectLabel}
      </label>
      <select
        onChange={(event) => setSelectValue(event.target.value)}
        className={style.selectComponent}
        id={selectId}
        name={selectName}
      >
        <option value=""></option>
        {selectOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
