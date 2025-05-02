"use client";

import CardInfoComponent from "@/app/components/CardInfoComponent/CardInfoComponent";
import style from "./style.module.css";
import { useUser } from "@/app/context/userContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { getChildrenList } from "@/app/actions/getChildrenList";
import { CircularProgress } from "@mui/material";
import { Skeleton } from "@mui/material";
import ButtonComponent from "../ButtonComponent/ButtonComponent";

type ChildrenDataType = {
  id: string;
  name: string;
  period: { id: string; name: string };
  grade: { id: string; name: string };
  picture: string;
};

export default function HomePage() {
  const { userInfo, registerModalOpen, setRegisterModalOpen } = useUser();
  const [childrenData, setChildrenData] = useState<ChildrenDataType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState<boolean | undefined>(undefined);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastCardRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setCurrentPage((prev) => prev + 1);
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
        userInfo: { id: userInfo.id, role: userInfo.role },
        page,
      });

      if (!response || response.length === 0) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      setChildrenData((prev) => [...prev, ...response]);
      setLoading(false);
    },
    [userInfo]
  );

  useEffect(() => {
    if (!registerModalOpen) {
      setChildrenData([]);
      setCurrentPage(1);
      setHasMore(true);
    }
  }, [registerModalOpen]);

  useEffect(() => {
    if (userInfo && hasMore && !loading && !registerModalOpen) {
      getChildrenListByUserId(currentPage);
    }
  }, [userInfo, currentPage, hasMore, registerModalOpen]);

  return (
    <>
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
        {childrenData.length === 0 && !loading && loading !== undefined &&  <div className={style.noChildrenData}>
          <h1 className={style.noChildrenDataTitle}>Não há crianças cadastradas.</h1>
          <div className={style.registerChildButton}>
            <ButtonComponent style={{cursor: 'pointer'}} onClick={() => setRegisterModalOpen(true)} buttonText="Cadastrar"/>
          </div>
          </div>}
        {childrenData.map((child, index) => {
          const isLastCard = index === childrenData.length - 1;
          return (
            <div
              key={child.id}
              className={style.containerCard}
              ref={isLastCard ? lastCardRef : null}
            >
              <CardInfoComponent
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
