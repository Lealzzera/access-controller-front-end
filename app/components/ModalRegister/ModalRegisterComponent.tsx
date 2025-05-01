"use client";

import { useEffect, useRef, useState } from "react";
import style from "./style.module.css";
import InputFieldComponent from "../InputFieldComponent/InputFieldComponent";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SelectComponent from "../SelectComponent/SelectComponent";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import NoPhotographyRoundedIcon from "@mui/icons-material/NoPhotographyRounded";
import Image from "next/image";
import { useUser } from "@/app/context/userContext";
import maskCpfFunction from "@/app/helpers/maskCpfFunction";
import maskBirthDateFunction from "@/app/helpers/maskBirthDateFunction";
import parseDateWithDateFns from "@/app/helpers/parseDateWithDateFns";
import { getGradesByInstituionId } from "@/app/actions/getGradesByInstitutionId";
import { getPeriodsByInstituionId } from "@/app/actions/getPeriodsByInstitutionId";
import ModalCameraComponent from "../ModalCameraComponent/ModalCameraComponent";
import compressFile from "@/app/helpers/compressFile";
import { registerChild } from "@/app/actions/registerChild";
import { getPreSignedUploadURL } from "@/app/actions/getPreSignedUploadURL";
import { updateChild } from "@/app/actions/updateChild";
import postPictureToS3 from "@/app/actions/postPictureToS3";
import { CircularProgress } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";

export default function ModalRegisterComponent() {
  const { registerModalOpen, setRegisterModalOpen, userInfo } = useUser();

  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gradeOptions, setGradeOptions] = useState([]);
  const [periodOptions, setPeriodOptions] = useState([]);
  const [period, setPeriod] = useState("");
  const [grade, setGrade] = useState("");
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [imagePreviewerData, setImagePreviewerData] = useState<
    string | undefined
  >(undefined);
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState<File | null>(null);
  const [loadCameraData, setLoadCameraData] = useState(false);
  const [stream, setStream] = useState<MediaStream | undefined>(undefined);
  const [loadRegisterData, setLoadRegisterData] = useState(false);

  const modalContainer = useRef(null);

  const handleCloseModalClickingOutside = (event: any) => {
    if (event.target === modalContainer.current) {
      handleCloseModal();
    }
  };

  const resetAllStatus = () => {
    setName("");
    setCpf("");
    setGrade("");
    setPeriod("");
    setIsCameraModalOpen(false);
    setImagePreviewerData(undefined);
    setFileName("");
    setFileData(null);
    setLoadCameraData(false);
    setStream(undefined);
    setBirthDate("");
    setLoadRegisterData(false);
  };

  const handleCloseModal = () => {
    setRegisterModalOpen(false);
    stream?.getTracks().forEach((track) => {
      track.stop();
    });
    resetAllStatus();
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userInfo || !fileData) return;
    setLoadRegisterData(true);
    const parsedDate = parseDateWithDateFns(birthDate);
    const responseRegister = await registerChild({
      name,
      birthDate: parsedDate,
      periodId: period,
      gradeId: grade,
      cpf,
      institutionId: userInfo.id,
    });

    if (responseRegister.statusCode === 400) {
      notifyError("CPF já cadastrado");
      setLoadRegisterData(false);
    }

    const presignedUrl = await getPreSignedUploadURL(
      responseRegister.child.id,
      fileData?.type
    );
    const url = new URL(presignedUrl);
    const pictureUrl = `${url.origin}${url.pathname}`;
    const response = await postPictureToS3(presignedUrl, fileData);
    if (response.status === 200) {
      await updateChild({
        id: responseRegister.child.id,
        picture: pictureUrl,
      });
    }
    setLoadRegisterData(false);
    notifySuccess();
    handleCloseModal();
  };
  const handleStartCamera = async () => {
    try {
      setLoadCameraData(true);
      const streamNavigator = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(streamNavigator);
      if (streamNavigator.active) {
        setLoadCameraData(false);
      }
      const videoElement = document.getElementById(
        "camera"
      ) as HTMLVideoElement;
      if (videoElement) {
        videoElement.srcObject = streamNavigator;
        videoElement.play();
      }
    } catch (err) {
      setLoadCameraData(false);
      console.error("Error accessing user's camera: ", err);
    }
  };

  const openModalCamera = () => {
    if (imagePreviewerData) {
      setImagePreviewerData(undefined);
    }
    setIsCameraModalOpen(true);
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

  const notifySuccess = () =>
    toast.success("Criança cadastrada com sucesso!", {
      autoClose: 5000,
      theme: "colored",
      pauseOnHover: false,
      closeOnClick: true,
      hideProgressBar: true,
      containerId: "success-container",
    });

  const notifyError = (message?: string) =>
    toast.error(`Erro ao cadastrar criança ${message}`, {
      autoClose: 5000,
      theme: "colored",
      pauseOnHover: false,
      closeOnClick: true,
      hideProgressBar: true,
      containerId: "error-container",
    });

  useEffect(() => {
    if (!userInfo?.id) return;
    const fetchData = async () => {
      const [gradeResponse, periodResponse] = await Promise.all([
        getGradesByInstituionId(userInfo?.id),
        getPeriodsByInstituionId(userInfo.id),
      ]);
      setGradeOptions(gradeResponse);
      setPeriodOptions(periodResponse);
    };

    fetchData();
  }, [userInfo]);

  useEffect(() => {
    if (isCameraModalOpen) {
      handleStartCamera();
    }
  }, [isCameraModalOpen]);

  return (
    <>
      <ToastContainer containerId="success-container" />
      {registerModalOpen && (
        <div
          onClick={handleCloseModalClickingOutside}
          ref={modalContainer}
          className={`${style.modalContainer}`}
        >
          <ToastContainer containerId="error-container" />
          <ModalCameraComponent
            imagePreviewerData={imagePreviewerData}
            isCameraModalOpen={isCameraModalOpen}
            loadCameraData={loadCameraData}
            setFileData={setFileData}
            setFileName={setFileName}
            setImagePreviewerData={setImagePreviewerData}
            setIsCameraModalOpen={setIsCameraModalOpen}
            setLoadCameraData={setLoadCameraData}
            stream={stream}
          />
          <div
            style={{ display: isCameraModalOpen ? "none" : "block" }}
            className={style.modalContentWrapped}
          >
            <div className={style.closeButtonContainer}>
              <CloseRoundedIcon
                onClick={handleCloseModal}
                fontSize="large"
                className={style.closeIcon}
              />
            </div>
            <div className={style.registerInformationText}>
              <h1 className={style.registerTitle}>Cadastrar criança</h1>
              <p className={style.registerDescription}>
                Vamos lá! Para cadastrar uma nova criança, basta inserir os
                dados abaixo.
              </p>
            </div>
            <form className={style.formContainer} onSubmit={handleRegister}>
              <InputFieldComponent
                required={true}
                disabled={loadRegisterData}
                idInput="name"
                inputLabel="Nome completo"
                style={{ textTransform: "capitalize" }}
                setInputValue={setName}
                inputValue={name}
                inputType="text"
                placeholder="Ex: João da Silva Santos"
              />
              <InputFieldComponent
                disabled={loadRegisterData}
                required={true}
                idInput="cpf"
                inputLabel="CPF (somente números)"
                setInputValue={(event) => setCpf(maskCpfFunction(event))}
                inputValue={cpf}
                inputType="text"
                placeholder="999.999.999-99"
              />
              <InputFieldComponent
                disabled={loadRegisterData}
                required={true}
                idInput="birthDate"
                inputLabel="Data de nascimento"
                style={{ textTransform: "capitalize" }}
                setInputValue={(event) =>
                  setBirthDate(maskBirthDateFunction(event))
                }
                inputValue={birthDate}
                inputType="text"
                placeholder="DD/MM/YYYY"
              />
              <SelectComponent
                required
                disabled={loadRegisterData}
                selectId="period"
                setSelectValue={setPeriod}
                selectLabel="Período"
                selectOptions={periodOptions}
                selectName="period"
                labelText="Selecione um período"
              />
              <SelectComponent
                required
                disabled={loadRegisterData}
                selectId="grade"
                setSelectValue={setGrade}
                selectLabel="Turma"
                selectOptions={gradeOptions}
                selectName="grade"
                labelText="Selecione uma turma"
              />
              <div
                style={{
                  backgroundColor: imagePreviewerData
                    ? "transparent"
                    : "rgba(0, 0, 0, 0.4)",
                }}
                className={style.noPicture}
              >
                {!imagePreviewerData ? (
                  <div
                    style={{
                      height: "200px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <NoPhotographyRoundedIcon
                      style={{ fontSize: "80px", color: "rgba(0, 0, 0, 0.6)" }}
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
                  fontSize: "10px",
                  visibility: fileName.length ? "initial" : "hidden",
                }}
              >
                {fileName.length ? fileName : "nothing"}
              </p>
              <div className={style.containerButtons}>
                <div className={style.containerFileButton}>
                  <label className={style.chooseFileLabel} htmlFor="inputFile">
                    Selecionar
                  </label>
                  <input
                    id="inputFile"
                    accept="image/jpeg, image/jpg, image/png, image/webp"
                    size={60}
                    className={style.chooseFileButton}
                    onChange={handleChangeImage}
                    type="file"
                  />
                </div>
                <div>
                  <ButtonComponent
                    style={{
                      fontSize: "12px",
                      textTransform: "none",
                      backgroundColor: "var(--blue-400)",
                      boxShadow: "none",
                      border: "1px solid var(--blue-400)",
                    }}
                    onClick={openModalCamera}
                    buttonText="Tirar foto"
                  />
                </div>
              </div>
              <div className={style.registerButtonContainer}>
                <ButtonComponent
                  style={{
                    fontSize: "1rem",
                    textTransform: "none",
                    backgroundColor: "#00a159",
                    boxShadow: "none",
                    fontWeight: "bold",
                    color: "#002F1A",
                  }}
                  type="submit"
                  disabled={
                    !name ||
                    cpf.length < 14 ||
                    !period ||
                    !grade ||
                    !imagePreviewerData ||
                    loadRegisterData
                  }
                  buttonText={
                    loadRegisterData ? (
                      <CircularProgress
                        size={28}
                        style={{ color: "#002F1A" }}
                      />
                    ) : (
                      "Enviar"
                    )
                  }
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
