# Load Test Dashboard Server

Проект предназначен для проведения нагрузочного тестирования различных Node.js-фреймворков с визуализацией метрик в реальном времени через Socket.IO.

---

## 📦 Состав проекта

- Express-сервер (порт `2999`)
- WebSocket-соединение через `Socket.IO`
- Нагрузочное тестирование через `autocannon`
- Метрики CPU и памяти через `pidusage`
- Поддержка нескольких платформ: `express`, `fastify`, `koa`, `hapi`, `feathers`
- CPU-интенсивные операции вынесены в воркер (`hash-worker.js`)

---

## ❗Требования к проекту
* **NodeJS** (`24.1.0`)
* **NPM** (`11.3.0`)

---

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Запуск всех серверов платформ

```bash
npm run start:all
```

Скрипт запустит все платформы (на портах 3000–3004):

* http://localhost:3000/hash (Express)
* http://localhost:3001/hash (Fastify)
* http://localhost:3002/hash (Koa)
* http://localhost:3003/hash (Hapi)
* http://localhost:3004/hash (FeathersJS)

Убедитесь, что порты свободны перед запуском.

### 3. Запуск основного Socket.IO сервера

```bash
npm run start
```

---
