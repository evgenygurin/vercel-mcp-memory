# 🚀 Deployment Guide: Vercel MCP Memory

Пошаговая инструкция по деплою Custom MCP Memory Server на Vercel.

## ✅ Что уже готово

Проект полностью создан в `/Users/laptop/Downloads/vercel-mcp-memory/` и включает:

- ✅ Next.js структура с TypeScript
- ✅ Vercel Edge Functions для MCP protocol
- ✅ Embeddings через Vercel AI SDK
- ✅ Database layer с Postgres + pgvector
- ✅ SQL миграция для schema
- ✅ Скрипт миграции старых данных
- ✅ README с полной документацией

## 📝 Следующие шаги

### 1. Установить зависимости (5 минут)

```bash
cd /Users/laptop/Downloads/vercel-mcp-memory
npm install
```

### 2. Создать Vercel проект и Postgres database (10 минут)

#### 2.1. Установить Vercel CLI

```bash
npm i -g vercel
```

#### 2.2. Залогиниться

```bash
vercel login
```

#### 2.3. Создать новый проект

```bash
vercel
```

Следуйте инструкциям:

- Set up and deploy? **Y**
- Which scope? Выберите ваш account
- Link to existing project? **N**
- Project name? **vercel-mcp-memory** (или свое название)
- Directory? **.** (текущая директория)
- Override settings? **N**

#### 2.4. Создать Postgres database

1. Откройте <https://vercel.com/dashboard>
2. Перейдите в ваш проект `vercel-mcp-memory`
3. Вкладка **Storage** → **Create Database**
4. Выберите **Postgres**
5. Database Name: `mcp-memory-db`
6. Region: выберите ближайший к вам
7. Нажмите **Create**

### 3. Настроить Environment Variables (5 минут)

#### 3.1. Скачать переменные окружения

```bash
vercel env pull .env.local
```

Это автоматически загрузит `POSTGRES_URL` и другие переменные.

#### 3.2. Добавить OpenAI API ключ

Получите ключ на <https://platform.openai.com/api-keys>

```bash
# Добавить локально
echo 'OPENAI_API_KEY="sk-ваш-ключ-здесь"' >> .env.local

# Добавить в Vercel (production)
vercel env add OPENAI_API_KEY
```

При запросе значения вставьте ваш OpenAI API ключ.

### 4. Применить SQL миграцию (5 минут)

#### Вариант 1: Через Vercel Dashboard (рекомендуется)

1. Откройте <https://vercel.com/dashboard>
2. Storage → `mcp-memory-db` → **SQL Editor**
3. Скопируйте содержимое файла `migrations/001_init.sql`
4. Вставьте в SQL Editor
5. Нажмите **Execute**

#### Вариант 2: Через psql

```bash
# Если у вас установлен psql
psql "$(cat .env.local | grep POSTGRES_URL | cut -d '=' -f2-)" < migrations/001_init.sql
```

### 5. Деплой на Vercel (2 минуты)

```bash
vercel --prod
```

После деплоя вы получите URL вида: `https://vercel-mcp-memory.vercel.app`

**Сохраните этот URL! Он понадобится для конфигурации Claude.**

### 6. Проверить health endpoint (1 минута)

```bash
curl https://your-project.vercel.app/api/health
```

Должен вернуть:

```json
{
  "status": "healthy",
  "service": "vercel-mcp-memory",
  "database": {
    "connected": true
  }
}
```

### 7. Настроить Claude Desktop (5 минут)

#### 7.1. Найти файл конфигурации

**macOS:**

```bash
open ~/Library/Application\ Support/Claude/
```

**Linux:**

```bash
nano ~/.config/claude-desktop/claude_desktop_config.json
```

#### 7.2. Обновить claude_desktop_config.json

Откройте `claude_desktop_config.json` и добавьте:

```json
{
  "mcpServers": {
    "vercel-memory": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://YOUR-PROJECT.vercel.app/api/mcp/sse"
      ]
    }
  }
}
```

**Замените** `YOUR-PROJECT` на ваш реальный Vercel URL!

#### 7.3. Перезапустить Claude Desktop

Полностью закройте и откройте заново Claude Desktop.

### 8. Тестирование (5 минут)

#### 8.1. Проверка подключения

В Claude Desktop введите:

```text
/memory-stats
```

Если инструмент появился - подключение работает!

#### 8.2. Тестовые запросы

```bash
User: Remember: I prefer Python for backend development
```

Claude должен использовать инструмент `add_memory`.

```bash
User: What programming languages do I prefer?
```

Claude должен использовать `search_memory` и найти информацию о Python.

#### 8.3. Тест русского языка

```text
User: Remember: Петя - рыжий, но лысый, и он демон
```

```text
User: Вспомни про Петя
```

Должно найти информацию о Пете!

### 9. (Опционально) Мигрировать старые данные (10 минут)

Если у вас есть файл `~/Documents/memory.json`:

```bash
cd /Users/laptop/Downloads/vercel-mcp-memory
npm run migrate
```

Это импортирует все старые воспоминания в новую систему.

## 🎉 Готово

Теперь у вас есть полноценный MCP Memory Server на Vercel с:

- ✅ Semantic search
- ✅ Cloud storage (Postgres + pgvector)
- ✅ Cross-device sync
- ✅ Поддержка русского языка
- ✅ Zero infrastructure management

## 📊 Мониторинг

### Vercel Dashboard

1. **Functions Logs**: <https://vercel.com/dashboard> → вашproject → Functions
2. **Database Analytics**: Storage → mcp-memory-db → Analytics
3. **Usage**: Settings → Usage

### Проверка статистики памяти

В Claude:

```text
User: Show me memory statistics
```

Claude использует `memory_stats` инструмент.

## 🐛 Troubleshooting

### Claude не видит инструменты

1. Проверьте URL в конфиге:

   ```bash
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. Проверьте health endpoint:

   ```bash
   curl https://YOUR-PROJECT.vercel.app/api/health
   ```

3. Перезапустите Claude Desktop полностью (Quit, не просто закрыть окно)

### Ошибки database

1. Убедитесь, что pgvector extension включен:

   ```sql
   SELECT * FROM pg_extension WHERE extname = 'vector';
   ```

2. Проверьте таблицу:

   ```sql
   SELECT COUNT(*) FROM memories;
   ```

3. Логи в Vercel Dashboard → Functions → Logs

### Ошибки embeddings

1. Проверьте OpenAI API ключ:

   ```bash
   vercel env ls
   ```

2. Проверьте баланс: <https://platform.openai.com/usage>

3. Тестовый запрос:

   ```bash
   curl https://api.openai.com/v1/embeddings \
     -H "Authorization: Bearer $OPENAI_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "model": "text-embedding-3-small",
       "input": "test"
     }'
   ```

## 💰 Стоимость

**Ожидаемые расходы:**

- Vercel Free Tier: $0 (достаточно для личного использования)
- OpenAI Embeddings: ~$0.02-0.10/месяц (зависит от количества запросов)
- После Free Tier: ~$2-5/месяц

## 🔄 Обновления

Для обновления кода:

```bash
cd /Users/laptop/Downloads/vercel-mcp-memory
git add .
git commit -m "Update MCP server"
vercel --prod
```

## 📚 Дополнительные ресурсы

- [Vercel Documentation](https://vercel.com/docs)
- [MCP Specification](https://modelcontextprotocol.io)
- [Vercel AI SDK](https://sdk.vercel.ai)
- [pgvector GitHub](https://github.com/pgvector/pgvector)

---

Если возникнут вопросы - обращайтесь!
