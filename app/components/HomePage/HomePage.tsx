'use client';

import { createSolicitation } from '@/app/actions/createSolicitation';
import { getChildrenListByResponsibleId } from '@/app/actions/getChildrenListByResposnibleId';
import { getChildrenPaginated } from '@/app/actions/getChildrenPaginated';
import { sendArrivalAlert } from '@/app/actions/sendArrivalAlert';
import CardInfoComponent from '@/app/components/CardInfoComponent/CardInfoComponent';
import { useUser } from '@/app/context/userContext';
import { Role } from '@/app/enums/Role.enum';
import { useSocket } from '@/app/hooks/useSocket';
import { CircularProgress, Skeleton } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import ModalChildInfoComponent from '../ModalChildInfoComponent/ModalChildInfoComponent';
import style from './style.module.css';

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

  const [solicitingIds, setSolicitingIds] = useState<string[]>([]);
  // Per-child cooldown end timestamps (ms epoch). Persisted in localStorage
  // so the disabled state survives reloads / navigation.
  const [solicitationCooldowns, setSolicitationCooldowns] = useState<Record<string, number>>({});
  const [alertCooldowns, setAlertCooldowns] = useState<Record<string, number>>({});
  // Ticks every second to force re-render of countdown labels.
  const [nowTick, setNowTick] = useState(() => Date.now());

  const [arrivalStates, setArrivalStates] = useState<Record<string, ArrivalState>>({});
  const [alertingIds, setAlertingIds] = useState<string[]>([]);

  const { onSolicitationAccepted, onSolicitationRejected } = useSocket();
  const observer = useRef<IntersectionObserver | null>(null);

  const COOLDOWN_MS = 5 * 60 * 1000;
  const SOLICITATION_COOLDOWN_KEY = 'solicitation-cooldowns';
  const ALERT_COOLDOWN_KEY = 'alert-cooldowns';

  const pruneExpired = (map: Record<string, number>): Record<string, number> => {
    const now = Date.now();
    const next: Record<string, number> = {};
    for (const [id, until] of Object.entries(map)) {
      if (until > now) next[id] = until;
    }
    return next;
  };

  // Load persisted cooldowns on mount.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(SOLICITATION_COOLDOWN_KEY);
      if (raw) setSolicitationCooldowns(pruneExpired(JSON.parse(raw)));
    } catch {
      /* ignore */
    }
    try {
      const raw = window.localStorage.getItem(ALERT_COOLDOWN_KEY);
      if (raw) setAlertCooldowns(pruneExpired(JSON.parse(raw)));
    } catch {
      /* ignore */
    }
  }, []);

  // Persist whenever cooldowns change.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      SOLICITATION_COOLDOWN_KEY,
      JSON.stringify(solicitationCooldowns)
    );
  }, [solicitationCooldowns]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ALERT_COOLDOWN_KEY, JSON.stringify(alertCooldowns));
  }, [alertCooldowns]);

  // 1-second ticker to drive the countdown labels and auto-clear expired entries.
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setNowTick(now);
      setSolicitationCooldowns((prev) => {
        const pruned = pruneExpired(prev);
        return Object.keys(pruned).length === Object.keys(prev).length ? prev : pruned;
      });
      setAlertCooldowns((prev) => {
        const pruned = pruneExpired(prev);
        return Object.keys(pruned).length === Object.keys(prev).length ? prev : pruned;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenCard = (cardInfo: ChildrenDataType) => {
    setOpenModalChildInfo(true);
    setChildInfo(cardInfo);
  };

  const formatRemaining = (until: number): string => {
    const diff = Math.max(0, until - nowTick);
    const totalSec = Math.ceil(diff / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleArrivalAlert = async (childId: string, minutes: 'MINUTES_30' | 'MINUTES_15') => {
    const until = alertCooldowns[childId];
    if (until && until > Date.now()) {
      toast.warn(`Aguarde ${formatRemaining(until)} para enviar outro aviso.`);
      return;
    }
    setAlertingIds((prev) => [...prev, childId]);
    try {
      const result = await sendArrivalAlert({ minutes, childId });
      if (result?.status >= 400) {
        toast.error('Erro ao enviar aviso.');
      } else {
        setArrivalStates((prev) => ({ ...prev, [childId]: minutes }));
        setAlertCooldowns((prev) => ({ ...prev, [childId]: Date.now() + COOLDOWN_MS }));
        const label = minutes === 'MINUTES_30' ? '30 minutos' : '15 minutos';
        toast.info(`Aviso enviado: chego em ${label}.`);
      }
    } catch {
      toast.error('Erro ao enviar aviso.');
    }
    setAlertingIds((prev) => prev.filter((id) => id !== childId));
  };

  const handleSolicitation = async (childId: string, type: 'DROP_OFF' | 'PICK_UP') => {
    const until = solicitationCooldowns[childId];
    if (until && until > Date.now()) {
      toast.warn(`Aguarde ${formatRemaining(until)} para enviar outra solicitação.`);
      return;
    }
    setSolicitingIds((prev) => [...prev, childId]);
    try {
      const result = await createSolicitation({ type, childId });
      if (result?.status && result.status >= 400) {
        toast.error('Erro ao enviar solicitação.');
      } else {
        toast.success('Solicitação enviada! Aguarde a resposta da escola.');
        setSolicitationCooldowns((prev) => ({ ...prev, [childId]: Date.now() + COOLDOWN_MS }));
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
            const solicitationCooldownUntil = solicitationCooldowns[child.id];
            const isOnSolicitationCooldown =
              !!solicitationCooldownUntil && solicitationCooldownUntil > nowTick;
            const alertCooldownUntil = alertCooldowns[child.id];
            const isOnAlertCooldown =
              !!alertCooldownUntil && alertCooldownUntil > nowTick;
            const isAlerting = alertingIds.includes(child.id);
            const arrivalState = arrivalStates[child.id] ?? 'none';
            const hasPreArrival = arrivalState !== 'none';
            const alertCountdown = isOnAlertCooldown
              ? formatRemaining(alertCooldownUntil)
              : null;
            const solicitationCountdown = isOnSolicitationCooldown
              ? formatRemaining(solicitationCooldownUntil)
              : null;

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

                {userInfo?.role === Role.RESPONSIBLE && (
                  <div className={style.arrivalButtons}>
                    {child.isPresent && (
                      <div className={style.alertRow}>
                        <button
                          className={`${style.alertButton} ${arrivalState === 'MINUTES_30' ? style.alertButtonActive : ''}`}
                          disabled={
                            isAlerting ||
                            isOnAlertCooldown ||
                            arrivalState === 'MINUTES_30'
                          }
                          onClick={() => handleArrivalAlert(child.id, 'MINUTES_30')}
                        >
                          {isOnAlertCooldown
                            ? `Aguarde ${alertCountdown}`
                            : 'Chego em 30 min'}
                        </button>
                        <button
                          className={`${style.alertButton} ${arrivalState === 'MINUTES_15' ? style.alertButtonActive : ''}`}
                          disabled={
                            isAlerting ||
                            isOnAlertCooldown ||
                            arrivalState === 'MINUTES_15'
                          }
                          onClick={() => handleArrivalAlert(child.id, 'MINUTES_15')}
                        >
                          {isOnAlertCooldown
                            ? `Aguarde ${alertCountdown}`
                            : 'Chego em 15 min'}
                        </button>
                      </div>
                    )}

                    {!child.isPresent ? (
                      <button
                        className={`${style.dropOffButton} ${hasPreArrival ? style.arrivedButton : ''}`}
                        disabled={isSoliciting || isOnSolicitationCooldown}
                        onClick={() => handleSolicitation(child.id, 'DROP_OFF')}
                      >
                        {isSoliciting
                          ? 'Enviando...'
                          : isOnSolicitationCooldown
                            ? `Aguarde ${solicitationCountdown}`
                            : hasPreArrival
                              ? 'Cheguei'
                              : 'Solicitar entrada'}
                      </button>
                    ) : (
                      <button
                        className={`${style.pickUpButton} ${hasPreArrival ? style.arrivedButton : ''}`}
                        disabled={isSoliciting || isOnSolicitationCooldown}
                        onClick={() => handleSolicitation(child.id, 'PICK_UP')}
                      >
                        {isSoliciting
                          ? 'Enviando...'
                          : isOnSolicitationCooldown
                            ? `Aguarde ${solicitationCountdown}`
                            : hasPreArrival
                              ? 'Cheguei'
                              : 'Buscar criança'}
                      </button>
                    )}
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
