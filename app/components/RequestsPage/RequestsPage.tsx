'use client';

import { useCallback, useEffect, useState } from 'react';
import style from './style.module.css';
import { useUser } from '@/app/context/userContext';
import { Role } from '@/app/enums/Role.enum';
import { getPendingSolicitations } from '@/app/actions/getPendingSolicitations';
import { acceptSolicitation } from '@/app/actions/acceptSolicitation';
import { rejectSolicitation } from '@/app/actions/rejectSolicitation';
import { useSocket, SolicitationData } from '@/app/hooks/useSocket';
import { Skeleton } from '@mui/material';
import imageError from '@/app/assets/error-image.png';
import { useRouter } from 'next/navigation';

export default function RequestsPage() {
  const { userInfo } = useUser();
  const router = useRouter();
  const [solicitations, setSolicitations] = useState<SolicitationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const { onNewSolicitation } = useSocket();

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
        setSolicitations(data);
      }
    } catch {
      setSolicitations([]);
    }
    setLoading(false);
  }, [userInfo]);

  useEffect(() => {
    if (userInfo) fetchSolicitations();
  }, [userInfo, fetchSolicitations]);

  useEffect(() => {
    const unsubscribe = onNewSolicitation((newSolicitation) => {
      setSolicitations((prev) => {
        const exists = prev.some((s) => s.id === newSolicitation.id);
        if (exists) return prev;
        return [newSolicitation, ...prev];
      });
    });

    return unsubscribe;
  }, [onNewSolicitation]);

  const handleAccept = async (solicitationId: string) => {
    setProcessingIds((prev) => [...prev, solicitationId]);
    try {
      await acceptSolicitation(solicitationId);
      setSolicitations((prev) => prev.filter((s) => s.id !== solicitationId));
    } catch {
      // erro silencioso
    }
    setProcessingIds((prev) => prev.filter((id) => id !== solicitationId));
  };

  const handleReject = async (solicitationId: string) => {
    setProcessingIds((prev) => [...prev, solicitationId]);
    try {
      await rejectSolicitation(solicitationId);
      setSolicitations((prev) => prev.filter((s) => s.id !== solicitationId));
    } catch {
      // erro silencioso
    }
    setProcessingIds((prev) => prev.filter((id) => id !== solicitationId));
  };

  const getTypeLabel = (type: string) => {
    return type === 'DROP_OFF' ? 'Deixar criança' : 'Buscar criança';
  };

  if (userInfo && userInfo.role !== Role.INSTITUTION) return null;

  return (
    <>
      {loading && solicitations.length === 0 && (
        <div className={style.container}>
          <Skeleton variant="rounded" className={style.skeletonComponent} />
          <Skeleton variant="rounded" className={style.skeletonComponent} />
          <Skeleton variant="rounded" className={style.skeletonComponent} />
        </div>
      )}
      <section className={style.container}>
        {solicitations.length === 0 && !loading && (
          <div className={style.noRequests}>
            <h1 className={style.noRequestsTitle}>Não há solicitações pendentes.</h1>
          </div>
        )}
        {solicitations.length > 0 &&
          solicitations.map((solicitation) => {
            const isProcessing = processingIds.includes(solicitation.id);
            return (
              <div key={solicitation.id} className={style.solicitationCard}>
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
                        {getTypeLabel(solicitation.type)}
                      </span>
                    </p>
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
