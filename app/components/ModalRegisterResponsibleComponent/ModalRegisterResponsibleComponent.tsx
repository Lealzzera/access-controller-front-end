'use client';

import { useUser } from '@/app/context/userContext';
import style from './style.module.css';
import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import InputFieldComponent from '../InputFieldComponent/InputFieldComponent';
import ButtonComponent from '../ButtonComponent/ButtonComponent';
import { CircularProgress } from '@mui/material';
import NoPhotographyRoundedIcon from '@mui/icons-material/NoPhotographyRounded';
import Image from 'next/image';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { getKinshipList } from '@/app/actions/getKinshipList';
import SelectComponent from '../SelectComponent/SelectComponent';
import { KINSHIP } from '@/app/enums/Kinship.enum';
import ModalCameraComponent from '../ModalCameraComponent/ModalCameraComponent';
import { handleStartCamera } from '@/app/helpers/handleStartCamera';
import maskCpfFunction from '@/app/helpers/maskCpfFunction';
import { registerResponsible } from '@/app/actions/registerResponsible';
import { ErrorMessagesEnum } from '@/app/enums/ErrorMessages.enum';
import { getPreSignedUploadURL } from '@/app/actions/getPreSignedUploadURL';
import compressFile from '@/app/helpers/compressFile';
import postPictureToS3 from '@/app/actions/postPictureToS3';
import { updateResponsible } from '@/app/actions/updateResponsible';
import { toast, ToastContainer } from 'react-toastify';
import cleanCpfNumber from '@/app/helpers/cleanCpfNumber';

type KinshipType = {
  id: string;
  value: number;
  name: string;
};

export default function ModalRegisterResponsibleComponent() {
  const {
    registerResponsibleModalOpen,
    setRegisterResponsibleModalOpen,
    lastChildRegisteredInformation,
    setLastChildRegisteredInformation,
    userInfo,
  } = useUser();

  const [loadRegisterData, setLoadRegisterData] = useState(false);
  const [imagePreviewerData, setImagePreviewerData] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState('');
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [loadCameraData, setLoadCameraData] = useState(false);
  const [fileData, setFileData] = useState<File | null>(null);
  const [stream, setStream] = useState<MediaStream | undefined>(undefined);

  const [responsibleName, setResponsibleName] = useState('');
  const [responsibleCpf, setResponsibleCpf] = useState('');
  const [kinship, setKinship] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [kinshipList, setKinshipList] = useState([]);

  const modalBg = useRef<HTMLDivElement | null>(null);

  const handleClickOutSide = (event: SyntheticEvent) => {
    if (event.target !== modalBg.current) return;
    handleCloseModal();
  };

  const errorMap: Record<string, string> = {
    [ErrorMessagesEnum.PASSWORD_ERROR]:
      'A senha deve conter 6 caracteres com ao menos 1 número, 1 letra maiúscula e 1 caractere especial.',
    [ErrorMessagesEnum.EMAIL_FROM_INSTITUTION]: 'Email cadastrado como uma instituição.',
    [ErrorMessagesEnum.CPF_FROM_A_CHILD]:
      'O CPF fornecido está cadastrado como CPF de uma criança.',
    [ErrorMessagesEnum.CHILD_ID_NOT_FOUND]: 'ChildId fornecido não existe.',
    [ErrorMessagesEnum.RESPONSIBLE_ALREADY_LINKED_TO_CHILD]:
      'Este responsável já está linkado a essa criança.',
    [ErrorMessagesEnum.EMAIL_FROM_OTHER_USER]: 'Email fornecido já existe em nossa base de dados.',
    [ErrorMessagesEnum.CPF_FROM_OTHER_USER]: 'CPF fornecido já existe em nossa base de dados.',
  };

  const handleRegister = async (event: any) => {
    setLoadRegisterData(true);
    event.preventDefault();
    if (!userInfo || !lastChildRegisteredInformation || !fileData) return;

    if (password !== confirmPassword) {
      notifyError('As senhas digitadas não conferem.');
      setLoadRegisterData(false);
      return;
    }
    const cleanCpf = cleanCpfNumber(responsibleCpf);

    const response = await registerResponsible({
      institutionId: userInfo?.id,
      childId: lastChildRegisteredInformation?.id,
      cpf: cleanCpf,
      email,
      kinshipId: kinship,
      name: responsibleName,
      password,
    });

    const messageError = Array.isArray(response.message) ? response.message[0] : response.message;
    const friendlyMessage = errorMap[messageError];

    if (friendlyMessage) {
      notifyError(friendlyMessage);
      setLoadRegisterData(false);
      return;
    }

    const s3URL = await getPreSignedUploadURL(
      response.responsible.id,
      fileData?.type,
      'responsible'
    );
    const url = new URL(s3URL);
    const pictureUrl = `${url.origin}${url.pathname}`;
    const responsePicture = await postPictureToS3(s3URL, fileData);

    if (responsePicture.status === 200) {
      await updateResponsible({
        id: response.responsible.id,
        picture: pictureUrl,
      });
    }
    setLoadRegisterData(false);
    notifySuccess();
    handleCloseModal();
  };

  const notifySuccess = () =>
    toast.success('Responsável cadastrado com sucesso!', {
      autoClose: 5000,
      theme: 'colored',
      pauseOnHover: false,
      closeOnClick: true,
      hideProgressBar: true,
      containerId: 'success-container',
    });

  const notifyError = (message?: string) =>
    toast.error(`Erro ao cadastrar responsável! ${message}`, {
      autoClose: 5000,
      theme: 'colored',
      pauseOnHover: false,
      closeOnClick: true,
      hideProgressBar: true,
      containerId: 'error-container',
    });

  const resetAllStatus = () => {
    setResponsibleName('');
    setResponsibleCpf('');
    setCameraModalOpen(false);
    setImagePreviewerData(undefined);
    setFileName('');
    setFileData(null);
    setLoadCameraData(false);
    setStream(undefined);
    setLoadRegisterData(false);
    setKinship('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleCloseModal = () => {
    resetAllStatus();
    setRegisterResponsibleModalOpen(false);
    setLastChildRegisteredInformation(undefined);
  };

  const handleOpenCameraModal = () => {
    if (imagePreviewerData) {
      setImagePreviewerData(undefined);
    }
    setCameraModalOpen(true);
  };

  const handleChangeCPF = (value: string) => {
    const cpfNumber = maskCpfFunction(value);
    setResponsibleCpf(cpfNumber);
  };

  const handleChangeImage = async (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const fileCompressed = await compressFile(file);
      setFileData(fileCompressed);
      const url = URL.createObjectURL(file);
      setFileName(file.name);
      setImagePreviewerData(url);
    }
  };

  useEffect(() => {
    if (lastChildRegisteredInformation) {
      setRegisterResponsibleModalOpen(true);
    }
  }, [lastChildRegisteredInformation]);

  useEffect(() => {
    const fetchKinshipList = async () => {
      const response = await getKinshipList();
      const kinshipFormatted = response.map((item: KinshipType) => {
        return { ...item, name: KINSHIP[item.name as keyof typeof KINSHIP] };
      });

      setKinshipList(kinshipFormatted);
    };
    fetchKinshipList();
  }, []);

  useEffect(() => {
    if (cameraModalOpen) {
      const handleOpenCamera = async () => {
        handleStartCamera({ setLoadCameraData, setStream });
      };

      handleOpenCamera();
    }
  }, [cameraModalOpen]);

  return (
    <>
      <ToastContainer containerId="success-container" />
      {registerResponsibleModalOpen && (
        <div ref={modalBg} onClick={handleClickOutSide} className={style.registerModalBg}>
          {!cameraModalOpen ? (
            <div className={style.registerModalContent}>
              <div className={style.closeModalIcon}>
                <CloseRoundedIcon
                  onClick={handleCloseModal}
                  fontSize="large"
                  className={style.closeIcon}
                />
              </div>
              <ToastContainer containerId="error-container" />
              <div className={style.registerInformationText}>
                <h1 className={style.modalTitle}>Cadastrar responsável</h1>
                <p className={style.modalDescription}>
                  Vamos cadastrar um responsável para o{' '}
                  {lastChildRegisteredInformation && (
                    <span>{lastChildRegisteredInformation.name}</span>
                  )}
                </p>
              </div>
              <form className={style.registerForm} onSubmit={handleRegister}>
                <InputFieldComponent
                  idInput="name"
                  required
                  inputLabel="Nome"
                  inputType="text"
                  inputValue={responsibleName}
                  setInputValue={(event) => setResponsibleName(event)}
                />
                <InputFieldComponent
                  idInput="cpf"
                  required
                  inputLabel="CPF"
                  inputType="text"
                  inputValue={responsibleCpf}
                  setInputValue={handleChangeCPF}
                />
                <SelectComponent
                  disabled={false}
                  labelText="Selecione o grau de parentesco"
                  selectId="kinship"
                  setSelectValue={setKinship}
                  selectName="kinship"
                  selectLabel="Grau de parentesco"
                  selectOptions={kinshipList}
                  required
                />
                <InputFieldComponent
                  idInput="email"
                  required
                  inputLabel="Email"
                  inputType="email"
                  inputValue={email}
                  setInputValue={(event) => setEmail(event)}
                />
                <InputFieldComponent
                  idInput="password"
                  required
                  inputLabel="Senha"
                  inputType="password"
                  inputValue={password}
                  setInputValue={(event) => setPassword(event)}
                />
                <InputFieldComponent
                  idInput="confirmPassword"
                  required
                  inputLabel="Confirmar senha"
                  inputType="password"
                  inputValue={confirmPassword}
                  setInputValue={(event) => setConfirmPassword(event)}
                />

                <div
                  style={{
                    backgroundColor: imagePreviewerData ? 'transparent' : 'rgba(0, 0, 0, 0.4)',
                  }}
                  className={style.noPicture}
                >
                  {!imagePreviewerData ? (
                    <div
                      style={{
                        height: '200px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <NoPhotographyRoundedIcon
                        style={{
                          fontSize: '80px',
                          color: 'rgba(0, 0, 0, 0.6)',
                        }}
                      />
                    </div>
                  ) : (
                    <Image
                      className={style.imageSelected}
                      width={100}
                      height={50}
                      alt="image"
                      src={imagePreviewerData}
                    />
                  )}
                </div>
                <p
                  style={{
                    fontSize: '10px',
                    visibility: fileName.length ? 'initial' : 'hidden',
                  }}
                ></p>
                <div className={style.containerButtons}>
                  <div className={style.containerFileButton}>
                    <label className={style.chooseFileLabel} htmlFor="inputFile">
                      Selecionar
                    </label>
                    <input
                      id="inputFile"
                      accept="image/jpeg, image/jpg, image/png, image/webp"
                      size={60}
                      onChange={handleChangeImage}
                      className={style.chooseFileButton}
                      type="file"
                    />
                  </div>
                  <div>
                    <ButtonComponent
                      style={{
                        fontSize: '12px',
                        textTransform: 'none',
                        backgroundColor: 'var(--blue-400)',
                        boxShadow: 'none',
                        border: '1px solid var(--blue-400)',
                      }}
                      buttonText="Tirar foto"
                      onClick={handleOpenCameraModal}
                    />
                  </div>
                </div>
                <div className={style.registerButtonContainer}>
                  <ButtonComponent
                    disabled={
                      !responsibleName.length ||
                      responsibleCpf.length < 14 ||
                      !kinship.length ||
                      !email.length ||
                      !password.length ||
                      !confirmPassword.length ||
                      !imagePreviewerData?.length
                    }
                    style={{
                      fontSize: '1rem',
                      textTransform: 'none',
                      backgroundColor: '#00a159',
                      boxShadow: 'none',
                      fontWeight: 'bold',
                      color: '#002F1A',
                    }}
                    type="submit"
                    buttonText={
                      loadRegisterData ? (
                        <CircularProgress
                          size={28}
                          style={{
                            color: '#002F1A',
                          }}
                        />
                      ) : (
                        'Enviar'
                      )
                    }
                  />
                </div>
              </form>
            </div>
          ) : (
            <ModalCameraComponent
              isCameraModalOpen={cameraModalOpen}
              imagePreviewerData={imagePreviewerData}
              loadCameraData={loadCameraData}
              setFileData={setFileData}
              setFileName={setFileName}
              setImagePreviewerData={setImagePreviewerData}
              setIsCameraModalOpen={setCameraModalOpen}
              setLoadCameraData={setLoadCameraData}
              stream={stream}
            />
          )}
        </div>
      )}
    </>
  );
}
