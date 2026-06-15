"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/shared/api/client";
import type { Gift } from "@/shared/api/types";
import { GiftCard } from "@/shared/components/gift-card";
import { toggleFavorite } from "@/features/favorites/favorites-service";

// ── Вопросы опросника ──────────────────────────────────────────
const QUESTIONS = [
  {
    id: "recipient" as const,
    label: "Кому подарок?",
    options: ["подруге", "парню", "маме", "папе", "сестре", "брату", "коллеге", "другу"],
  },
  {
    id: "occasion" as const,
    label: "Какой повод?",
    options: ["день рождения", "годовщина", "новый год", "просто так"],
  },
  {
    id: "is_urgent" as const,
    label: "Нужен ли подарок срочно?",
    options: ["да", "нет"],
  },
  {
    id: "budget" as const,
    label: "Бюджет?",
    options: [
      "до 2 000 ₽",
      "2 000–5 000 ₽",
      "5 000–10 000 ₽",
      "10 000–20 000 ₽",
      "20 000 ₽ и выше",
    ],
  },
  {
    id: "age_group" as const,
    label: "Возраст получателя?",
    options: ["до 18 лет", "18–30 лет", "30–50 лет", "старше 50 лет"],
  },
  {
    id: "interests" as const,
    label: "Интересы получателя?",
    options: ["красота и уход", "дом и уют", "спорт и активность", "технологии", "творчество", "еда и напитки"],
  },
  {
    id: "style" as const,
    label: "Какой стиль подарка?",
    options: ["практичный", "эмоциональный", "оригинальный", "красивый", "смешной"],
  },
] as const;

type QuestionId = (typeof QUESTIONS)[number]["id"];
type Answers = Partial<Record<QuestionId, string>>;

// ── Компонент ──────────────────────────────────────────────────
export function AIAssistantScreen() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Gift[] | null>(null);
  const [budgetExpanded, setBudgetExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allAnswered = QUESTIONS.every((q) => answers[q.id]);

  const select = (qId: QuestionId, option: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const submit = async () => {
    if (!allAnswered) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getAIRecommendations({
        recipient: answers.recipient!,
        occasion: answers.occasion!,
        budget: answers.budget!,
        style: answers.style!,
        is_urgent: answers.is_urgent === "да",
        age_group: answers.age_group ?? "",
        interests: answers.interests ?? "",
      });
      setResults(res.gifts);
      setBudgetExpanded(res.budget_expanded ?? false);
    } catch {
      setError("Не удалось получить рекомендации. Попробуй ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResults(null);
    setAnswers({});
    setError(null);
    setBudgetExpanded(false);
  };

  const onToggleFavorite = async (giftId: number) => {
    if (!results) return;
    try {
      const isFavorite = await toggleFavorite(giftId, { surface: "ai" });
      setResults((prev) =>
        prev ? prev.map((g) => (g.id === giftId ? { ...g, is_favorite: isFavorite } : g)) : prev
      );
    } catch {
      // ignore
    }
  };

  // ── Результаты ─────────────────────────────────────────────
  if (results) {
    return (
      <main className="page">
        <div className="content-width">
          <div className="ai-results-header">
            <button type="button" className="ai-back-btn" onClick={reset}>
              ← изменить запрос
            </button>
            <h1 className="page-title" style={{ marginTop: 8 }}>
              Вот что подойдёт
            </h1>
            <p className="ai-results-subtitle">
              {answers.recipient} · {answers.occasion} · {answers.budget}
            </p>
          </div>

          {budgetExpanded && (
            <div className="ai-budget-note">
              В выбранном бюджете мало вариантов — показываем похожие подарки из других ценовых категорий
            </div>
          )}

          {results.length === 0 ? (
            <div className="state-banner">
              <p className="state-banner-text">
                К сожалению на данный бюджет ничего не нашлось, возможно загляните в другие категории?
              </p>
              <button type="button" className="primary-button state-banner-action" onClick={reset}>
                попробовать ещё раз
              </button>
            </div>
          ) : (
            <section className="gift-grid" style={{ marginTop: 16 }}>
              {results.map((gift) => (
                <GiftCard
                  key={gift.id}
                  gift={gift}
                  onOpen={() => router.push(`/gift/${gift.id}`)}
                  onToggleFavorite={() => void onToggleFavorite(gift.id)}
                />
              ))}
            </section>
          )}
        </div>
      </main>
    );
  }

  // ── Опросник ───────────────────────────────────────────────
  return (
    <main className="page ai-page">
      <div className="content-width">

        {/* Шапка */}
        <div className="ai-hero">
          <div className="ai-hero-icon">
            <svg width="36" height="36" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.5 1.5 L15.1 11.9 L13.5 25.5 L11.9 11.9 Z" fill="#524141"/>
              <path d="M25.5 13.5 L15.1 15.1 L1.5 13.5 L15.1 11.9 Z" fill="#524141"/>
              <path d="M21.6 5.4 L14.9 12.8 L5.4 21.6 L12.1 14.2 Z" fill="#524141" opacity="0.55"/>
              <path d="M5.4 5.4 L12.8 12.1 L21.6 21.6 L14.2 14.9 Z" fill="#524141" opacity="0.55"/>
            </svg>
          </div>
          <div>
            <h1 className="ai-hero-title">ИИ-помощник</h1>
            <p className="ai-hero-subtitle">Отвечайте на пару вопросов,<br/>а я подберу идеальные подарки</p>
          </div>
        </div>

        {/* Карточки с вопросами */}
        {QUESTIONS.map((q) => (
          <div key={q.id} className="ai-card">
            <p className="ai-card-title">{q.label}</p>
            <div className="ai-chips">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`ai-chip${answers[q.id] === opt ? " ai-chip--active" : ""}`}
                  onClick={() => select(q.id, opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        {error ? <p className="ai-error">{error}</p> : null}

        {/* Кнопка */}
        <div className="ai-submit-wrap">
          <button
            type="button"
            className="primary-button ai-submit-btn"
            disabled={!allAnswered || loading}
            onClick={() => void submit()}
          >
            {loading ? "Подбираю подарки..." : "Подобрать подарки"}
          </button>
        </div>

      </div>
    </main>
  );
}
