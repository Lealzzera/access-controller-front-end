'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import style from './styles.module.css';
import { getChildrenPaginated } from '@/app/actions/getChildrenPaginated';
import { useUser } from '@/app/context/userContext';
import CardInfoComponent from '@/app/components/CardInfoComponent/CardInfoComponent';
import ModalChildInfoComponent from '@/app/components/ModalChildInfoComponent/ModalChildInfoComponent';
import Skeleton from '@mui/material/Skeleton';

type ChildData = {
  id: string;
  name: string;
  cpf: string;
  isPresent: boolean;
  period: {
    id: string;
    name: string;
  };
  grade: {
    id: string;
    name: string;
  };
  picture: string;
};

export default function Children() {
  const { userInfo } = useUser();
  const [children, setChildren] = useState<ChildData[]>([]);
  const [currentCursor, setCurrentCursor] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const handleOpenModal = (child: ChildData) => {
    setSelectedChild(child);
    setIsModalOpen(true);
  };

  const fetchChildren = useCallback(
    async (cursor: string, isInitial: boolean) => {
      if (!userInfo) return;
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      try {
        const result = await getChildrenPaginated({ institutionId: userInfo.id, cursor, take: 20 });

        if (!result || result.status || !result.children) {
          setHasMore(false);
          if (isInitial) setLoading(false);
          else setLoadingMore(false);
          return;
        }

        setChildren((prev) => (isInitial ? result.children : [...prev, ...result.children]));
        console.log(result);
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

  useEffect(() => {
    if (userInfo) fetchChildren('', true);
  }, [userInfo, fetchChildren]);

  const lastItemRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchChildren(currentCursor, false);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore, currentCursor, fetchChildren]
  );

  return (
    <div className={style.childrenContainer}>
      <div className={style.childrenTitleContainer}>
        <h1 className={style.childrenTitle}>Lista de crianças:</h1>
      </div>

      {loading && children.length === 0 && (
        <ul className={style.childrenList}>
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

      {!loading && children.length === 0 && (
        <div
          style={{
            height: '50vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p>Não há crianças cadastradas</p>
        </div>
      )}

      {!loading && children.length > 0 && (
        <ul className={style.childrenList}>
          {children.map((child, index) => (
            <li key={child.id} ref={index === children.length - 1 ? lastItemRef : null}>
              <CardInfoComponent
                name={child.name}
                period={child.period.name}
                grade={child.grade.name}
                pictureUrl={child.picture}
                isPresent={child.isPresent}
                onClickCard={() => handleOpenModal(child)}
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

      {selectedChild && (
        <ModalChildInfoComponent
          isModalChildInfoOpen={isModalOpen}
          setIsModalChildInfoOpen={setIsModalOpen}
          childInfo={selectedChild}
        />
      )}
    </div>
  );
}
