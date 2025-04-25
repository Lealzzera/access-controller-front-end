"use client";

import { useRef } from "react";
import style from "./style.module.css";
import { useRouter } from "next/navigation";

// type ModalRegisterComponentProps = {
//   isModalOpen: boolean;
//   setIsModalOpen: (value: boolean) => void;
// };

export default function ModalRegisterComponent() {
  const modalContainer = useRef(null);
  const router = useRouter();

  const handleCloseModal = () => {
    router.back();
  };

  return (
    <div
      onClick={handleCloseModal}
      ref={modalContainer}
      className={`${style.modalContainer}`}
    >
      <div className={style.modalContentWrapped}></div>
    </div>
  );
}
