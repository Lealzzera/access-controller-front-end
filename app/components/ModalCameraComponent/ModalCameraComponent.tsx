'use client';

import { Skeleton } from '@mui/material';
import style from './style.module.css';
import ButtonComponent from '../ButtonComponent/ButtonComponent';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import { base64ToBlobConverter } from '@/app/helpers/base64ToBlobConverter';
import compressFile from '@/app/helpers/compressFile';

type ModalCameraComponentProps = {
  isCameraModalOpen: boolean;
  loadCameraData: boolean;
  setLoadCameraData: (value: boolean) => void;
  setIsCameraModalOpen: (value: boolean) => void;
  stream: MediaStream | undefined;
  imagePreviewerData: string | undefined;
  setImagePreviewerData: (value: string | undefined) => void;
  setFileName: (value: string) => void;
  setFileData: (value: File | null) => void;
};

export default function ModalCameraComponent({
  isCameraModalOpen,
  setIsCameraModalOpen,
  loadCameraData,
  stream,
  imagePreviewerData,
  setImagePreviewerData,
  setFileName,
  setFileData,
}: ModalCameraComponentProps) {
  const handleTakeAnotherPicture = () => {
    setImagePreviewerData(undefined);
    const photoContainer = document.getElementById('photo');
    const photoContent = photoContainer?.getElementsByTagName('img');

    if (photoContent) {
      console.log('photocontent');
      const photoContentList = Array.from(photoContent)[0];
      photoContainer?.removeChild(photoContentList);
    }
    takePicture();
  };

  const takePicture = async () => {
    if (!stream?.active) return;
    if (imagePreviewerData?.length) return;
    const video = document.getElementById('camera') as HTMLVideoElement;
    const canvas = document.getElementById('snapshot') as HTMLCanvasElement;
    const photoContainer = document.getElementById('photo');

    const context = canvas.getContext('2d');
    if (context && photoContainer) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageDataURL = canvas.toDataURL('image/png');
      const imageContent = document.createElement('img');
      const screenSize = window.innerWidth;

      imageContent.style.width = screenSize >= 760 ? '480px' : '280px';
      imageContent.style.borderRadius = '8px';
      imageContent.style.marginTop = '8px';
      imageContent.src = imageDataURL;

      photoContainer.appendChild(imageContent);

      const blobFile = base64ToBlobConverter(imageDataURL);
      const file = new File([blobFile], 'foto.jpg', {
        type: blobFile.type,
      });

      const finalFile = await compressFile(file);
      setFileData(finalFile);
      const url = URL.createObjectURL(finalFile);
      setImagePreviewerData(url);
      setFileName('');
    }
  };

  const cancelTakePicture = () => {
    setIsCameraModalOpen(false);
    setImagePreviewerData(undefined);
    stream?.getTracks().forEach((track) => {
      track.stop();
    });
  };

  const savePicture = () => {
    if (imagePreviewerData) {
      setIsCameraModalOpen(false);
      stream?.getTracks().forEach((track) => {
        track.stop();
      });
    }
  };

  return (
    <>
      {isCameraModalOpen && (
        <div className={style.modalCamera}>
          <div
            style={{
              display: !loadCameraData && stream?.active ? 'block' : 'none',
            }}
          >
            <video
              style={{
                display: !imagePreviewerData ? 'block' : 'none',
              }}
              className={style.videoCamera}
              id="camera"
              autoPlay
            ></video>
            <>
              <canvas
                id="snapshot"
                width="640"
                height="480"
                style={{
                  display: 'none',
                }}
              ></canvas>
              <div id="photo" className={style.photoContainer}></div>
            </>
          </div>

          {!loadCameraData && !stream?.active && (
            <div
              className={style.videoCamera}
              style={{
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <ErrorOutlinedIcon
                style={{
                  fontSize: '80px',
                  color: 'rgba(0, 0, 0, 0.6)',
                }}
              />
              <p
                style={{
                  textAlign: 'center',
                  color: 'rgba(0, 0, 0, 0.6)',
                  fontWeight: 'bold',
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
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                height: '100%',
              }}
              variant="rectangular"
            />
          )}
          <div className={style.containerButtonPhoto}>
            <div>
              <ButtonComponent
                style={{
                  fontSize: '12px',
                  textTransform: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--red-600)',
                  border: '1px solid var(--red-600)',
                  fontWeight: 'bold',
                  boxShadow: 'none',
                }}
                onClick={imagePreviewerData ? handleTakeAnotherPicture : cancelTakePicture}
                buttonText={'Cancelar'}
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
                onClick={!imagePreviewerData ? takePicture : savePicture}
                buttonText={imagePreviewerData ? 'Salvar foto' : 'Tirar foto'}
                disabled={!stream?.active}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
