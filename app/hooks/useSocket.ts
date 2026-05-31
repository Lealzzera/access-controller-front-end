'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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

export type ArrivalAlertData = {
  minutes: 'MINUTES_30' | 'MINUTES_15';
  childId: string;
  responsibleId: string;
  child: {
    id: string;
    name: string;
    picture: string | null;
  };
};

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const connectSocket = async () => {
      const token = await getToken();
      if (!token) return;

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3333';

      const socket = io(`${backendUrl}/solicitations`, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        setConnected(true);
      });

      socket.on('disconnect', () => {
        setConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        setConnected(false);
      });

      socketRef.current = socket;
      setSocketInstance(socket);
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocketInstance(null);
      }
    };
  }, []);

  const onNewSolicitation = useCallback((callback: (data: SolicitationData) => void) => {
    socketInstance?.on('new-solicitation', callback);
    return () => {
      socketInstance?.off('new-solicitation', callback);
    };
  }, [socketInstance]);

  const onSolicitationAccepted = useCallback((callback: (data: SolicitationData) => void) => {
    socketInstance?.on('solicitation-accepted', callback);
    return () => {
      socketInstance?.off('solicitation-accepted', callback);
    };
  }, [socketInstance]);

  const onSolicitationRejected = useCallback((callback: (data: SolicitationData) => void) => {
    socketInstance?.on('solicitation-rejected', callback);
    return () => {
      socketInstance?.off('solicitation-rejected', callback);
    };
  }, [socketInstance]);

  const onArrivalAlert = useCallback((callback: (data: ArrivalAlertData) => void) => {
    socketInstance?.on('arrival-alert', callback);
    return () => {
      socketInstance?.off('arrival-alert', callback);
    };
  }, [socketInstance]);

  const onArrivalAlertRemoved = useCallback((callback: (data: { childId: string; responsibleId: string }) => void) => {
    socketInstance?.on('arrival-alert-removed', callback);
    return () => {
      socketInstance?.off('arrival-alert-removed', callback);
    };
  }, [socketInstance]);

  return {
    connected,
    onNewSolicitation,
    onSolicitationAccepted,
    onSolicitationRejected,
    onArrivalAlert,
    onArrivalAlertRemoved,
  };
}
