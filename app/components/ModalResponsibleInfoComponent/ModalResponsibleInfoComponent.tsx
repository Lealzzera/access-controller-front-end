import { useEffect, useRef, useState } from 'react';
import style from './style.module.css';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Image from 'next/image';
import imageError from '@/app/assets/error-image.png';
import ButtonComponent from '../ButtonComponent/ButtonComponent';
import ModalRegisterChildComponent from '../ModalRegisterChild/ModalRegisterChildComponent';
import { getChildrenListByResponsibleId } from '@/app/actions/getChildrenListByResposnibleId';
import { getChildById } from '@/app/actions/getChildById';
import { unlinkResponsibleFromChild } from '@/app/actions/unlinkResponsibleFromChild';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { Snackbar, Alert } from '@mui/material';

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
  const [childrenList, setChildrenList] = useState<any[]>([]);
  const [loadingChildrenList, setLoadingChildrenList] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [showChildInfo, setShowChildInfo] = useState(false);
  const [loadingChild, setLoadingChild] = useState(false);
  const [unlinkingChildId, setUnlinkingChildId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const modalRef = useRef(null);

  const handleCloseModal = () => {
    setIsModalResponsibleInfoOpen(false);
    setOpenModalRegisterChild(false);
    setShowResponsibleModalContent(true);
    setShowChildInfo(false);
    setSelectedChild(null);
  };

  const handleCloseClickingOutside = (event: any) => {
    if (event.target === modalRef.current) handleCloseModal();
  };

  const handleRegisterChild = () => {
    setShowResponsibleModalContent(false);
    setOpenModalRegisterChild(true);
  };

  const backToResponsibleInfo = () => {
    setShowResponsibleModalContent(true);
    setOpenModalRegisterChild(false);
  };

  const getChildrenList = async () => {
    if (!responsibleInfo) return;
    setLoadingChildrenList(true);
    const response = await getChildrenListByResponsibleId(responsibleInfo.id);
    if (Array.isArray(response)) {
      setChildrenList(response);
    } else {
      setChildrenList([]);
    }
    setLoadingChildrenList(false);
  };

  const handleChildClick = async (childId: string) => {
    setShowResponsibleModalContent(false);
    setShowChildInfo(true);
    setLoadingChild(true);
    const childData = await getChildById(childId);
    if (childData && !childData.status) {
      setSelectedChild(childData);
    }
    setLoadingChild(false);
  };

  const backFromChildInfo = () => {
    setShowChildInfo(false);
    setSelectedChild(null);
    setShowResponsibleModalContent(true);
  };

  // const handleUnlinkChild = async (e: React.MouseEvent, childId: string) => {
  //   e.stopPropagation();
  //   if (!responsibleInfo) return;
  //   setUnlinkingChildId(childId);
  //   try {
  //     const result = await unlinkResponsibleFromChild(childId, responsibleInfo.id);
  //     if (result?.status === 204 || !result?.statusCode) {
  //       setChildrenList((prev) => prev.filter((c) => c.id !== childId));
  //       setSnackbar({ open: true, message: 'Vínculo removido com sucesso.', severity: 'success' });
  //     } else {
  //       setSnackbar({
  //         open: true,
  //         message: result?.message || 'Não é possível remover o último responsável.',
  //         severity: 'error',
  //       });
  //     }
  //   } catch {
  //     setSnackbar({ open: true, message: 'Erro ao remover vínculo.', severity: 'error' });
  //   }
  //   setUnlinkingChildId(null);
  // };

  useEffect(() => {
    getChildrenList();
  }, [responsibleInfo]);

  useEffect(() => {
    if (!openModalRegisterChild) {
      getChildrenList();
    }
  }, [openModalRegisterChild]);

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
              <div className={style.childrenSection}>
                <h2 className={style.childrenTitle}>Crianças</h2>
                {loadingChildrenList && <p>Carregando...</p>}
                {!loadingChildrenList && childrenList.length === 0 && (
                  <p>Não há crianças cadastradas.</p>
                )}
                {!loadingChildrenList && childrenList.length > 0 && (
                  <ul className={style.childrenList}>
                    {childrenList.map((child: any) => (
                      <li
                        key={child.id}
                        className={style.childCard}
                        onClick={() => handleChildClick(child.id)}
                      >
                        <div className={style.childPicture}>
                          <Image
                            src={child.picture || imageError}
                            width={55}
                            height={55}
                            alt={child.name}
                          />
                        </div>
                        <div className={style.childInfo}>
                          <p className={style.childName}>{child.name}</p>
                          {child.grade?.name && (
                            <p className={style.childDetail}>
                              <span>Turma: </span>
                              {child.grade.name}
                            </p>
                          )}
                          {child.period?.name && (
                            <p className={style.childDetail}>
                              <span>Período: </span>
                              {child.period.name}
                            </p>
                          )}
                        </div>
                        {/* <button
                          className={style.unlinkButton}
                          title="Desvincular criança"
                          disabled={unlinkingChildId === child.id}
                          onClick={(e) => handleUnlinkChild(e, child.id)}
                        >
                          <LinkOffIcon fontSize="small" />
                        </button> */}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : showChildInfo ? (
            <div className={style.modalBody}>
              <div className={style.closeButtonContainer}>
                <ArrowBackRoundedIcon
                  onClick={backFromChildInfo}
                  fontSize="large"
                  className={style.closeIcon}
                  style={{ marginRight: 'auto' }}
                />
                <CloseRoundedIcon
                  onClick={handleCloseModal}
                  fontSize="large"
                  className={style.closeIcon}
                />
              </div>
              {loadingChild && (
                <p style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</p>
              )}
              {!loadingChild && selectedChild && (
                <div className={style.modalContent}>
                  <div className={style.imgContainer}>
                    <Image
                      className={style.responsibleImg}
                      src={selectedChild.picture || imageError}
                      width={600}
                      height={600}
                      alt={selectedChild.name}
                    />
                  </div>
                  <div className={style.containerInfo}>
                    <h1 className={style.responsibleName}>{selectedChild.name}</h1>
                    <div className={style.responsibleStats}>
                      {selectedChild.cpf && (
                        <p>
                          <span>CPF: </span> {selectedChild.cpf}
                        </p>
                      )}
                      {selectedChild.period?.name && (
                        <p>
                          <span>Período: </span> {selectedChild.period.name}
                        </p>
                      )}
                      {selectedChild.grade?.name && (
                        <p>
                          <span>Turma: </span> {selectedChild.grade.name}
                        </p>
                      )}
                      {selectedChild.birthDate && (
                        <p>
                          <span>Nascimento: </span>{' '}
                          {new Date(selectedChild.birthDate).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                      <p>
                        <span>Status: </span> {selectedChild.isPresent ? 'Presente' : 'Ausente'}
                      </p>
                    </div>
                  </div>
                </div>
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
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
