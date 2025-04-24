"use client"
import { useRouter } from 'next/navigation';

type ModalRegisterComponentProps = {
    modalText: string
}

export default function ModalRegisterComponent({modalText}: ModalRegisterComponentProps) {
  const router = useRouter();

  const closeModal = () => {
    router.back();
  }

  return (
    <div className="modal">
      <div style={{backgroundColor: "red", height: "400px", width: "800px"}} className="modal-content">
        <h1>{modalText}</h1>
        <button onClick={closeModal}>Close</button>
      </div>
    </div>
  )
}