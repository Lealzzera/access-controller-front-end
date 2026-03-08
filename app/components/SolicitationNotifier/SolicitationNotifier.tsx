'use client';

import { useEffect } from 'react';
import { useUser } from '@/app/context/userContext';
import { useSocket } from '@/app/hooks/useSocket';
import { Role } from '@/app/enums/Role.enum';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function SolicitationNotifier() {
  const { userInfo } = useUser();
  const { onNewSolicitation } = useSocket();
  const router = useRouter();

  useEffect(() => {
    if (!userInfo || userInfo.role !== Role.INSTITUTION) return;

    const unsubscribe = onNewSolicitation((data) => {
      const typeLabel = data.type === 'DROP_OFF' ? 'deixar' : 'buscar';
      const message = `${data.responsible?.name} quer ${typeLabel} ${data.child?.name}`;

      toast.info(message, {
        autoClose: 8000,
        onClick: () => {
          router.push('/requests');
        },
        style: { cursor: 'pointer' },
      });
    });

    return unsubscribe;
  }, [userInfo, onNewSolicitation, router]);

  return null;
}
