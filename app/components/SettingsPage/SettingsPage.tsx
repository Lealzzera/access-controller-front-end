'use client';

import { useCallback, useEffect, useState } from 'react';
import style from './style.module.css';
import { useUser } from '@/app/context/userContext';
import { getGradesByInstituionId } from '@/app/actions/getGradesByInstitutionId';
import { getPeriodsByInstituionId } from '@/app/actions/getPeriodsByInstitutionId';
import { configureInstitution } from '@/app/actions/configureInstitution';
import ButtonComponent from '../ButtonComponent/ButtonComponent';
import { CircularProgress, Snackbar, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type GradeType = {
  id: string;
  name: string;
};

type PeriodType = {
  id: string;
  name: string;
};

export default function SettingsPage() {
  const { userInfo } = useUser();

  const [periods, setPeriods] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [newPeriod, setNewPeriod] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const fetchConfig = useCallback(async () => {
    if (!userInfo) return;
    setLoading(true);

    try {
      const [gradesResult, periodsResult] = await Promise.all([
        getGradesByInstituionId(userInfo.id),
        getPeriodsByInstituionId(userInfo.id),
      ]);

      if (Array.isArray(gradesResult)) {
        setGrades(gradesResult.map((g: GradeType) => g.name));
      }
      if (Array.isArray(periodsResult)) {
        setPeriods(periodsResult.map((p: PeriodType) => p.name));
      }
    } catch {
      setSnackbar({
        open: true,
        message: 'Erro ao carregar configurações.',
        severity: 'error',
      });
    }

    setLoading(false);
  }, [userInfo]);

  useEffect(() => {
    if (userInfo) fetchConfig();
  }, [userInfo, fetchConfig]);

  const handleAddPeriod = () => {
    const trimmed = newPeriod.trim();
    if (!trimmed) return;
    if (periods.includes(trimmed)) {
      setSnackbar({ open: true, message: 'Período já adicionado.', severity: 'error' });
      return;
    }
    setPeriods((prev) => [...prev, trimmed]);
    setNewPeriod('');
  };

  const handleRemovePeriod = (index: number) => {
    setPeriods((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddGrade = () => {
    const trimmed = newGrade.trim();
    if (!trimmed) return;
    if (grades.includes(trimmed)) {
      setSnackbar({ open: true, message: 'Turma já adicionada.', severity: 'error' });
      return;
    }
    setGrades((prev) => [...prev, trimmed]);
    setNewGrade('');
  };

  const handleRemoveGrade = (index: number) => {
    setGrades((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!userInfo) return;
    setSaving(true);

    try {
      const result = await configureInstitution({
        institutionId: userInfo.id,
        periods,
        grades,
      });

      if (result?.status && result.status >= 400) {
        setSnackbar({
          open: true,
          message: result.message || 'Erro ao salvar configurações.',
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Configurações salvas com sucesso!',
          severity: 'success',
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: 'Erro ao salvar configurações.',
        severity: 'error',
      });
    }

    setSaving(false);
  };

  const handlePeriodKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPeriod();
    }
  };

  const handleGradeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddGrade();
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
          />
          <button className={style.addButton} onClick={handleAddPeriod}>
            +
          </button>
        </div>
        {periods.length === 0 && (
          <p className={style.emptyMessage}>Nenhum período adicionado.</p>
        )}
        <div className={style.chipList}>
          {periods.map((period, index) => (
            <div key={`period-${index}`} className={style.chip}>
              <span>{period}</span>
              <button
                className={style.chipRemoveButton}
                onClick={() => handleRemovePeriod(index)}
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={style.section}>
        <h2 className={style.sectionTitle}>Turmas</h2>
        <div className={style.addItemRow}>
          <input
            className={style.addItemInput}
            type="text"
            placeholder="Ex: 1º Ano"
            value={newGrade}
            onChange={(e) => setNewGrade(e.target.value)}
            onKeyDown={handleGradeKeyDown}
          />
          <button className={style.addButton} onClick={handleAddGrade}>
            +
          </button>
        </div>
        {grades.length === 0 && (
          <p className={style.emptyMessage}>Nenhuma turma adicionada.</p>
        )}
        <div className={style.chipList}>
          {grades.map((grade, index) => (
            <div key={`grade-${index}`} className={style.chip}>
              <span>{grade}</span>
              <button
                className={style.chipRemoveButton}
                onClick={() => handleRemoveGrade(index)}
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={style.saveButtonContainer}>
        <ButtonComponent
          buttonText={saving ? 'Salvando...' : 'Salvar Configurações'}
          onClick={handleSave}
          disabled={saving}
        />
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
