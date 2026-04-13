'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import style from './style.module.css';
import { useUser } from '@/app/context/userContext';
import { Role } from '@/app/enums/Role.enum';
import { getPendingSolicitations } from '@/app/actions/getPendingSolicitations';
import { acceptSolicitation } from '@/app/actions/acceptSolicitation';
import { rejectSolicitation } from '@/app/actions/rejectSolicitation';
import { useSocket, SolicitationData, ArrivalAlertData } from '@/app/hooks/useSocket';
import { stopSolicitationRing } from '@/app/components/SolicitationNotifier/SolicitationNotifier';
import { Skeleton } from '@mui/material';
import imageError from '@/app/assets/error-image.png';
import { useRouter } from 'next/navigation';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// ── Tipos ────────────────────────────────────────────────────────────────────

type SolicitationCard = {
  kind: 'solicitation';
  id: string;
  arrivedAt: number;
  data: SolicitationData;
};

type AlertCard = {
  kind: 'alert';
  id: string;
  arrivedAt: number;
  data: ArrivalAlertData;
};

type Card = SolicitationCard | AlertCard;

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ── Componente ───────────────────────────────────────────────────────────────

export default function RequestsPage() {
  const { userInfo } = useUser();
  const router = useRouter();

  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  const { onNewSolicitation, onArrivalAlert, onSolicitationAccepted, onSolicitationRejected } =
    useSocket();

  const alertTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    if (userInfo && userInfo.role !== Role.INSTITUTION) {
      router.push('/home');
    }
  }, [userInfo, router]);

  const fetchSolicitations = useCallback(async () => {
    if (!userInfo || userInfo.role !== Role.INSTITUTION) return;
    setLoading(true);
    try {
      const data = await getPendingSolicitations(userInfo.id);
      if (Array.isArray(data)) {
        const solicCards: SolicitationCard[] = data.map(
          (s: SolicitationData & { createdAt?: string }) => ({
            kind: 'solicitation',
            id: s.id,
            arrivedAt: s.createdAt ? new Date(s.createdAt).getTime() : Date.now(),
            data: s,
          })
        );
        setCards(solicCards.sort((a, b) => a.arrivedAt - b.arrivedAt));
      }
    } catch {
      setCards([]);
    }
    setLoading(false);
  }, [userInfo]);

  useEffect(() => {
    if (userInfo) fetchSolicitations();
  }, [userInfo, fetchSolicitations]);

  useEffect(() => {
    return () => {
      alertTimers.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  // ── WebSocket ────────────────────────────────────────────────────────────

  useEffect(() => {
    const unsubNew = onNewSolicitation((newSolicitation) => {
      setCards((prev) => {
        const exists = prev.some((c) => c.id === newSolicitation.id);
        if (exists) return prev;
        const card: SolicitationCard = {
          kind: 'solicitation',
          id: newSolicitation.id,
          arrivedAt: Date.now(),
          data: newSolicitation,
        };
        return [...prev, card].sort((a, b) => a.arrivedAt - b.arrivedAt);
      });
    });

    const unsubAlert = onArrivalAlert((alertData) => {
      const alertId = `alert-${alertData.childId}-${Date.now()}`;
      const card: AlertCard = {
        kind: 'alert',
        id: alertId,
        arrivedAt: Date.now(),
        data: alertData,
      };
      setCards((prev) => [...prev, card].sort((a, b) => a.arrivedAt - b.arrivedAt));

      // Auto-remove após 35 minutos
      const timer = setTimeout(
        () => {
          setCards((prev) => prev.filter((c) => c.id !== alertId));
          alertTimers.current.delete(alertId);
        },
        35 * 60 * 1000
      );
      alertTimers.current.set(alertId, timer);
    });

    const unsubAccepted = onSolicitationAccepted((data) => {
      setCards((prev) => prev.filter((c) => c.id !== data.id));
    });

    const unsubRejected = onSolicitationRejected((data) => {
      setCards((prev) => prev.filter((c) => c.id !== data.id));
    });

    return () => {
      unsubNew();
      unsubAlert();
      unsubAccepted();
      unsubRejected();
    };
  }, [onNewSolicitation, onArrivalAlert, onSolicitationAccepted, onSolicitationRejected]);

  // ── Ações ────────────────────────────────────────────────────────────────

  const handleAccept = async (solicitationId: string) => {
    setProcessingIds((prev) => [...prev, solicitationId]);
    // Para a campainha imediatamente — não espera resposta do servidor
    stopSolicitationRing(solicitationId);
    try {
      await acceptSolicitation(solicitationId);
      setCards((prev) => prev.filter((c) => c.id !== solicitationId));
    } catch {
      /* silencioso */
    }
    setProcessingIds((prev) => prev.filter((id) => id !== solicitationId));
  };

  const handleReject = async (solicitationId: string) => {
    setProcessingIds((prev) => [...prev, solicitationId]);
    // Para a campainha imediatamente — não espera resposta do servidor
    stopSolicitationRing(solicitationId);
    try {
      await rejectSolicitation(solicitationId);
      setCards((prev) => prev.filter((c) => c.id !== solicitationId));
    } catch {
      /* silencioso */
    }
    setProcessingIds((prev) => prev.filter((id) => id !== solicitationId));
  };

  const dismissAlert = (alertId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== alertId));
    const timer = alertTimers.current.get(alertId);
    if (timer) {
      clearTimeout(timer);
      alertTimers.current.delete(alertId);
    }
  };

  if (userInfo && userInfo.role !== Role.INSTITUTION) return null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {loading && cards.length === 0 && (
        <div className={style.container}>
          <Skeleton variant="rounded" className={style.skeletonComponent} />
          <Skeleton variant="rounded" className={style.skeletonComponent} />
          <Skeleton variant="rounded" className={style.skeletonComponent} />
        </div>
      )}
      <section className={style.container}>
        {cards.length === 0 && !loading && (
          <div className={style.noRequests}>
            <h1 className={style.noRequestsTitle}>Não há solicitações pendentes.</h1>
          </div>
        )}

        {cards.map((card) => {
          // ── Aviso de chegada ─────────────────────────────────────────────
          if (card.kind === 'alert') {
            const minutes = card.data.minutes === 'MINUTES_30' ? '30' : '15';
            return (
              <div key={card.id} className={`${style.solicitationCard} ${style.alertCard}`}>
                <div className={style.alertBadge}>
                  <NotificationsActiveIcon fontSize="small" />
                  Aviso de chegada
                </div>
                <div className={style.solicitationHeader}>
                  <div className={style.solicitationPictures}>
                    <div className={style.solicitationPicture}>
                      <img
                        src={card.data.child?.picture || imageError.src}
                        alt={card.data.child?.name}
                        className={style.solicitationPictureImg}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = imageError.src;
                        }}
                      />
                    </div>
                  </div>
                  <div className={style.solicitationInfo}>
                    <p className={style.solicitationName}>{card.data.child?.name}</p>
                    <p className={style.solicitationDetail}>
                      <AccessTimeIcon
                        style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 3 }}
                      />
                      Responsável chega em <strong>{minutes} minutos</strong>
                    </p>
                    <p className={style.solicitationTime}>{formatTime(card.arrivedAt)}</p>
                  </div>
                </div>
                <button className={style.dismissButton} onClick={() => dismissAlert(card.id)}>
                  Ciente
                </button>
              </div>
            );
          }

          // ── Solicitação real ─────────────────────────────────────────────
          const solicitation = card.data;
          const isProcessing = processingIds.includes(solicitation.id);

          return (
            <div key={card.id} className={`${style.solicitationCard} ${style.realCard}`}>
              <div className={style.solicitationHeader}>
                <div className={style.solicitationPictures}>
                  <div className={style.solicitationPicture}>
                    <img
                      src={solicitation.responsible?.picture || imageError.src}
                      alt={solicitation.responsible?.name || 'Responsável'}
                      className={style.solicitationPictureImg}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = imageError.src;
                      }}
                    />
                  </div>
                  <div className={style.solicitationPicture}>
                    <img
                      src={solicitation.child?.picture || imageError.src}
                      alt={solicitation.child?.name || 'Criança'}
                      className={style.solicitationPictureImg}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = imageError.src;
                      }}
                    />
                  </div>
                </div>
                <div className={style.solicitationInfo}>
                  <p className={style.solicitationName}>{solicitation.responsible?.name}</p>
                  <p className={style.solicitationDetail}>
                    <span>Criança: </span>
                    {solicitation.child?.name}
                  </p>
                  <p className={style.solicitationDetail}>
                    <span
                      className={`${style.typeBadge} ${solicitation.type === 'DROP_OFF' ? style.dropOff : style.pickUp}`}
                    >
                      {solicitation.type === 'DROP_OFF' ? 'Deixar criança' : 'Buscar criança'}
                    </span>
                  </p>
                  <p className={style.solicitationTime}>{formatTime(card.arrivedAt)}</p>
                </div>
              </div>
              <div className={style.solicitationActions}>
                <button
                  className={style.acceptButton}
                  disabled={isProcessing}
                  onClick={() => handleAccept(solicitation.id)}
                >
                  {solicitation.type === 'DROP_OFF' ? 'Receber' : 'Entregar'}
                </button>
                <button
                  className={style.rejectButton}
                  disabled={isProcessing}
                  onClick={() => handleReject(solicitation.id)}
                >
                  Rejeitar
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}
