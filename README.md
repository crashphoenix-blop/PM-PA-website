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

## Реализованный паритет с iOS

- Auth + guest mode + session refresh (401 -> refresh -> logout fallback)
- Онбординг с четырьмя шагами и сохранением состояния прохождения
- Лента: приветствие, поиск `что я хочу...`, категория `все`, фильтрация и fallback
- Детальная карточка: описание с разворачиванием, кнопка `к продавцу`, toggle избранного
- Избранное: отдельный экран и кнопка `к продавцу`
- Профиль и настройки: офлайн fallback, редактирование данных, выбор встроенного аватара
- Кастомный нижний tab bar (Лента / Избранное / Профиль)

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
