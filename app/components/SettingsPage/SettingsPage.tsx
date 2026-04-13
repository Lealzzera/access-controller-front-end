'use client';

import { useCallback, useEffect, useState } from 'react';
import style from './style.module.css';
import { useUser } from '@/app/context/userContext';
import { getGradesByInstituionId } from '@/app/actions/getGradesByInstitutionId';
import { getPeriodsByInstituionId } from '@/app/actions/getPeriodsByInstitutionId';
import { createGrade } from '@/app/actions/createGrade';
import { createPeriod } from '@/app/actions/createPeriod';
import { deleteGrade } from '@/app/actions/deleteGrade';
import { deletePeriod } from '@/app/actions/deletePeriod';
import { renameGrade } from '@/app/actions/renameGrade';
import { renamePeriod } from '@/app/actions/renamePeriod';
import { CircularProgress, Snackbar, Alert } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

type GradeType = { id: string; name: string };
type PeriodType = { id: string; name: string };

export default function SettingsPage() {
  const { userInfo } = useUser();

  const [periods, setPeriods] = useState<PeriodType[]>([]);
  const [grades, setGrades] = useState<GradeType[]>([]);
  const [newPeriod, setNewPeriod] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingGrade, setSavingGrade] = useState(false);
  const [savingPeriod, setSavingPeriod] = useState(false);

  // inline edit state
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [editingGradeName, setEditingGradeName] = useState('');
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [editingPeriodName, setEditingPeriodName] = useState('');

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const showSnack = (message: string, severity: 'success' | 'error') =>
    setSnackbar({ open: true, message, severity });

  const fetchConfig = useCallback(async () => {
    if (!userInfo) return;
    setLoading(true);
    try {
      const [gradesResult, periodsResult] = await Promise.all([
        getGradesByInstituionId(userInfo.id),
        getPeriodsByInstituionId(userInfo.id),
      ]);
      if (Array.isArray(gradesResult)) setGrades(gradesResult);
      if (Array.isArray(periodsResult)) setPeriods(periodsResult);
    } catch {
      showSnack('Erro ao carregar configurações.', 'error');
    }
    setLoading(false);
  }, [userInfo]);

  useEffect(() => {
    if (userInfo) fetchConfig();
  }, [userInfo, fetchConfig]);

  // ── CREATE ──────────────────────────────────────────────

  const handleAddGrade = async () => {
    const trimmed = newGrade.trim();
    if (!trimmed || !userInfo) return;
    if (grades.some((g) => g.name.toLowerCase() === trimmed.toLowerCase())) {
      showSnack('Turma já cadastrada.', 'error');
      return;
    }
    setSavingGrade(true);
    try {
      const result = await createGrade({ name: trimmed, institutionId: userInfo.id });
      if (result?.statusCode >= 400 || result?.status >= 400) {
        showSnack(result.message || 'Erro ao cadastrar turma.', 'error');
      } else {
        setGrades((prev) => [...prev, result.grade ?? { id: result.id, name: trimmed }]);
        setNewGrade('');
        showSnack('Turma cadastrada com sucesso!', 'success');
      }
    } catch {
      showSnack('Erro ao cadastrar turma.', 'error');
    }
    setSavingGrade(false);
  };

  const handleAddPeriod = async () => {
    const trimmed = newPeriod.trim();
    if (!trimmed || !userInfo) return;
    if (periods.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      showSnack('Período já cadastrado.', 'error');
      return;
    }
    setSavingPeriod(true);
    try {
      const result = await createPeriod({ name: trimmed, institutionId: userInfo.id });
      if (result?.statusCode >= 400 || result?.status >= 400) {
        showSnack(result.message || 'Erro ao cadastrar período.', 'error');
      } else {
        setPeriods((prev) => [...prev, result.period ?? { id: result.id, name: trimmed }]);
        setNewPeriod('');
        showSnack('Período cadastrado com sucesso!', 'success');
      }
    } catch {
      showSnack('Erro ao cadastrar período.', 'error');
    }
    setSavingPeriod(false);
  };

  // ── DELETE ──────────────────────────────────────────────

  const handleDeleteGrade = async (id: string) => {
    try {
      const result = await deleteGrade(id);
      if (result?.statusCode >= 400 || result?.status >= 400) {
        showSnack(result.message || 'Erro ao remover turma.', 'error');
      } else {
        setGrades((prev) => prev.filter((g) => g.id !== id));
        showSnack('Turma removida.', 'success');
      }
    } catch {
      showSnack('Erro ao remover turma.', 'error');
    }
  };

  const handleDeletePeriod = async (id: string) => {
    try {
      const result = await deletePeriod(id);
      if (result?.statusCode >= 400 || result?.status >= 400) {
        showSnack(result.message || 'Erro ao remover período.', 'error');
      } else {
        setPeriods((prev) => prev.filter((p) => p.id !== id));
        showSnack('Período removido.', 'success');
      }
    } catch {
      showSnack('Erro ao remover período.', 'error');
    }
  };

  // ── RENAME ──────────────────────────────────────────────

  const handleConfirmRenameGrade = async (id: string) => {
    const trimmed = editingGradeName.trim();
    if (!trimmed) {
      setEditingGradeId(null);
      return;
    }
    try {
      const result = await renameGrade(id, trimmed);
      if (result?.statusCode >= 400 || result?.status >= 400) {
        showSnack(result.message || 'Erro ao renomear turma.', 'error');
      } else {
        setGrades((prev) => prev.map((g) => (g.id === id ? { ...g, name: trimmed } : g)));
        showSnack('Turma renomeada.', 'success');
      }
    } catch {
      showSnack('Erro ao renomear turma.', 'error');
    }
    setEditingGradeId(null);
  };

  const handleConfirmRenamePeriod = async (id: string) => {
    const trimmed = editingPeriodName.trim();
    if (!trimmed) {
      setEditingPeriodId(null);
      return;
    }
    try {
      const result = await renamePeriod(id, trimmed);
      if (result?.statusCode >= 400 || result?.status >= 400) {
        showSnack(result.message || 'Erro ao renomear período.', 'error');
      } else {
        setPeriods((prev) => prev.map((p) => (p.id === id ? { ...p, name: trimmed } : p)));
        showSnack('Período renomeado.', 'success');
      }
    } catch {
      showSnack('Erro ao renomear período.', 'error');
    }
    setEditingPeriodId(null);
  };

  // ── KEY HANDLERS ─────────────────────────────────────────

  const handleGradeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddGrade();
    }
  };

  const handlePeriodKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPeriod();
    }
  };

  if (loading) {
    return (
      <div className={style.loadingContainer}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={style.settingsContainer}>
      <h1 className={style.settingsTitle}>Configurações da Escola</h1>

      {/* ── TURMAS ── */}
      <div className={style.section}>
        <h2 className={style.sectionTitle}>Turmas</h2>
        <div className={style.addItemRow}>
          <input
            className={style.addItemInput}
            type="text"
            placeholder="Ex: Maternal I"
            value={newGrade}
            onChange={(e) => setNewGrade(e.target.value)}
            onKeyDown={handleGradeKeyDown}
            disabled={savingGrade}
          />
          <button className={style.addButton} onClick={handleAddGrade} disabled={savingGrade}>
            {savingGrade ? '...' : '+'}
          </button>
        </div>
        {grades.length === 0 && <p className={style.emptyMessage}>Nenhuma turma cadastrada.</p>}
        <div className={style.chipList}>
          {grades.map((grade) =>
            editingGradeId === grade.id ? (
              <div key={grade.id} className={style.chipEditRow}>
                <input
                  className={style.chipEditInput}
                  value={editingGradeName}
                  onChange={(e) => setEditingGradeName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmRenameGrade(grade.id);
                    if (e.key === 'Escape') setEditingGradeId(null);
                  }}
                  autoFocus
                />
                <button
                  className={style.chipActionButton}
                  onClick={() => handleConfirmRenameGrade(grade.id)}
                  title="Confirmar"
                >
                  <CheckIcon fontSize="small" />
                </button>
                <button
                  className={style.chipActionButton}
                  onClick={() => setEditingGradeId(null)}
                  title="Cancelar"
                >
                  <CloseIcon fontSize="small" />
                </button>
              </div>
            ) : (
              <div key={grade.id} className={style.chip}>
                <span>{grade.name}</span>
                <button
                  className={style.chipIconButton}
                  title="Editar"
                  onClick={() => {
                    setEditingGradeId(grade.id);
                    setEditingGradeName(grade.name);
                  }}
                >
                  <EditOutlinedIcon fontSize="small" />
                </button>
                <button
                  className={style.chipRemoveButton}
                  title="Remover"
                  onClick={() => handleDeleteGrade(grade.id)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* ── PERÍODOS ── */}
      <div className={style.section}>
        <h2 className={style.sectionTitle}>Períodos</h2>
        <div className={style.addItemRow}>
          <input
            className={style.addItemInput}
            type="text"
            placeholder="Ex: Manhã"
            value={newPeriod}
            onChange={(e) => setNewPeriod(e.target.value)}
            onKeyDown={handlePeriodKeyDown}
            disabled={savingPeriod}
          />
          <button className={style.addButton} onClick={handleAddPeriod} disabled={savingPeriod}>
            {savingPeriod ? '...' : '+'}
          </button>
        </div>
        {periods.length === 0 && <p className={style.emptyMessage}>Nenhum período cadastrado.</p>}
        <div className={style.chipList}>
          {periods.map((period) =>
            editingPeriodId === period.id ? (
              <div key={period.id} className={style.chipEditRow}>
                <input
                  className={style.chipEditInput}
                  value={editingPeriodName}
                  onChange={(e) => setEditingPeriodName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmRenamePeriod(period.id);
                    if (e.key === 'Escape') setEditingPeriodId(null);
                  }}
                  autoFocus
                />
                <button
                  className={style.chipActionButton}
                  onClick={() => handleConfirmRenamePeriod(period.id)}
                  title="Confirmar"
                >
                  <CheckIcon fontSize="small" />
                </button>
                <button
                  className={style.chipActionButton}
                  onClick={() => setEditingPeriodId(null)}
                  title="Cancelar"
                >
                  <CloseIcon fontSize="small" />
                </button>
              </div>
            ) : (
              <div key={period.id} className={style.chip}>
                <span>{period.name}</span>
                <button
                  className={style.chipIconButton}
                  title="Editar"
                  onClick={() => {
                    setEditingPeriodId(period.id);
                    setEditingPeriodName(period.name);
                  }}
                >
                  <EditOutlinedIcon fontSize="small" />
                </button>
                <button
                  className={style.chipRemoveButton}
                  title="Remover"
                  onClick={() => handleDeletePeriod(period.id)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </button>
              </div>
            )
          )}
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
