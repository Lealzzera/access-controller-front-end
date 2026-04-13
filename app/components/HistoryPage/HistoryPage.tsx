'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useUser } from '@/app/context/userContext';
import { getHistoryByInstitutionId } from '@/app/actions/getHistoryByInstitutionId';
import { Skeleton, CircularProgress } from '@mui/material';
import imageError from '@/app/assets/error-image.png';
import style from './style.module.css';

type HistoryEntry = {
  id: string;
  type: 'DROP_OFF' | 'PICK_UP';
  createdAt: string;
  child: { id: string; name: string; picture: string | null };
  responsible: { id: string; name: string; picture: string | null };
};

const TYPE_LABEL: Record<HistoryEntry['type'], string> = {
  DROP_OFF: 'Entrada',
  PICK_UP: 'Saída',
};

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistoryPage() {
  const { userInfo } = useUser();

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState(todayISO());
  const [dateTo, setDateTo] = useState(todayISO());
  const [search, setSearch] = useState('');
  const [fetched, setFetched] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!userInfo) return;
    setLoading(true);
    try {
      const data = await getHistoryByInstitutionId({
        institutionId: userInfo.id,
        dateFrom,
        dateTo,
      });
      if (Array.isArray(data?.history)) {
        setHistory(data.history);
      } else {
        setHistory([]);
      }
    } catch {
      setHistory([]);
    }
    setFetched(true);
    setLoading(false);
  }, [userInfo, dateFrom, dateTo]);

  // busca automática ao montar (hoje por padrão)
  useEffect(() => {
    if (userInfo && !fetched) fetchHistory();
  }, [userInfo, fetched, fetchHistory]);

  const handleApplyFilter = () => {
    setFetched(false);
    fetchHistory();
  };

  const filtered = history.filter((entry) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      entry.child.name.toLowerCase().includes(q) || entry.responsible.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className={style.container}>
      <h1 className={style.title}>Histórico de Movimentações</h1>

      {/* ── FILTROS ── */}
      <div className={style.filtersCard}>
        <div className={style.dateRow}>
          <div className={style.fieldGroup}>
            <label className={style.label} htmlFor="dateFrom">
              De
            </label>
            <input
              id="dateFrom"
              type="date"
              className={style.dateInput}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className={style.fieldGroup}>
            <label className={style.label} htmlFor="dateTo">
              Até
            </label>
            <input
              id="dateTo"
              type="date"
              className={style.dateInput}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <button className={style.applyButton} onClick={handleApplyFilter} disabled={loading}>
            {loading ? <CircularProgress size={16} style={{ color: '#fff' }} /> : 'Buscar'}
          </button>
        </div>

        <div className={style.searchRow}>
          <input
            className={style.searchInput}
            type="text"
            placeholder="Buscar por criança ou responsável..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── SUMÁRIO ── */}
      {!loading && fetched && (
        <div className={style.summary}>
          <span className={style.summaryItem}>
            <span className={`${style.typeBadge} ${style.dropOff}`}>Entrada</span>
            {filtered.filter((e) => e.type === 'DROP_OFF').length}
          </span>
          <span className={style.summaryItem}>
            <span className={`${style.typeBadge} ${style.pickUp}`}>Saída</span>
            {filtered.filter((e) => e.type === 'PICK_UP').length}
          </span>
          <span className={style.summaryTotal}>{filtered.length} registro(s)</span>
        </div>
      )}

      {/* ── LOADING SKELETON ── */}
      {loading && (
        <div className={style.list}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={80} />
          ))}
        </div>
      )}

      {/* ── LISTA ── */}
      {!loading && fetched && filtered.length === 0 && (
        <p className={style.emptyMessage}>Nenhum registro encontrado para o período selecionado.</p>
      )}

      {!loading && filtered.length > 0 && (
        <ul className={style.list}>
          {filtered.map((entry) => (
            <li key={entry.id} className={style.card}>
              {/* tipo */}
              <span
                className={`${style.typeBadge} ${entry.type === 'DROP_OFF' ? style.dropOff : style.pickUp}`}
              >
                {TYPE_LABEL[entry.type]}
              </span>

              {/* criança */}
              <div className={style.person}>
                <div className={style.avatar}>
                  <Image
                    src={entry.child.picture || imageError}
                    width={44}
                    height={44}
                    alt={entry.child.name}
                    className={style.avatarImg}
                  />
                </div>
                <div className={style.personInfo}>
                  <p className={style.personLabel}>Criança</p>
                  <p className={style.personName}>{entry.child.name}</p>
                </div>
              </div>

              {/* divider */}
              <div className={style.divider} />

              {/* responsável */}
              <div className={style.person}>
                <div className={style.avatar}>
                  <Image
                    src={entry.responsible.picture || imageError}
                    width={44}
                    height={44}
                    alt={entry.responsible.name}
                    className={style.avatarImg}
                  />
                </div>
                <div className={style.personInfo}>
                  <p className={style.personLabel}>Responsável</p>
                  <p className={style.personName}>{entry.responsible.name}</p>
                </div>
              </div>

              {/* data/hora */}
              <time className={style.time}>{formatDateTime(entry.createdAt)}</time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
