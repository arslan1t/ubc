# UBC — Uzbek Basketball Culture

Баскетбольная платформа Узбекистана.

## Стек

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, React Query, Zustand
- **Backend**: NestJS, Fastify, TypeScript
- **БД**: PostgreSQL + Prisma ORM
- **Хранилище**: Cloudflare R2
- **Карты**: Yandex Maps
- **Авторизация**: Email/Password, Google OAuth, Telegram

## Быстрый старт

### 1. Запустить PostgreSQL (dev)

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 2. Настроить env-файлы

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Заполнить `apps/api/.env` нужными значениями.

### 3. Применить миграции и запустить

```bash
pnpm install

# Создать первую миграцию
cd apps/api && pnpm exec prisma migrate dev --name init
cd ../..

# Запустить всё
pnpm dev
```

Frontend: http://localhost:3000  
Backend API: http://localhost:4000/api/v1  
Swagger docs: http://localhost:4000/api/docs

## Production

```bash
cp apps/api/.env.example apps/api/.env   # заполнить prod-значениями
cp apps/web/.env.example apps/web/.env   # заполнить prod-значениями
docker compose up --build -d
```

## Структура

```
ubc/
├── apps/
│   ├── api/          # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/         # JWT + Google + Telegram
│   │   │   ├── users/        # Профиль пользователя
│   │   │   ├── courts/       # Корты + отзывы
│   │   │   ├── open-runs/    # Open Runs + участники
│   │   │   ├── news/         # Новости
│   │   │   ├── media/        # Медиа (видео/фото)
│   │   │   ├── storage/      # Cloudflare R2
│   │   │   └── prisma/       # PrismaService
│   │   └── prisma/
│   │       └── schema.prisma
│   └── web/          # Next.js 15 frontend
│       └── src/
│           ├── app/          # Pages (App Router)
│           ├── components/   # UI-компоненты
│           ├── hooks/        # React Query хуки
│           ├── store/        # Zustand (auth)
│           └── lib/          # API клиент, утилиты
└── packages/
    └── shared/       # Общие типы
```

## API Endpoints

| Метод | URL | Описание |
|-------|-----|----------|
| POST | /auth/register | Регистрация |
| POST | /auth/login | Вход |
| POST | /auth/refresh | Обновить токен |
| POST | /auth/telegram | Telegram auth |
| GET | /auth/google | Google OAuth |
| GET | /users/me | Мой профиль |
| PATCH | /users/me | Обновить профиль |
| GET | /courts | Список кортов |
| GET | /courts/:slug | Корт по slug |
| POST | /courts | Создать корт (admin) |
| POST | /courts/:id/reviews | Отзыв |
| GET | /open-runs | Список Open Runs |
| POST | /open-runs | Создать Open Run |
| POST | /open-runs/:id/join | Записаться |
| DELETE | /open-runs/:id/leave | Отменить |
| GET | /news | Новости |
| GET | /news/:slug | Статья |
| GET | /media | Медиа |
| GET | /media/:id | Медиа-элемент |
