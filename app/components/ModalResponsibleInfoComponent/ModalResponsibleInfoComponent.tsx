import { useRef } from 'react';
import style from './style.module.css';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Image from 'next/image';
import imageError from '@/app/assets/error-image.png';

type ChildObject = {
  id: string;
  name: string;
  grade: string;
  period: string;
  picture: string;
};

type ResponsibleInfo = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phoneNumber: string;
  picture: string;
  children: ChildObject[];
};

type ModalResponsibleInfoComponentProps = {
  isModalResponsibleInfoOpen: boolean;
  setIsModalResponsibleInfoOpen: (value: boolean) => void;
  responsibleInfo: ResponsibleInfo | null;
};

export default function ModalResponsibleInfoComponent({
  isModalResponsibleInfoOpen,
  setIsModalResponsibleInfoOpen,
  responsibleInfo,
}: ModalResponsibleInfoComponentProps) {
  const modalRef = useRef(null);

  const handleCloseModal = () => {
    setIsModalResponsibleInfoOpen(false);
  };

  const handleCloseClickingOutside = (event: any) => {
    if (event.target === modalRef.current) handleCloseModal();
  };

  return (
    <>
      {isModalResponsibleInfoOpen && (
        <div onClick={handleCloseClickingOutside} ref={modalRef} className={style.modalBg}>
          <div className={style.modalBody}>
            <div className={style.closeButtonContainer}>
              <CloseRoundedIcon
                onClick={handleCloseModal}
                fontSize="large"
                className={style.closeIcon}
              />
            </div>
            {responsibleInfo && (
              <>
                <div className={style.modalContent}>
                  <div className={style.imgContainer}>
                    {responsibleInfo.picture ? (
                      <Image
                        className={style.responsibleImg}
                        src={responsibleInfo.picture}
                        width={600}
                        height={600}
                        alt={responsibleInfo.name}
                      />
                    ) : (
                      <Image
                        className={style.responsibleImg}
                        src={imageError}
                        width={600}
                        height={600}
                        alt={responsibleInfo.name}
                      />
                    )}
                  </div>
                  <div className={style.containerInfo}>
                    <h1 className={style.responsibleName}>{responsibleInfo.name}</h1>
                    <div className={style.responsibleStats}>
                      <p>
                        <span>CPF: </span> {responsibleInfo.cpf}
                      </p>
                      <p>
                        <span>Telefone: </span> {responsibleInfo.phoneNumber}
                      </p>
                      <p>
                        <span>Email: </span> {responsibleInfo.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={style.childrenListContainer}>
                  <h1 className={style.childrenListTitle}>Crianças vinculadas</h1>
                  {responsibleInfo.children.length === 0 && (
                    <div className={style.notFoundChildren}>
                      <p>Não há crianças vinculadas a este responsável.</p>
                    </div>
                  )}
                  {responsibleInfo.children.length > 0 && (
                    <ul className={style.childrenList}>
                      {responsibleInfo.children.map((child: ChildObject) => (
                        <li className={style.childCard} key={child.id}>
                          <div className={style.childPictureContainer}>
                            {child.picture ? (
                              <Image
                                src={child.picture}
                                width={300}
                                height={300}
                                className={style.childPicture}
                                alt={child.name}
                              />
                            ) : (
                              <Image
                                src={imageError}
                                width={300}
                                height={300}
                                className={style.childPicture}
                                alt={child.name}
                              />
                            )}
                          </div>
                          <div className={style.childInfo}>
                            <p className={style.childNameText}>{child.name}</p>
                            <p>
                              <span>Turma: </span> {child.grade}
                            </p>
                            <p>
                              <span>Período: </span> {child.period}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
