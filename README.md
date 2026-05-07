# Surprise Web

Веб-версия приложения `Surprise`, перенесенная с iOS (Swift) в формат сайта с сохранением основной логики, визуальных токенов и пользовательских сценариев.

## Технологии

- Next.js (App Router) + TypeScript
- React Query
- CSS custom properties (дизайн-токены из iOS)
- Vitest + Playwright

## Быстрый старт

1. Установите Node.js 20+.
2. Скопируйте переменные окружения:
   - `cp .env.example .env.local`
3. Установите зависимости:
   - `npm install`
4. Запустите проект:
   - `npm run dev`
5. Откройте `http://localhost:3000`.

## Переменные окружения

- `NEXT_PUBLIC_API_BASE_URL` — URL backend API (по умолчанию `http://127.0.0.1:8000`).
- `NEXT_PUBLIC_YANDEX_METRIKA_ID` — ID счётчика Яндекс.Метрики (опционально).

## Деплой на Vercel (рекомендуется)

1. Подключите репозиторий `PM-PA-website` к Vercel.
2. В `Project Settings -> Environment Variables` добавьте:
   - `NEXT_PUBLIC_API_BASE_URL=https://upipa-back-crashphoenix.amvera.io`
   - `NEXT_PUBLIC_YANDEX_METRIKA_ID=<ваш_id_счётчика>` (если подключаете Метрику)
3. Нажмите `Deploy` (или `Redeploy` после добавления переменной).

Vercel автоматически определит Next.js-проект, поэтому отдельные команды задавать не нужно.

## Деплой на Amvera (опционально)

Если нужен деплой фронта в Amvera, используйте `amvera.yaml` из репозитория.

Минимально требуется переменная:
- `NEXT_PUBLIC_API_BASE_URL=https://<URL backend-сервиса>`

## Основные маршруты

- `/welcome` — приветственный экран
- `/login` — вход
- `/register` — регистрация
- `/success` — экран успешной регистрации
- `/onboarding` — онбординг
- `/feed` — лента подарков (поиск, категории, избранное)
- `/gift/[id]` — детальный экран подарка
- `/favorites` — избранное
- `/profile` — профиль и настройки
- `/admin/gifts/new` — добавление подарка (только для admin-пользователя)

## Реализованный паритет с iOS

- Auth + guest mode + session refresh (401 -> refresh -> logout fallback)
- Онбординг с четырьмя шагами и сохранением состояния прохождения
- Лента: приветствие, поиск `что я хочу...`, категория `все`, фильтрация и fallback
- Детальная карточка: описание с разворачиванием, кнопка `к продавцу`, toggle избранного
- Избранное: отдельный экран и кнопка `к продавцу`
- Профиль и настройки: офлайн fallback, редактирование данных, выбор встроенного аватара
- Кастомный нижний tab bar (Лента / Избранное / Профиль)

## Аналитика (hybrid)

На фронтенде подключены:

- отправка событий в Яндекс.Метрику (при наличии `NEXT_PUBLIC_YANDEX_METRIKA_ID`)
- отправка серверных событий в `POST /analytics/events`

События:

- `site_open`, `session_start`, `session_end`
- `onboarding_completed`
- `purchase_click` (из деталки и избранного)
- `favorite_click` (лента/деталка/избранное)

## Дизайн-токены

Перенесены из iOS:

- `#524141` (primary)
- `#E7E1DB` (background/textSecondary)
- `#A68E8E` (secondary)
- `#D18BFF` (active favorite)
- `#7EBFFF` (image accent)

SVG-ассеты (иконки/декор) перенесены в `public/assets`.

## Тесты и проверки

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run test:e2e`

## Карта iOS -> Web

- `Navigation/AppCoordinator.swift` -> `src/features/auth/*`, `src/app/page.tsx`
- `Modules/Feed/*` -> `src/features/feed/feed-screen.tsx`
- `Modules/GiftDetail/*` -> `src/features/gift-detail/gift-detail-screen.tsx`
- `Modules/Favorites/*` -> `src/features/favorites/favorites-screen.tsx`
- `Modules/Profile/*` -> `src/features/profile/profile-screen.tsx`
- `Services/Networking/NetworkService.swift` -> `src/shared/api/client.ts`
- `Services/Storage/AuthManager.swift` -> `src/shared/lib/storage.ts`, `src/features/auth/auth-context.tsx`
