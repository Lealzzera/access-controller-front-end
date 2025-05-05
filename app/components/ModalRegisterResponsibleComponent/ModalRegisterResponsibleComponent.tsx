'use client';

import { useUser } from '@/app/context/userContext';
import style from './style.module.css';
import { SyntheticEvent, useRef, useState } from 'react';
import InputFieldComponent from '../InputFieldComponent/InputFieldComponent';
import ButtonComponent from '../ButtonComponent/ButtonComponent';
import { CircularProgress } from '@mui/material';
import NoPhotographyRoundedIcon from '@mui/icons-material/NoPhotographyRounded';
import Image from 'next/image';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export default function ModalRegisterResponsibleComponent() {
  const {
    registerResponsibleModalOpen,
    setRegisterResponsibleModalOpen,
    lastChildRegisteredInformation,
  } = useUser();

  const [loadRegisterData, setLoadRegisterData] = useState(false);
  const [imagePreviewerData, setImagePreviewerData] = useState('');
  const [fileName, setFileName] = useState('');

  const [responsibleName, setResponsibleName] = useState('');
  const [responsibleCpf, setResponsibleCpf] = useState('');
  const [street, setStreet] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [kinship, setKinship] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const modalBg = useRef<HTMLDivElement | null>(null);

  const handleClickOutSide = (event: SyntheticEvent) => {
    if (event.target !== modalBg.current) return;
    setRegisterResponsibleModalOpen(false);
  };

  return (
    <>
      {registerResponsibleModalOpen && (
        <div ref={modalBg} onClick={handleClickOutSide} className={style.registerModalBg}>
          <div className={style.registerModalContent}>
            <div className={style.closeModalIcon}>
              <CloseRoundedIcon fontSize="large" className={style.closeIcon} />
            </div>
            <div className={style.registerInformationText}>
              <h1 className={style.modalTitle}>Cadastrar responsável</h1>
              <p className={style.modalDescription}>
                Vamos cadastrar um responsável para o{' '}
                <span>
                  {lastChildRegisteredInformation ? lastChildRegisteredInformation.name : 'teste'}
                </span>
              </p>
            </div>
            <form className={style.registerForm}>
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
                setInputValue={(event) => setResponsibleCpf(event)}
              />
              <InputFieldComponent
                idInput="zipcode"
                inputLabel="CEP"
                required
                inputType="text"
                inputValue={postalCode}
                setInputValue={(event) => setPostalCode(event)}
              />
              <InputFieldComponent
                idInput="street"
                required
                inputLabel="Rua"
                inputType="text"
                inputValue={street}
                setInputValue={(event) => setStreet(event)}
              />
              <InputFieldComponent
                idInput="neighborhood"
                inputLabel="Bairro"
                required
                inputType="text"
                inputValue={neighborhood}
                setInputValue={(event) => setNeighborhood(event)}
              />
              <InputFieldComponent
                idInput="city"
                required
                inputLabel="Cidade"
                inputType="text"
                inputValue={city}
                setInputValue={(event) => setCity(event)}
              />
              <InputFieldComponent
                idInput="state"
                required
                inputLabel="Estado"
                inputType="text"
                inputValue={state}
                setInputValue={(event) => setState(event)}
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
              >
                'nothing'
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
                  />
                </div>
              </div>
              <div className={style.registerButtonContainer}>
                <ButtonComponent
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
        </div>
      )}
    </>
  );
}
