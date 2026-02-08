'use client';

import ButtonComponent from '@/app/components/ButtonComponent/ButtonComponent';
import CardInfoResponsibleComponent from '@/app/components/CardInfoResponsibleComponent/CardInfoResponsibleComponent';
import style from './styles.module.css';

const mockResponsibleList = [
  {
    id: '1234',
    name: 'Matheus Leal',
    email: 'matheus.mleall@gmail.com',
    cpf: '22334444444',
    phoneNumber: '11958064344',
    picture: '',
  },
  {
    id: '5678',
    name: 'Matheus Leal',
    email: 'matheus.mleall@gmail.com',
    cpf: '22334444444',
    phoneNumber: '11958064344',
    picture: '',
  },
  {
    id: '1011',
    name: 'Matheus Leal',
    email: 'matheus.mleall@gmail.com',
    cpf: '22334444444',
    phoneNumber: '11958064344',
    picture: '',
  },
  {
    id: '1213',
    name: 'Matheus Leal',
    email: 'matheus.mleall@gmail.com',
    cpf: '22334444444',
    phoneNumber: '11958064344',
    picture: '',
  },
  {
    id: '1214',
    name: 'Matheus Leal',
    email: 'matheus.mleall@gmail.com',
    cpf: '22334444444',
    phoneNumber: '11958064344',
    picture: '',
  },
  {
    id: '222',
    name: 'Matheus Leal',
    email: 'matheus.mleall@gmail.com',
    cpf: '22334444444',
    phoneNumber: '11958064344',
    picture: '',
  },
  {
    id: '4444',
    name: 'Matheus Leal',
    email: 'matheus.mleall@gmail.com',
    cpf: '22334444444',
    phoneNumber: '11958064344',
    picture: '',
  },
  {
    id: '3',
    name: 'Matheus Leal',
    email: 'matheus.mleall@gmail.com',
    cpf: '22334444444',
    phoneNumber: '11958064344',
    picture: '',
  },
];

export default function Responsibles() {
  return (
    <div className={style.responsiblesContainer}>
      <div className={style.responsiblesTitleContainer}>
        <h1 className={style.responsiblesTitle}>Lista de responsáveis:</h1>
        <div>
          <ButtonComponent buttonText="+" />
        </div>
      </div>
      <ul className={style.responsiblesList}>
        {mockResponsibleList.map((item) => (
          <li key={item.id}>
            <CardInfoResponsibleComponent
              name={item.name}
              email={item.email}
              cpf={item.cpf}
              phoneNumber={item.phoneNumber}
              picture={item.picture}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
