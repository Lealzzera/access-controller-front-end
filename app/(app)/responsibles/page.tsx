'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ButtonComponent from '@/app/components/ButtonComponent/ButtonComponent';
import ModalResponsibleInfoComponent from '@/app/components/ModalResponsibleInfoComponent/ModalResponsibleInfoComponent';
import style from './styles.module.css';
import ModalRegisterResponsibleComponent from '@/app/components/ModalRegisterResponsibleComponent/ModalRegisterResponsibleComponent';
import { getResponsiblesPaginated } from '@/app/actions/getResponsiblesPaginated';
import { Responsible } from '@/app/types/responsible.type';
import CardInfoResponsibleComponent from '@/app/components/CardInfoResponsibleComponent/CardInfoResponsibleComponent';
import Skeleton from '@mui/material/Skeleton';

export default function Responsibles() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegisterModalOPen, setIsRegisterModalOpen] = useState(false);
  const [selectedResponsible, setSelectedResponsible] = useState<any>(null);
  const [responsibles, setResponsibles] = useState<Responsible[] | []>([]);
  const [currentCursor, setCurrentCursor] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const handleOpenModalForNewResponsible = () => {
    setIsRegisterModalOpen(true);
  };

  const handleOpenModal = (responsible: Responsible) => {
    setSelectedResponsible(responsible);
    setIsModalOpen(true);
  };

  const fetchResponsibles = useCallback(async (cursor: string, isInitial: boolean) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    const result = await getResponsiblesPaginated({ cursor, take: 20 });

    setResponsibles((prev) =>
      isInitial ? result.responsibles : [...prev, ...result.responsibles]
    );
    setCurrentCursor(result.nextCursor ?? '');
    setHasMore(!!result.nextCursor);

    if (isInitial) setLoading(false);
    else setLoadingMore(false);
  }, []);

  useEffect(() => {
    fetchResponsibles('', true);
  }, [fetchResponsibles]);

  const lastItemRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchResponsibles(currentCursor, false);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore, currentCursor, fetchResponsibles]
  );

  return (
    <div className={style.responsiblesContainer}>
      <ModalRegisterResponsibleComponent
        isModalOpen={isRegisterModalOPen}
        setIsModalOpen={setIsRegisterModalOpen}
      />
      <div className={style.responsiblesTitleContainer}>
        <h1 className={style.responsiblesTitle}>Lista de responsáveis:</h1>
        <div>
          <ButtonComponent onClick={handleOpenModalForNewResponsible} buttonText="+" />
        </div>
      </div>
      {loading && responsibles.length === 0 && (
        <ul className={style.responsiblesList}>
          {Array.from({ length: 6 }).map((_, index) => (
            <li key={index}>
              <div
                style={{
                  backgroundColor: 'var(--gray-100)',
                  borderRadius: '8px',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.5rem',
                  gap: '1.5rem',
                  maxWidth: '350px',
                  boxShadow: '3px 3px 5px 0px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Skeleton variant="circular" width={80} height={80} />
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '65%' }}
                >
                  <Skeleton variant="text" width="80%" height={20} />
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="70%" height={20} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && responsibles.length === 0 && (
        <div
          style={{
            height: '50vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p>Não há responsáveis cadastrados</p>
        </div>
      )}

      {!loading && responsibles.length > 0 && (
        <ul className={style.responsiblesList}>
          {responsibles.map((item, index) => (
            <li key={item.id} ref={index === responsibles.length - 1 ? lastItemRef : null}>
              <CardInfoResponsibleComponent
                name={item.name}
                email={item.email}
                cpf={item.cpf}
                phoneNumber={item.phoneNumber}
                picture={item.picture}
                onClick={() => handleOpenModal(item)}
              />
            </li>
          ))}
          {loadingMore &&
            Array.from({ length: 3 }).map((_, index) => (
              <li key={`skeleton-more-${index}`}>
                <div
                  style={{
                    backgroundColor: 'var(--gray-100)',
                    borderRadius: '8px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.5rem',
                    gap: '1.5rem',
                    maxWidth: '350px',
                    boxShadow: '3px 3px 5px 0px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Skeleton variant="circular" width={80} height={80} />
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      width: '65%',
                    }}
                  >
                    <Skeleton variant="text" width="80%" height={20} />
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="70%" height={20} />
                  </div>
                </div>
              </li>
            ))}
        </ul>
      )}
      <ModalResponsibleInfoComponent
        isModalResponsibleInfoOpen={isModalOpen}
        setIsModalResponsibleInfoOpen={setIsModalOpen}
        responsibleInfo={selectedResponsible}
      />
    </div>
  );
}
