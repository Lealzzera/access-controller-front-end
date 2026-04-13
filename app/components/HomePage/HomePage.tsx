'use client';

import CardInfoComponent from '@/app/components/CardInfoComponent/CardInfoComponent';
import style from './style.module.css';
import { useUser } from '@/app/context/userContext';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getChildrenPaginated } from '@/app/actions/getChildrenPaginated';
import { getChildrenListByResponsibleId } from '@/app/actions/getChildrenListByResposnibleId';
import { createSolicitation } from '@/app/actions/createSolicitation';
import { sendArrivalAlert } from '@/app/actions/sendArrivalAlert';
import { CircularProgress } from '@mui/material';
import { Skeleton } from '@mui/material';
import ModalChildInfoComponent from '../ModalChildInfoComponent/ModalChildInfoComponent';
import { Role } from '@/app/enums/Role.enum';
import { useSocket } from '@/app/hooks/useSocket';
import { toast } from 'react-toastify';

type ChildrenDataType = {
  id: string;
  name: string;
  cpf: string;
  isPresent: boolean;
  period: { id: string; name: string };
  grade: { id: string; name: string };
  picture: string;
};

type ActiveFilter = 'all' | 'present' | 'absent';

// Estado de aviso de chegada por criança
type ArrivalState = 'none' | 'MINUTES_30' | 'MINUTES_15';

export default function HomePage() {
  const { userInfo } = useUser();
  const [childrenData, setChildrenData] = useState<ChildrenDataType[]>([]);
  const [currentCursor, setCurrentCursor] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [openModalChildInfo, setOpenModalChildInfo] = useState(false);
  const [childInfo, setChildInfo] = useState<any>(undefined);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');

  // Estados de solicitação real
  const [solicitingIds, setSolicitingIds] = useState<string[]>([]);
  const [cooldownIds, setCooldownIds] = useState<string[]>([]);

  // Estado dos avisos de chegada: childId → 'none' | 'MINUTES_30' | 'MINUTES_15'
  const [arrivalStates, setArrivalStates] = useState<Record<string, ArrivalState>>({});
  // IDs onde o alerta está sendo enviado
  const [alertingIds, setAlertingIds] = useState<string[]>([]);

  const { onSolicitationAccepted, onSolicitationRejected } = useSocket();
  const cooldownTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const observer = useRef<IntersectionObserver | null>(null);

  const handleOpenCard = (cardInfo: ChildrenDataType) => {
    setOpenModalChildInfo(true);
    setChildInfo(cardInfo);
  };

  const startCooldown = (childId: string) => {
    setCooldownIds((prev) => [...prev, childId]);
    const timer = setTimeout(
      () => {
        setCooldownIds((prev) => prev.filter((id) => id !== childId));
        cooldownTimers.current.delete(childId);
      },
      5 * 60 * 1000
    );
    cooldownTimers.current.set(childId, timer);
  };

  useEffect(() => {
    return () => {
      cooldownTimers.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  // ── Alerta de chegada (30 ou 15 min) ──────────────────────────────────────
  const handleArrivalAlert = async (childId: string, minutes: 'MINUTES_30' | 'MINUTES_15') => {
    setAlertingIds((prev) => [...prev, childId]);
    try {
      const result = await sendArrivalAlert({ minutes, childId });
      if (result?.status >= 400) {
        toast.error('Erro ao enviar aviso.');
      } else {
        setArrivalStates((prev) => ({ ...prev, [childId]: minutes }));
        const label = minutes === 'MINUTES_30' ? '30 minutos' : '15 minutos';
        toast.info(`Aviso enviado: chego em ${label}.`);
      }
    } catch {
      toast.error('Erro ao enviar aviso.');
    }
    setAlertingIds((prev) => prev.filter((id) => id !== childId));
  };

  // ── Solicitação real (PICK_UP) ────────────────────────────────────────────
  const handleSolicitation = async (childId: string, type: 'DROP_OFF' | 'PICK_UP') => {
    if (cooldownIds.includes(childId)) {
      toast.warn('Aguarde 5 minutos para enviar outra solicitação para esta criança.');
      return;
    }
    setSolicitingIds((prev) => [...prev, childId]);
    try {
      const result = await createSolicitation({ type, childId });
      if (result?.status && result.status >= 400) {
        toast.error('Erro ao enviar solicitação.');
      } else {
        toast.success('Solicitação enviada! Aguarde a resposta da escola.');
        startCooldown(childId);
        // limpa o estado de aviso de chegada após enviar a solicitação real
        setArrivalStates((prev) => ({ ...prev, [childId]: 'none' }));
      }
    } catch {
      toast.error('Erro ao enviar solicitação.');
    }
    setSolicitingIds((prev) => prev.filter((id) => id !== childId));
  };

  useEffect(() => {
    const unsubAccepted = onSolicitationAccepted((data) => {
      const message =
        data.type === 'DROP_OFF'
          ? `${data.child.name} foi recebida pela escola!`
          : `${data.child.name} foi liberada para você!`;
      toast.success(message);
      setChildrenData((prev) =>
        prev.map((c) =>
          c.id === data.child.id ? { ...c, isPresent: data.type === 'DROP_OFF' } : c
        )
      );
    });

    const unsubRejected = onSolicitationRejected((data) => {
      toast.error(`Solicitação para ${data.child.name} foi rejeitada pela escola.`);
    });

    return () => {
      unsubAccepted();
      unsubRejected();
    };
  }, [onSolicitationAccepted, onSolicitationRejected]);

  const filterToActive = (filter: ActiveFilter): boolean | undefined => {
    if (filter === 'present') return true;
    if (filter === 'absent') return false;
    return undefined;
  };

  const fetchInstitutionChildren = useCallback(
    async (cursor: string, isInitial: boolean, filter: ActiveFilter = 'all') => {
      if (!userInfo) return;
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      try {
        const active = filterToActive(filter);
        const result = await getChildrenPaginated({
          institutionId: userInfo.id,
          cursor,
          take: 20,
          active,
        });

        if (!result || result.status || !result.children) {
          setHasMore(false);
          if (isInitial) setLoading(false);
          else setLoadingMore(false);
          return;
        }

        setChildrenData((prev) => (isInitial ? result.children : [...prev, ...result.children]));
        setCurrentCursor(result.nextCursor ?? '');
        setHasMore(!!result.nextCursor);
      } catch {
        setHasMore(false);
      }

      if (isInitial) setLoading(false);
      else setLoadingMore(false);
    },
    [userInfo]
  );

  const fetchResponsibleChildren = useCallback(async () => {
    if (!userInfo) return;
    setLoading(true);
    try {
      const children = await getChildrenListByResponsibleId(userInfo.id);
      if (Array.isArray(children)) {
        setChildrenData(children);
      }
    } catch {
      setChildrenData([]);
    }
    setLoading(false);
    setHasMore(false);
  }, [userInfo]);

  useEffect(() => {
    if (!userInfo) return;
    if (userInfo.role === Role.INSTITUTION) {
      fetchInstitutionChildren('', true, activeFilter);
    } else {
      fetchResponsibleChildren();
    }
  }, [userInfo, fetchInstitutionChildren, fetchResponsibleChildren]);

  const handleFilterChange = (filter: ActiveFilter) => {
    if (filter === activeFilter) return;
    setActiveFilter(filter);
    setCurrentCursor('');
    setHasMore(true);
    fetchInstitutionChildren('', true, filter);
  };

  const lastCardRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchInstitutionChildren(currentCursor, false, activeFilter);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore, currentCursor, activeFilter, fetchInstitutionChildren]
  );

  return (
    <>
      {userInfo?.role === Role.INSTITUTION && (
        <div className={style.filterContainer}>
          <button
            className={`${style.filterButton} ${activeFilter === 'all' ? style.filterButtonActive : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            Todos
          </button>
          <button
            className={`${style.filterButton} ${activeFilter === 'present' ? style.filterButtonActive : ''}`}
            onClick={() => handleFilterChange('present')}
          >
            Presentes
          </button>
          <button
            className={`${style.filterButton} ${activeFilter === 'absent' ? style.filterButtonActive : ''}`}
            onClick={() => handleFilterChange('absent')}
          >
            Ausentes
          </button>
        </div>
      )}
      <ModalChildInfoComponent
        isModalChildInfoOpen={openModalChildInfo}
        setIsModalChildInfoOpen={setOpenModalChildInfo}
        childInfo={childInfo}
      />
      {loading && childrenData.length === 0 && (
        <div className={style.container}>
          <Skeleton variant="rounded" className={style.skeletonComponent} />
          <Skeleton variant="rounded" className={style.skeletonComponent} />
          <Skeleton variant="rounded" className={style.skeletonComponent} />
          <Skeleton variant="rounded" className={style.skeletonComponent} />
          <Skeleton variant="rounded" className={style.skeletonComponent} />
          <Skeleton variant="rounded" className={style.skeletonComponent} />
        </div>
      )}
      <section className={style.container}>
        {childrenData.length === 0 && !loading && (
          <div className={style.noChildrenData}>
            <h1 className={style.noChildrenDataTitle}>
              {activeFilter === 'present'
                ? 'Nenhuma criança presente no momento.'
                : activeFilter === 'absent'
                  ? 'Nenhuma criança ausente no momento.'
                  : 'Não há crianças cadastradas.'}
            </h1>
          </div>
        )}
        {childrenData.length > 0 &&
          childrenData.map((child, index) => {
            const isLastCard = index === childrenData.length - 1;
            const isSoliciting = solicitingIds.includes(child.id);
            const isOnCooldown = cooldownIds.includes(child.id);
            const isAlerting = alertingIds.includes(child.id);
            const arrivalState = arrivalStates[child.id] ?? 'none';
            const hasPreArrival = arrivalState !== 'none';

            return (
              <div
                key={child.id}
                className={style.containerCard}
                ref={isLastCard ? lastCardRef : null}
              >
                <CardInfoComponent
                  isPresent={child.isPresent}
                  onClickCard={() => handleOpenCard(child)}
                  name={child.name}
                  period={child.period.name}
                  grade={child.grade.name}
                  pictureUrl={child.picture}
                />

                {/* Botões só para RESPONSIBLE */}
                {userInfo?.role === Role.RESPONSIBLE && (
                  <div className={style.arrivalButtons}>
                    {/* Linha 1: avisos de chegada (disponível nos dois estados) */}
                    <div className={style.alertRow}>
                      <button
                        className={`${style.alertButton} ${arrivalState === 'MINUTES_30' ? style.alertButtonActive : ''}`}
                        disabled={isAlerting || arrivalState === 'MINUTES_30'}
                        onClick={() => handleArrivalAlert(child.id, 'MINUTES_30')}
                      >
                        Chego em 30 min
                      </button>
                      <button
                        className={`${style.alertButton} ${arrivalState === 'MINUTES_15' ? style.alertButtonActive : ''}`}
                        disabled={isAlerting || arrivalState === 'MINUTES_15'}
                        onClick={() => handleArrivalAlert(child.id, 'MINUTES_15')}
                      >
                        Chego em 15 min
                      </button>
                    </div>

                    {/* Linha 2: botão condicional — entrada ou saída */}
                    {!child.isPresent ? (
                      <button
                        className={`${style.dropOffButton} ${hasPreArrival ? style.arrivedButton : ''}`}
                        disabled={isSoliciting || isOnCooldown}
                        onClick={() => handleSolicitation(child.id, 'DROP_OFF')}
                      >
                        {isSoliciting
                          ? 'Enviando...'
                          : isOnCooldown
                            ? 'Aguarde...'
                            : hasPreArrival
                              ? 'Cheguei'
                              : 'Solicitar entrada'}
                      </button>
                    ) : (
                      <button
                        className={`${style.pickUpButton} ${hasPreArrival ? style.arrivedButton : ''}`}
                        disabled={isSoliciting || isOnCooldown}
                        onClick={() => handleSolicitation(child.id, 'PICK_UP')}
                      >
                        {isSoliciting
                          ? 'Enviando...'
                          : isOnCooldown
                            ? 'Aguarde...'
                            : hasPreArrival
                              ? 'Cheguei'
                              : 'Buscar criança'}
                      </button>
                    )}
                  </div>
                )}

                {/* Botão buscar para RESPONSIBLE em crianças presentes */}
                {userInfo?.role === Role.RESPONSIBLE && child.isPresent && (
                  <div className={style.solicitationButtons}>
                    <button
                      className={style.pickUpButton}
                      disabled={isSoliciting || isOnCooldown}
                      onClick={() => handleSolicitation(child.id, 'PICK_UP')}
                    >
                      {isSoliciting
                        ? 'Enviando...'
                        : isOnCooldown
                          ? 'Aguarde...'
                          : 'Buscar criança'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        {loadingMore && childrenData.length > 0 && (
          <div className={style.circularProgressContainer}>
            <CircularProgress className={style.circularProgress} />
          </div>
        )}
      </section>
    </>
  );
}
