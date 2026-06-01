"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminGiftsNav } from "@/features/admin/admin-gifts-nav";
import { useAuth } from "@/features/auth/auth-context";
import { candidateToGift } from "@/features/admin/candidate-to-gift";
import { apiClient } from "@/shared/api/client";
import type { Category, GiftCandidate, IngestionRun } from "@/shared/api/types";
import { GiftCard } from "@/shared/components/gift-card";

export function AdminCandidatesScreen() {
  const router = useRouter();
  const { user, isGuest } = useAuth();
  const isAdmin = Boolean(user?.is_admin) && !isGuest;

  const [candidates, setCandidates] = useState<GiftCandidate[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [lastRun, setLastRun] = useState<IngestionRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Record<number, Set<number>>>({});
  const [actingId, setActingId] = useState<number | null>(null);

  const loadCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getIngestionCandidates(statusFilter || undefined, 1, 100);
      setCandidates(response.candidates);
      setTotal(response.total);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить кандидатов");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const loadLastRun = useCallback(async () => {
    try {
      const runs = await apiClient.getIngestionRuns(1);
      setLastRun(runs[0] ?? null);
    } catch {
      setLastRun(null);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    (async () => {
      try {
        const loaded = await apiClient.getCategories();
        if (active) setCategories(loaded);
      } catch {
        // optional
      }
    })();
    return () => {
      active = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    void loadCandidates();
    void loadLastRun();
  }, [isAdmin, loadCandidates, loadLastRun]);

  if (!isAdmin) {
    return (
      <main className="page">
        <div className="content-width" style={{ maxWidth: 720 }}>
          <h1 className="page-title miama">Доступ запрещен</h1>
          <p className="screen-subtitle">Эта страница доступна только администратору.</p>
          <Link href="/profile" className="primary-button" style={{ width: 260, lineHeight: "56px", marginTop: 12 }}>
            Вернуться в профиль
          </Link>
        </div>
      </main>
    );
  }

  const onRunIngestion = async () => {
    setRunning(true);
    setError(null);
    setSuccess(null);
    try {
      const run = await apiClient.runGiftIngestion("admin");
      setLastRun(run);
      setStatusFilter("pending");
      await loadCandidates();
      setSuccess(
        `Парсер завершён: найдено ${run.found_count}, новых ${run.new_count}, дубликатов ${run.duplicate_count}.`
      );
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "Не удалось запустить парсер");
    } finally {
      setRunning(false);
    }
  };

  const onClearResults = async () => {
    const confirmed = window.confirm(
      "Удалить все результаты парсинга (кандидаты и журнал прогонов)?\n\nУже опубликованные подарки в каталоге останутся."
    );
    if (!confirmed) return;

    setClearing(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await apiClient.clearIngestionResults();
      setCandidates([]);
      setTotal(0);
      setLastRun(null);
      setSuccess(
        `Удалено: ${result.deleted_candidates} кандидатов, ${result.deleted_runs} прогонов.`
      );
    } catch (clearError) {
      setError(clearError instanceof Error ? clearError.message : "Не удалось удалить результаты");
    } finally {
      setClearing(false);
    }
  };

  const toggleCategory = (candidateId: number, categoryId: number) => {
    setSelectedCategories((prev) => {
      const next = { ...prev };
      const set = new Set(next[candidateId] ?? []);
      if (set.has(categoryId)) set.delete(categoryId);
      else set.add(categoryId);
      next[candidateId] = set;
      return next;
    });
  };

  const onApprove = async (candidate: GiftCandidate) => {
    setActingId(candidate.id);
    setError(null);
    setSuccess(null);
    try {
      await apiClient.approveGiftCandidate(candidate.id, {
        category_ids: [...(selectedCategories[candidate.id] ?? [])]
      });
      setCandidates((prev) => prev.filter((item) => item.id !== candidate.id));
      setTotal((prev) => Math.max(0, prev - 1));
      setSuccess(`«${candidate.name}» опубликован в каталоге.`);
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : "Не удалось утвердить");
    } finally {
      setActingId(null);
    }
  };

  const onReject = async (candidateId: number) => {
    setActingId(candidateId);
    setError(null);
    setSuccess(null);
    try {
      await apiClient.rejectGiftCandidate(candidateId);
      setCandidates((prev) => prev.filter((item) => item.id !== candidateId));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (rejectError) {
      setError(rejectError instanceof Error ? rejectError.message : "Не удалось отклонить");
    } finally {
      setActingId(null);
    }
  };

  const canModerate = statusFilter === "pending" || statusFilter === "duplicate";

  const tabs = [
    { id: "pending", label: "На проверке" },
    { id: "duplicate", label: "Дубликаты" },
    { id: "approved", label: "Утверждены" },
    { id: "rejected", label: "Отклонены" }
  ] as const;

  return (
    <main className="page">
      <div className="content-width">
        <AdminGiftsNav />

        <div className="admin-candidates__header">
          <div>
            <h1 className="page-title miama">Парсер подарков</h1>
            <p className="screen-subtitle">
              Запустите сбор с магазинов, просмотрите карточки как в ленте и утвердите или отклоните каждый
              подарок отдельно.
            </p>
          </div>
        </div>

        <div className="admin-candidates__toolbar">
          <button
            type="button"
            className="primary-button"
            disabled={running || clearing}
            onClick={onRunIngestion}
          >
            {running ? "Парсер работает…" : "Запустить парсер"}
          </button>
          <button
            type="button"
            className="secondary-button admin-candidates__danger"
            disabled={running || clearing}
            onClick={onClearResults}
          >
            {clearing ? "Удаление…" : "Удалить результаты парсинга"}
          </button>
        </div>

        {lastRun ? (
          <p className="screen-subtitle admin-candidates__run-summary">
            Последний прогон: найдено {lastRun.found_count}, новых {lastRun.new_count}, дубликатов{" "}
            {lastRun.duplicate_count}
            {lastRun.error_count > 0 ? `, ошибок ${lastRun.error_count}` : ""}
          </p>
        ) : null}

        {success ? <p className="admin-candidates__success">{success}</p> : null}
        {error ? <p className="auth-error">{error}</p> : null}

        <div className="admin-candidates__filters">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              className={statusFilter === item.id ? "chip chip-active" : "chip"}
              onClick={() => setStatusFilter(item.id)}
            >
              {item.label}
              {item.id === statusFilter && total > 0 ? ` (${total})` : ""}
            </button>
          ))}
        </div>

        {loading ? <p className="screen-subtitle">Загрузка...</p> : null}

        {!loading && canModerate && candidates.length > 0 ? (
          <p className="screen-subtitle" style={{ marginBottom: 8 }}>
            {total} {total === 1 ? "подарок" : total < 5 ? "подарка" : "подарков"} — выберите категории и нажмите
            «утвердить» или «отклонить»
          </p>
        ) : null}

        <section className="gift-grid admin-candidates-grid" style={{ marginTop: 12 }}>
          {candidates.map((candidate) => {
            const previewGift = candidateToGift(candidate);
            return (
              <div key={candidate.id} className="admin-candidate-item">
                <GiftCard
                  gift={previewGift}
                  onOpen={() => router.push(`/admin/gifts/candidates/${candidate.id}`)}
                  onToggleFavorite={() => {}}
                />
                {canModerate ? (
                  <div className="admin-candidate-item__panel">
                    {candidate.duplicate_reason ? (
                      <p className="admin-candidate-item__note">Дубликат: {candidate.duplicate_reason}</p>
                    ) : null}
                    {categories.length > 0 ? (
                      <div className="admin-candidate-card__categories">
                        {categories.map((category) => (
                          <label key={category.id} className="chip">
                            <input
                              type="checkbox"
                              checked={(selectedCategories[candidate.id] ?? new Set()).has(category.id)}
                              onChange={() => toggleCategory(candidate.id, category.id)}
                            />
                            {category.name}
                          </label>
                        ))}
                      </div>
                    ) : null}
                    <div className="admin-candidate-item__buttons">
                      <button
                        type="button"
                        className="primary-button"
                        disabled={actingId === candidate.id}
                        onClick={() => onApprove(candidate)}
                      >
                        утвердить
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        disabled={actingId === candidate.id}
                        onClick={() => onReject(candidate.id)}
                      >
                        отклонить
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </section>

        {!loading && candidates.length === 0 ? (
          <p className="screen-subtitle">
            Список пуст. Нажмите «Запустить парсер» или переключите вкладку.
          </p>
        ) : null}
      </div>
    </main>
  );
}
