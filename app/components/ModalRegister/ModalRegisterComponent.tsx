"use client";

import { useEffect, useRef, useState } from "react";
import style from "./style.module.css";
import InputFieldComponent from "../InputFieldComponent/InputFieldComponent";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SelectComponent from "../SelectComponent/SelectComponent";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import NoPhotographyRoundedIcon from "@mui/icons-material/NoPhotographyRounded";
import Image from "next/image";
import { Skeleton } from "@mui/material";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import { useUser } from "@/app/context/userContext";
import imageCompression from "browser-image-compression";
import { base64ToBlobConverter } from "@/app/helpers/base64ToBlobConverter";
import maskCpfFunction from "@/app/helpers/maskCpfFunction";
import maskBirthDateFunction from "@/app/helpers/maskBirthDateFunction";

const periodOptions = [
  {
    id: 1,
    optionLabel: "Manhã",
  },
  {
    id: 2,
    optionLabel: "Tarde",
  },
  {
    id: 3,
    optionLabel: "Noite",
  },
];

const gradeOptions = [
  { id: 1, optionLabel: "Maternal 1" },
  { id: 2, optionLabel: "Maternal 2" },
  { id: 3, optionLabel: "Maternal 3" },
  { id: 4, optionLabel: "Maternal 4" },
];

export default function ModalRegisterComponent() {
  const { registerModalOpen, setRegisterModalOpen } = useUser();

  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
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
  };

  const handleCloseModal = () => {
    setRegisterModalOpen(false);
    stream?.getTracks().forEach((track) => {
      track.stop();
    });
    resetAllStatus();
  };

  const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log({
      name,
      cpf,
      period,
      grade,
      fileData,
      birthDate,
    });
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

  const compressFile = async (file: File): Promise<File> => {
    const maxFileSizeMB = 1;
    const currentFileSizeMB = file.size / 1024 / 1024;

    if (currentFileSizeMB <= maxFileSizeMB) {
      setFileData(file);
      return file;
    }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      setFileData(compressedFile);
      return compressedFile;
    } catch (err) {
      console.error("Error to compress image: ", err);
      setFileData(file);
      return file;
    }
  };

  const takePicture = async () => {
    if (!stream?.active) return;
    if (imagePreviewerData?.length) return;
    const video = document.getElementById("camera") as HTMLVideoElement;
    const canvas = document.getElementById("snapshot") as HTMLCanvasElement;
    const photoContainer = document.getElementById("photo");

    const context = canvas.getContext("2d");
    if (context && photoContainer) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageDataURL = canvas.toDataURL("image/png");
      const imageContent = document.createElement("img");
      const screenSize = window.innerWidth;

      imageContent.style.width = screenSize >= 760 ? "480px" : "280px";
      imageContent.style.borderRadius = "8px";
      imageContent.style.marginTop = "8px";
      imageContent.src = imageDataURL;

      photoContainer.appendChild(imageContent);

      const blobFile = base64ToBlobConverter(imageDataURL);
      const file = new File([blobFile], "foto.jpg", { type: blobFile.type });

      const finalFile = await compressFile(file);
      const url = URL.createObjectURL(finalFile);
      setImagePreviewerData(url);
      setFileName("");
    }
  };

  const savePicture = () => {
    if (imagePreviewerData) {
      setIsCameraModalOpen(false);
      stream?.getTracks().forEach((track) => {
        track.stop();
      });
    }
  };

  const cancelTakePicture = () => {
    setIsCameraModalOpen(false);
    setImagePreviewerData(undefined);
    stream?.getTracks().forEach((track) => {
      track.stop();
    });
  };

  const handleTakeAnotherPicture = () => {
    setImagePreviewerData(undefined);
    const photoContainer = document.getElementById("photo");
    const photoContent = photoContainer?.getElementsByTagName("img");

    if (photoContent) {
      const photoContentList = Array.from(photoContent)[0];
      photoContainer?.removeChild(photoContentList);
    }
    takePicture();
  };

  const handleChangeImage = async (event: any) => {
    const file = event.target.files[0];
    if (file) {
      await compressFile(file);
      const url = URL.createObjectURL(file);
      setFileName(file.name);
      setImagePreviewerData(url);
    }
  };

  useEffect(() => {
    if (isCameraModalOpen) {
      handleStartCamera();
    }
  }, [isCameraModalOpen]);

  return (
    <>
      {registerModalOpen && (
        <div
          onClick={handleCloseModalClickingOutside}
          ref={modalContainer}
          className={`${style.modalContainer}`}
        >
          {isCameraModalOpen && (
            <div className={style.modalCamera}>
              <div
                style={{
                  display: !loadCameraData && stream?.active ? "block" : "none",
                }}
              >
                <video
                  style={{ display: !imagePreviewerData ? "block" : "none" }}
                  className={style.videoCamera}
                  id="camera"
                  autoPlay
                ></video>
                <>
                  <canvas
                    id="snapshot"
                    width="640"
                    height="480"
                    style={{ display: "none" }}
                  ></canvas>
                  <div id="photo" className={style.photoContainer}></div>
                </>
              </div>

              {!loadCameraData && !stream?.active && (
                <div
                  className={style.videoCamera}
                  style={{
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                >
                  <ErrorOutlinedIcon
                    style={{ fontSize: "80px", color: "rgba(0, 0, 0, 0.6)" }}
                  />
                  <p
                    style={{
                      textAlign: "center",
                      color: "rgba(0, 0, 0, 0.6)",
                      fontWeight: "bold",
                    }}
                  >
                    Libere o acesso a câmera nas configurações do navegador.
                  </p>
                </div>
              )}

              {loadCameraData && (
                <Skeleton
                  animation="pulse"
                  className={style.videoCamera}
                  style={{
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                  }}
                  variant="rectangular"
                />
              )}

              <div className={style.containerButtonPhoto}>
                <div>
                  <ButtonComponent
                    style={{
                      fontSize: "12px",
                      textTransform: "none",
                      backgroundColor: "transparent",
                      color: "var(--red-600)",
                      border: "1px solid var(--red-600)",
                      fontWeight: "bold",
                      boxShadow: "none",
                    }}
                    onClick={
                      imagePreviewerData
                        ? handleTakeAnotherPicture
                        : cancelTakePicture
                    }
                    buttonText={"Cancelar"}
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
                    onClick={!imagePreviewerData ? takePicture : savePicture}
                    buttonText={
                      imagePreviewerData ? "Salvar foto" : "Tirar foto"
                    }
                    disabled={!stream?.active}
                  />
                </div>
              </div>
            </div>
          )}
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
                idInput="name"
                inputLabel="Nome completo"
                style={{ textTransform: "capitalize" }}
                setInputValue={setName}
                inputValue={name}
                inputType="text"
                placeholder="Ex: João da Silva Santos"
              />
              <InputFieldComponent
                required={true}
                idInput="cpf"
                inputLabel="CPF (somente números)"
                setInputValue={(event) => setCpf(maskCpfFunction(event))}
                inputValue={cpf}
                inputType="text"
                placeholder="999.999.999-99"
              />
              <InputFieldComponent
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
                selectId="period"
                setSelectValue={setPeriod}
                selectLabel="Período"
                selectOptions={periodOptions}
                selectName="period"
                labelText="Selecione um período"
              />
              <SelectComponent
                required
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
                    !imagePreviewerData
                  }
                  buttonText="Enviar"
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
