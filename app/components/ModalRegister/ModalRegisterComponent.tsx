"use client";

import { useEffect, useRef, useState } from "react";
import style from "./style.module.css";
import { useRouter } from "next/navigation";
import InputFieldComponent from "../InputFieldComponent/InputFieldComponent";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SelectComponent from "../SelectComponent/SelectComponent";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import NoPhotographyRoundedIcon from "@mui/icons-material/NoPhotographyRounded";
import Image from "next/image";
import { Skeleton } from "@mui/material";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";

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
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [period, setPeriod] = useState("");
  const [grade, setGrade] = useState("");

  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [imageData, setImageData] = useState<string | undefined>(undefined);
  const [loadCameraData, setLoadCameraData] = useState(false);
  const [stream, setStream] = useState<MediaStream | undefined>(undefined);

  const modalContainer = useRef(null);
  const router = useRouter();

  const handleCloseModalClickingOutside = (event: any) => {
    if (event.target === modalContainer.current) {
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    router.back();
    stream?.getTracks().forEach((track) => {
      track.stop();
    });
  };

  const handleRegister = (event: any) => {
    console.log(period);
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
    if (imageData) {
      setImageData(undefined);
    }
    setIsCameraModalOpen(true);
  };

  const takePicture = () => {
    if (!stream?.active) return;
    if (imageData?.length) return;
    const video = document.getElementById("camera") as HTMLVideoElement;
    const canvas = document.getElementById("snapshot") as HTMLCanvasElement;
    const photoContainer = document.getElementById("photo");

    const context = canvas.getContext("2d");
    if (context && photoContainer) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageDataURL = canvas.toDataURL("image/png"); // get image as Base64
      const imageContent = document.createElement("img");
      const screenSize = window.innerWidth;

      imageContent.style.width = screenSize >= 760 ? "480px" : "280px";
      imageContent.style.borderRadius = "8px";
      imageContent.style.marginTop = "8px";
      imageContent.src = imageDataURL;

      photoContainer.appendChild(imageContent);

      setImageData(imageDataURL);
    }
  };

  const savePicture = () => {
    if (imageData) {
      setIsCameraModalOpen(false);
      stream?.getTracks().forEach((track) => {
        track.stop();
      });
    }
  };

  const cancelTakePicture = () => {
    setIsCameraModalOpen(false);
    setImageData(undefined);
    stream?.getTracks().forEach((track) => {
      track.stop();
    });
  };

  const handleTakeAnotherPicture = () => {
    setImageData(undefined);
    const photoContainer = document.getElementById("photo");
    const photoContent = photoContainer?.getElementsByTagName("img");

    if (photoContent) {
      const photoContentList = Array.from(photoContent)[0];
      photoContainer?.removeChild(photoContentList);
    }
    takePicture();
  };

  const handleChangeImage = (event: any) => {
    console.log(event.target.files[0]);
  };

  useEffect(() => {
    if (isCameraModalOpen) {
      handleStartCamera();
    }
  }, [isCameraModalOpen]);

  return (
    <>
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
                style={{ display: !imageData ? "block" : "none" }}
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
                    imageData ? handleTakeAnotherPicture : cancelTakePicture
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
                  onClick={!imageData ? takePicture : savePicture}
                  buttonText={imageData ? "Salvar foto" : "Tirar foto"}
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
              Vamos lá! Para cadastrar uma nova criança, basta inserir os dados
              abaixo.
            </p>
          </div>
          <form className={style.formContainer} action={handleRegister}>
            <InputFieldComponent
              required={true}
              idInput="name"
              inputLabel="Nome"
              style={{ textTransform: "capitalize" }}
              setInputValue={setName}
              inputValue={name}
              inputType="text"
            />
            <InputFieldComponent
              required={true}
              idInput="cpf"
              inputLabel="CPF"
              setInputValue={setCpf}
              inputValue={cpf}
              inputType="text"
            />
            <SelectComponent
              selectId="period"
              setSelectValue={setPeriod}
              selectLabel="Período"
              selectOptions={periodOptions}
              selectName="period"
            />
            <SelectComponent
              selectId="grade"
              setSelectValue={setGrade}
              selectLabel="Turma"
              selectOptions={gradeOptions}
              selectName="grade"
            />
            <div className={style.noPicture}>
              {!imageData ? (
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
                  src={imageData}
                />
              )}
            </div>
            <div className={style.containerButtons}>
              <div>
                {/* <ButtonComponent
                  style={{
                    fontSize: "12px",
                    textTransform: "none",
                    backgroundColor: "transparent",
                    color: "var(--blue-400)",
                    border: "1px solid var(--blue-400)",
                    fontWeight: "bold",
                    boxShadow: "none",
                  }}
                  buttonText="Selecionar"
                /> */}
                <input
                  onChange={handleChangeImage}
                  type="file"
                  accept="image/*"
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
                onClick={handleRegister}
                disabled={!name || !cpf || !period || !grade || !imageData}
                buttonText="Enviar"
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
