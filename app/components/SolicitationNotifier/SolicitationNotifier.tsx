'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useUser } from '@/app/context/userContext';
import { useSocket } from '@/app/hooks/useSocket';
import { Role } from '@/app/enums/Role.enum';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

// IDs das solicitações reais que estão com áudio tocando (aguardando aceite/rejeição)
// Guardamos no módulo para que o estado persista entre re-renders sem virar uma ref
const ringingSet = new Set<string>();
// Referência ao interval exposta no módulo para que código externo (RequestsPage) pare a campainha
let _ringInterval: NodeJS.Timeout | null = null;

// Função exportada para parar a campainha de uma solicitação específica a partir de qualquer componente
export function stopSolicitationRing(solicitationId: string) {
  ringingSet.delete(solicitationId);
  if (ringingSet.size === 0 && _ringInterval) {
    clearInterval(_ringInterval);
    _ringInterval = null;
  }
}

// Gera o som de campainha de escola usando Web Audio API
// Toque estilo "ding-dong" com harmônicos para soar mais como sino real
function createBellSound(ctx: AudioContext): void {
  const now = ctx.currentTime;

  // Compressor para evitar clipping no volume alto
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-6, now);
  compressor.knee.setValueAtTime(3, now);
  compressor.ratio.setValueAtTime(4, now);
  compressor.attack.setValueAtTime(0.001, now);
  compressor.release.setValueAtTime(0.25, now);
  compressor.connect(ctx.destination);

  // Função helper para criar uma parcial (frequência + envelope)
  function addPartial(freq: number, startTime: number, peakGain: number, decayDuration: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(compressor);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    // Ataque instantâneo, decaimento longo (característica de sino)
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + decayDuration);
    osc.start(startTime);
    osc.stop(startTime + decayDuration);
  }

  // ── DING (primeiro golpe — nota Dó5 ≈ 523 Hz) ─────────────────────────
  // Fundamental + harmônicos ímpares simulam timbre de sino de escola
  addPartial(523, now, 1.0, 1.8); // fundamental
  addPartial(1047, now, 0.6, 1.2); // 2ª harmônica
  addPartial(1569, now, 0.35, 0.8); // 3ª harmônica
  addPartial(2093, now, 0.2, 0.5); // 4ª harmônica
  // Leve batimento de inarmônico (dá o "ding" metálico)
  addPartial(587, now, 0.3, 1.4);

  // ── DONG (segundo golpe — nota Sol4 ≈ 392 Hz, após 0.55s) ─────────────
  addPartial(392, now + 0.55, 1.0, 1.8);
  addPartial(784, now + 0.55, 0.6, 1.2);
  addPartial(1175, now + 0.55, 0.35, 0.8);
  addPartial(1568, now + 0.55, 0.2, 0.5);
  addPartial(440, now + 0.55, 0.3, 1.4);
}

export default function SolicitationNotifier() {
  const { userInfo } = useUser();
  const { onNewSolicitation, onArrivalAlert, onSolicitationAccepted, onSolicitationRejected } =
    useSocket();
  const router = useRouter();

  // AudioContext é lazy-criado na primeira interação do usuário
  const audioCtxRef = useRef<AudioContext | null>(null);
  // Intervalo da campainha persistente (para solicitações reais)
  const ringIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  // Toca o som uma vez (aviso de chegada)
  const playBellOnce = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      createBellSound(ctx);
    } catch {
      // silencioso se não suportado
    }
  }, [getAudioCtx]);

  // Inicia a campainha persistente (toca a cada 3s até parar)
  const startRinging = useCallback(
    (solicitationId: string) => {
      ringingSet.add(solicitationId);
      if (ringIntervalRef.current) return; // já está tocando

      playBellOnce();
      const interval = setInterval(() => {
        if (ringingSet.size === 0) {
          clearInterval(interval);
          ringIntervalRef.current = null;
          _ringInterval = null;
          return;
        }
        playBellOnce();
      }, 3000);
      ringIntervalRef.current = interval;
      _ringInterval = interval; // sincroniza com a referência do módulo
    },
    [playBellOnce]
  );

  // Para a campainha de uma solicitação específica
  const stopRinging = useCallback((solicitationId: string) => {
    ringingSet.delete(solicitationId);
    if (ringingSet.size === 0 && ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
      _ringInterval = null;
    }
  }, []);

  // Limpa ao desmontar
  useEffect(() => {
    return () => {
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
      ringingSet.clear();
    };
  }, []);

  useEffect(() => {
    if (!userInfo || userInfo.role !== Role.INSTITUTION) return;

    // ── Solicitação real → campainha persistente ──────────────────────────
    const unsubNew = onNewSolicitation((data) => {
      const typeLabel = data.type === 'DROP_OFF' ? 'deixar' : 'buscar';
      const message = `${data.responsible?.name} quer ${typeLabel} ${data.child?.name}`;

      startRinging(data.id);

      toast.info(message, {
        autoClose: false,
        closeOnClick: false,
        toastId: `solicitation-${data.id}`,
        onClick: () => router.push('/requests'),
        style: { cursor: 'pointer' },
      });
    });

    // ── Aviso de chegada → campainha uma vez ─────────────────────────────
    const unsubAlert = onArrivalAlert((data) => {
      const minutes = data.minutes === 'MINUTES_30' ? '30' : '15';
      const message = `${data.child?.name}: responsável chega em ${minutes} minutos`;

      playBellOnce();

      toast.warning(message, {
        autoClose: 10000,
        onClick: () => router.push('/requests'),
        style: { cursor: 'pointer' },
      });
    });

    // ── Aceite/Rejeição recebido pela ESCOLA via novo-solicitation resolvido ─
    // A escola não recebe solicitation-accepted/rejected no seu room —
    // ela para a campainha imediatamente ao clicar Aceitar/Rejeitar (ação local).
    // Mas registramos os handlers aqui para o caso de reconexão ou multi-aba.
    const unsubAccepted = onSolicitationAccepted((data) => {
      stopRinging(data.id);
      toast.dismiss(`solicitation-${data.id}`);
    });

    const unsubRejected = onSolicitationRejected((data) => {
      stopRinging(data.id);
      toast.dismiss(`solicitation-${data.id}`);
    });

    return () => {
      unsubNew();
      unsubAlert();
      unsubAccepted();
      unsubRejected();
    };
  }, [
    userInfo,
    onNewSolicitation,
    onArrivalAlert,
    onSolicitationAccepted,
    onSolicitationRejected,
    router,
    startRinging,
    stopRinging,
    playBellOnce,
  ]);

  return null;
}
