type HandleStartCameraProps = {
  setLoadCameraData: (value: boolean) => void;
  setStream: (value: MediaStream | undefined) => void;
};

export const handleStartCamera = async ({
  setLoadCameraData,
  setStream,
}: HandleStartCameraProps) => {
  try {
    setLoadCameraData(true);
    const streamNavigator = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    setStream(streamNavigator);
    if (streamNavigator.active) {
      setLoadCameraData(false);
    }
    const videoElement = document.getElementById('camera') as HTMLVideoElement;
    if (videoElement) {
      videoElement.srcObject = streamNavigator;
      videoElement.play();
    }
  } catch (err) {
    setLoadCameraData(false);
    console.error("Error accessing user's camera: ", err);
  }
};
