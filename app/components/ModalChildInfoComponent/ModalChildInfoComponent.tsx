import { useEffect, useRef, useState } from 'react';
import style from './style.module.css';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { differenceInYears } from 'date-fns';
import Image from 'next/image';
import { getResponsibleListByChildId } from '@/app/actions/getResponsibleListByChildId';
import ButtonComponent from '../ButtonComponent/ButtonComponent';

type ModalChildInfoComponentProps = {
  isModalChildInfoOpen: boolean;
  setIsModalChildInfoOpen: (value: boolean) => void;
  childInfo: any;
};

type ResponsibleObject = {
  cpf: string;
  email: string;
  id: string;
  kinship: string;
  name: string;
  picture: string;
};

export default function ModalChildInfoComponent({
  isModalChildInfoOpen,
  setIsModalChildInfoOpen,
  childInfo,
}: ModalChildInfoComponentProps) {
  const [childAge, setChildAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [childResponsibles, setChildResponsibles] = useState([]);
  const modalRef = useRef(null);

  const handleCloseModal = () => {
    setIsModalChildInfoOpen(false);
  };

  const handleCloseClickingOutside = (event: any) => {
    if (event.target === modalRef.current) handleCloseModal();
  };

  const generateChildAge = () => {
    const today = new Date();
    const childAgeFormatted = new Date(childInfo.birthDate);
    const age = differenceInYears(today, childAgeFormatted);

    setChildAge(String(age));
  };

  useEffect(() => {
    if (!childInfo) return;
    generateChildAge();
    console.log(childInfo);
    const fetchResponsibles = async () => {
      setLoading(true);
      const response = await getResponsibleListByChildId(childInfo.id);
      console.log(response);
      setChildResponsibles(response);
      setLoading(false);
    };

    fetchResponsibles();
  }, [childInfo]);

  return (
    <>
      {isModalChildInfoOpen && (
        <div onClick={handleCloseClickingOutside} ref={modalRef} className={style.modalBg}>
          <div className={style.modalBody}>
            <div className={style.closeButtonContainer}>
              <CloseRoundedIcon
                onClick={handleCloseModal}
                fontSize="large"
                className={style.closeIcon}
              />
            </div>
            {childInfo && (
              <>
                <div className={style.modalContent}>
                  <div className={style.imgContainer}>
                    <Image
                      className={style.childImg}
                      src={childInfo.picture}
                      width={600}
                      height={600}
                      alt={childInfo.name}
                    />
                  </div>
                  <div className={style.containerInfo}>
                    <h1 className={style.childName}>{childInfo.name}</h1>
                    <div className={style.childStats}>
                      <p>
                        <span>Idade: </span> {childAge}
                      </p>
                      <p>
                        <span>Período: </span> {childInfo.period.name}
                      </p>
                      <p>
                        <span>Turma: </span> {childInfo.grade.name}
                      </p>
                      <p className={style.status}>
                        <span>Status: </span>
                        {childInfo.isPresent ? (
                          <span className={style.active}>Presente</span>
                        ) : (
                          <span className={style.inactive}>Ausente</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={style.responsibleListContainer}>
                  <h1 className={style.childName}>Responsáveis</h1>
                  {childResponsibles.length === 0 && (
                    <div className={style.notFoundResponsibles}>
                      <p>Não existem responsáveis cadastrados.</p>
                      <div className={style.registerResponsibleButton}>
                        <ButtonComponent buttonText="Cadastrar" />
                      </div>
                    </div>
                  )}
                  {childResponsibles.length > 0 && !loading && (
                    <ul className={style.responsiblesContainer}>
                      {childResponsibles.map((responsible: ResponsibleObject) => (
                        <li className={style.responsibleCard} key={responsible.id}>
                          <div className={style.responsiblePictureContainer}>
                            <Image
                              src={responsible.picture}
                              width={600}
                              height={600}
                              className={style.responsiblePicture}
                              alt={responsible.name}
                            />
                          </div>
                          <div className={style.responsibleWrap}>
                            <div className={style.responsibleInfo}>
                              <p className={style.responsibleName}>{responsible.name}</p>
                              <p>
                                <span>Parentesco: </span> {responsible.kinship}
                              </p>
                              <p>
                                <span>Email: </span> {responsible.email}
                              </p>
                              <p>
                                <span>CPF: </span> {responsible.cpf}
                              </p>
                              <p>
                                <span>Telefone: </span> 11-95506-0047
                              </p>
                            </div>
                            <div className={style.infoButtonContainer}>
                              <ButtonComponent buttonText="Detalhes" />
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
