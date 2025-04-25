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
};

export default function SelectComponent({
  selectName,
  selectOptions,
  selectId,
  selectLabel,
}: SelectComponentProps) {
  return (
    <div>
      <label className={style.selectLabel} htmlFor={selectId}>
        {selectLabel}
      </label>
      <select className={style.selectComponent} id={selectId} name={selectName}>
        {selectOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
