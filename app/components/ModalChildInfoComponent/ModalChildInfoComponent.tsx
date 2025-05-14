import style from './style.module.css';

type ModalChildInfoComponentProps = {
  isModalChildInfoOpen: boolean;
};

export default function ModalChildInfoComponent({
  isModalChildInfoOpen,
}: ModalChildInfoComponentProps) {
  return (
    <>
      {isModalChildInfoOpen && (
        <div className={style.modalBg}>
          <div className={style.modalBody}></div>
        </div>
      )}
    </>
  );
}
