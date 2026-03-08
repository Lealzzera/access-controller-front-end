'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getToken } from '../actions/getToken';

export type SolicitationData = {
  id: string;
  type: 'DROP_OFF' | 'PICK_UP';
  status: string;
  child: {
    id: string;
    name: string;
    picture: string;
  };
  responsible: {
    id: string;
    name: string;
    picture: string;
  };
};

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const connectSocket = async () => {
      const token = await getToken();
      if (!token) return;

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3333';

      const socket = io(`${backendUrl}/solicitations`, {
        auth: { token },
      });

      socket.on('connect', () => {
        setConnected(true);
      });

      socket.on('disconnect', () => {
        setConnected(false);
      });

      socketRef.current = socket;
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const onNewSolicitation = (callback: (data: SolicitationData) => void) => {
    socketRef.current?.on('new-solicitation', callback);
    return () => {
      socketRef.current?.off('new-solicitation', callback);
    };
  };

  const onSolicitationAccepted = (callback: (data: SolicitationData) => void) => {
    socketRef.current?.on('solicitation-accepted', callback);
    return () => {
      socketRef.current?.off('solicitation-accepted', callback);
    };
  };

  const onSolicitationRejected = (callback: (data: SolicitationData) => void) => {
    socketRef.current?.on('solicitation-rejected', callback);
    return () => {
      socketRef.current?.off('solicitation-rejected', callback);
    };
  };

  return {
    connected,
    onNewSolicitation,
    onSolicitationAccepted,
    onSolicitationRejected,
  };
}
