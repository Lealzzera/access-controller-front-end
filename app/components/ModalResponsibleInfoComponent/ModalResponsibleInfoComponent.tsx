import { useRef, useState } from 'react';
import style from './style.module.css';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Image from 'next/image';
import imageError from '@/app/assets/error-image.png';
import ButtonComponent from '../ButtonComponent/ButtonComponent';
import ModalRegisterChildComponent from '../ModalRegisterChild/ModalRegisterChildComponent';

type ResponsibleInfo = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phoneNumber: string;
  picture: string;
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
  const [openModalRegisterChild, setOpenModalRegisterChild] = useState(false);
  const [showResponsibleMoodalContent, setShowResponsibleModalContent] = useState(true);
  const modalRef = useRef(null);

  const handleCloseModal = () => {
    setIsModalResponsibleInfoOpen(false);
    setOpenModalRegisterChild(false);
    setShowResponsibleModalContent(true);
  };

  const handleCloseClickingOutside = (event: any) => {
    if (event.target === modalRef.current) handleCloseModal();
  };

  console.log(responsibleInfo);

  const handleRegisterChild = () => {
    setShowResponsibleModalContent(false);
    setOpenModalRegisterChild(true);
  };

  const backToResponsibleInfo = () => {
    setShowResponsibleModalContent(true);
    setOpenModalRegisterChild(false);
  };

  return (
    <>
      {isModalResponsibleInfoOpen && (
        <div onClick={handleCloseClickingOutside} ref={modalRef} className={style.modalBg}>
          {showResponsibleMoodalContent && !openModalRegisterChild ? (
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
                      <div style={{ marginTop: '2rem' }}>
                        <ButtonComponent
                          onClick={handleRegisterChild}
                          buttonText="Cadastrar criança"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className={style.modalBody}>
              <ModalRegisterChildComponent
                handleBackModal={backToResponsibleInfo}
                responsibleId={responsibleInfo!.id}
                isModalOpen={handleCloseModal}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
