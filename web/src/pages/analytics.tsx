import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../lib/components/button';
import { ErrorState, EmptyState, SkeletonCard, Field, inputCls } from '../lib/components/ui';
import { analyticsService, type ProjectStats, type RealtimeStats } from '../services/analyticsService';
import { projectService } from '../services/projectService';
import type { Project } from '../types/project';

function formatNumber(value: number) {
  return new Intl.NumberFormat('it-IT').format(value);
}

export default function Analytics() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [realtime, setRealtime] = useState<RealtimeStats | null>(null);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [testEventName, setTestEventName] = useState('dashboard_test');
  const [testEventData, setTestEventData] = useState('');
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoadingProjects(true);
    setProjectError(null);
    projectService.getProjects()
      .then((data) => {
        if (!active) return;
        setProjects(data);
        if (data.length) {
          setProjectId((current) => current || data[0].ID);
        }
      })
      .catch((e) => {
        if (!active) return;
        setProjectError(e instanceof Error ? e.message : 'Errore nel caricamento');
      })
      .finally(() => {
        if (!active) return;
        setLoadingProjects(false);
      });

    return () => { active = false; };
  }, []);

  const loadStats = useCallback(async () => {
    if (!projectId) return;
    setStatsLoading(true);
    setStatsError(null);
    try {
      const data = await analyticsService.getProjectStats(projectId, from || undefined, to || undefined);
      setStats(data);
    } catch (e) {
      setStatsError(e instanceof Error ? e.message : 'Errore nel caricamento');
    } finally {
      setStatsLoading(false);
    }
  }, [projectId, from, to]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (!projectId) return;
    let active = true;

    const loadRealtime = () => {
      if (active) setRealtimeError(null);
      analyticsService.getRealtimeStats(projectId)
        .then((data) => { if (active) setRealtime(data); })
        .catch((e) => { if (active) setRealtimeError(e instanceof Error ? e.message : 'Errore nel caricamento'); });
    };

    loadRealtime();
    const id = setInterval(loadRealtime, 15000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [projectId]);

  const selectedProject = useMemo(() => projects.find((p) => p.ID === projectId), [projects, projectId]);

  const bounceRate = stats?.summary?.bounce_rate ?? 0;

  const handleTrackView = async () => {
    if (!projectId) return;
    setTesting(true);
    setTestStatus(null);
    try {
      await analyticsService.track({
        project_id: projectId,
        url: window.location.href,
        referrer: document.referrer || undefined,
        title: document.title,
      });
      setTestStatus('Pageview registrata');
    } catch (e) {
      setTestStatus(e instanceof Error ? e.message : 'Errore nel tracking');
    } finally {
      setTesting(false);
    }
  };

  const handleTrackEvent = async () => {
    if (!projectId) return;
    if (!testEventName.trim()) {
      setTestStatus('Inserisci un nome evento');
      return;
    }
    setTesting(true);
    setTestStatus(null);
    try {
      await analyticsService.trackEvent({
        project_id: projectId,
        url: window.location.href,
        event_name: testEventName.trim(),
        event_data: testEventData.trim() || undefined,
      });
      setTestStatus('Evento registrato');
    } catch (e) {
      setTestStatus(e instanceof Error ? e.message : 'Errore nel tracking');
    } finally {
      setTesting(false);
    }
  };

  if (loadingProjects) {
    return (
      <div className="w-full max-w-400 mx-auto p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (projectError) {
    return <ErrorState message={projectError} onRetry={() => navigate(0)} />;
  }

  if (projects.length === 0) {
    return <EmptyState message="Nessun progetto" action="Crea progetto" onAction={() => navigate('/projects')} />;
  }

  return (
    <div className="w-full max-w-400 mx-auto p-6 md:p-8 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Analytics</h1>
          <p className="text-sm text-white/40 mt-1">Monitoraggio traffico e eventi per progetto</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 items-stretch">
          <Field label="Progetto">
            <select className={`${inputCls} min-w-60`} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              {projects.map((p) => (
                <option key={p.ID} value={p.ID}>{p.title}</option>
              ))}
            </select>
          </Field>
          <div className="flex items-end gap-3">
            <Field label="Dal">
              <input type="date" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} />
            </Field>
            <Field label="Al">
              <input type="date" className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} />
            </Field>
          </div>
        </div>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : statsError ? (
        <ErrorState message={statsError} onRetry={loadStats} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Visitatori" value={formatNumber(stats?.summary?.visitors ?? 0)} />
          <StatCard label="Visite" value={formatNumber(stats?.summary?.visits ?? 0)} />
          <StatCard label="Visualizzazioni" value={formatNumber(stats?.summary?.views ?? 0)} />
          <StatCard label="Bounce" value={`${bounceRate.toFixed(1)}%`} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-white/8 bg-[#0A0A0A]/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Eventi principali</h2>
            <span className="text-xs text-white/40">{selectedProject?.title}</span>
          </div>

          {stats?.events?.length ? (
            <div className="flex flex-col gap-2">
              {stats.events.map((event) => (
                <div key={event.event_name} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/2 px-4 py-3">
                  <span className="text-sm text-white font-medium truncate">{event.event_name}</span>
                  <span className="text-sm text-white/50 font-mono">{formatNumber(event.count)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40">Nessun evento registrato nel periodo selezionato.</p>
          )}
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#0A0A0A]/60 p-6 flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Realtime</h2>
            <p className="text-xs text-white/40">Ultimi 5 minuti</p>
          </div>
          {realtimeError ? (
            <p className="text-sm text-rose-400">{realtimeError}</p>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="text-4xl font-semibold text-white">{formatNumber(realtime?.active_visitors ?? 0)}</div>
              <p className="text-xs text-white/40">Aggiornato: {realtime?.as_of ? new Date(realtime.as_of).toLocaleTimeString('it-IT') : '—'}</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-[#0A0A0A]/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Tracking test</h2>
            <p className="text-xs text-white/40">Usa solo per verificare la pipeline di raccolta dati</p>
          </div>
          {testStatus && <span className="text-xs text-white/60">{testStatus}</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Field label="Nome evento">
            <input className={inputCls} value={testEventName} onChange={(e) => setTestEventName(e.target.value)} />
          </Field>
          <Field label="Dati evento (opzionale)">
            <input className={inputCls} value={testEventData} onChange={(e) => setTestEventData(e.target.value)} />
          </Field>
          <div className="flex gap-3">
            <Button onClick={handleTrackView} loading={testing} variant="outline" size="sm">Invia pageview</Button>
            <Button onClick={handleTrackEvent} loading={testing} size="sm">Invia evento</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl bg-[#0A0A0A]/40 border border-white/5 flex flex-col justify-between">
      <span className="text-[11px] text-white/40 font-medium uppercase tracking-wider">{label}</span>
      <span className="text-2xl font-semibold text-white font-mono mt-2">{value}</span>
    </div>
  );
}
