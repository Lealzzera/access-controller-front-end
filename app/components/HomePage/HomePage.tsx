'use client';

import CardInfoComponent from '@/app/components/CardInfoComponent/CardInfoComponent';
import style from './style.module.css';
import { useUser } from '@/app/context/userContext';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getChildrenPaginated } from '@/app/actions/getChildrenPaginated';
import { CircularProgress } from '@mui/material';
import { Skeleton } from '@mui/material';
import ButtonComponent from '../ButtonComponent/ButtonComponent';
import ModalChildInfoComponent from '../ModalChildInfoComponent/ModalChildInfoComponent';
import { Role } from '@/app/enums/Role.enum';

type ChildrenDataType = {
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

export default function HomePage() {
  const { userInfo } = useUser();
  const [childrenData, setChildrenData] = useState<ChildrenDataType[]>([]);
  const [currentCursor, setCurrentCursor] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [openModalChildInfo, setOpenModalChildInfo] = useState(false);
  const [childInfo, setChildInfo] = useState<any>(undefined);

  const observer = useRef<IntersectionObserver | null>(null);

  const handleOpenCard = (cardInfo: ChildrenDataType) => {
    setOpenModalChildInfo(true);
    setChildInfo(cardInfo);
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

  useEffect(() => {
    if (userInfo) fetchChildren('', true);
  }, [userInfo, fetchChildren]);

  const lastCardRef = useCallback(
    (node: HTMLDivElement | null) => {
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
    <>
      <div className={style.filterContainer}>
        <ButtonComponent buttonText="Presentes" />
        <ButtonComponent buttonText="Ausentes" />
      </div>
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
        {childrenData.length === 0 && !loading && userInfo?.role === Role.INSTITUTION && (
          <div className={style.noChildrenData}>
            <h1 className={style.noChildrenDataTitle}>Não há crianças cadastradas.</h1>
          </div>
        )}
        {!childrenData.length && !loading && userInfo?.role === Role.RESPONSIBLE && (
          <div className={style.noChildrenData}>
            <h1 className={style.noChildrenDataTitle}>Não há crianças cadastradas.</h1>
          </div>
        )}
        {childrenData.length > 0 &&
          childrenData.map((child, index) => {
            const isLastCard = index === childrenData.length - 1;
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
