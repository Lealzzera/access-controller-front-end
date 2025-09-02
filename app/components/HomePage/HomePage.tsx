'use client';

import CardInfoComponent from '@/app/components/CardInfoComponent/CardInfoComponent';
import style from './style.module.css';
import { useUser } from '@/app/context/userContext';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getChildrenList } from '@/app/actions/getChildrenList';
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
  const { userInfo, registerModalOpen, setRegisterModalOpen, registerResponsibleModalOpen } =
    useUser();
  const [childrenData, setChildrenData] = useState<ChildrenDataType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState<boolean | undefined>(undefined);
  const [openModalChildInfo, setOpenModalChildInfo] = useState(false);
  const [childInfo, setChildInfo] = useState<any>(undefined);

  const observer = useRef<IntersectionObserver | null>(null);

  const handleOpenCard = (cardInfo: ChildrenDataType) => {
    setOpenModalChildInfo(true);
    setChildInfo(cardInfo);
  };

  const lastCardRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setCurrentPage(currentPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );
  const getChildrenListByUserId = useCallback(
    async (page: number) => {
      if (!userInfo) return;
      setLoading(true);
      const response = await getChildrenList({
        userInfo: {
          id: userInfo.id,
          role: userInfo.role,
        },
        page,
      });

      if (!response || response.length === 0) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      setChildrenData((prev) => {
        const existingIds = new Set(prev.map((child) => child.id));
        const newItems = response.filter((child: ChildrenDataType) => !existingIds.has(child.id));

        return [...prev, ...newItems];
      });

      if (response.length < 10) {
        setHasMore(false);
      }
      setLoading(false);
    },
    [userInfo]
  );

  useEffect(() => {
    if (userInfo && hasMore && !loading && !registerModalOpen) {
      getChildrenListByUserId(currentPage);
    }
  }, [userInfo, currentPage, hasMore, registerModalOpen]);

  useEffect(() => {
    if (!registerModalOpen) getChildrenListByUserId(currentPage);
  }, [registerModalOpen]);

  useEffect(() => {
    if (!registerResponsibleModalOpen) {
      setChildInfo(undefined);
    }
  }, [registerResponsibleModalOpen]);

  return (
    <>
      <ModalChildInfoComponent
        isModalChildInfoOpen={openModalChildInfo}
        setIsModalChildInfoOpen={setOpenModalChildInfo}
        childInfo={childInfo}
      />
      {childrenData.length === 0 && loading && (
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
        {childrenData.length === 0 &&
          !loading &&
          loading !== undefined &&
          userInfo?.role === Role.INSTITUTION && (
            <div className={style.noChildrenData}>
              <h1 className={style.noChildrenDataTitle}>Não há crianças cadastradas.</h1>
              <div className={style.registerChildButton}>
                <ButtonComponent
                  style={{
                    cursor: 'pointer',
                  }}
                  onClick={() => setRegisterModalOpen(true)}
                  buttonText="Cadastrar"
                />
              </div>
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
        {loading && childrenData.length > 0 && (
          <div className={style.circularProgressContainer}>
            <CircularProgress className={style.circularProgress} />
          </div>
        )}
      </section>
    </>
  );
}
