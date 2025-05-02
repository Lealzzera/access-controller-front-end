import HomePage from "@/app/components/HomePage/HomePage";
import ModalRegisterChildComponent from "@/app/components/ModalRegisterChild/ModalRegisterChildComponent";
import ModalRegisterResponsibleComponent from "@/app/components/ModalRegisterResponsibleComponent/ModalRegisterResponsibleComponent";

export default function Home() {
  return (
    <div>
      <HomePage />
      <ModalRegisterChildComponent />
      <ModalRegisterResponsibleComponent />
    </div>
  );
}
