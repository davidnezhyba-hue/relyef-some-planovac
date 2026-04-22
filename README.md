# relyef-some-planovac

Video Plánovač — SOME planovač pro firmu Relyef Pottery Tools.

## Tech stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (databáze + auth)
- **shadcn/ui** (UI komponenty)

## Spuštění

### 1. Nainstalujte závislosti

```bash
npm install
```

### 2. Nastavte prostředí

```bash
cp .env.local.example .env.local
# Vyplňte NEXT_PUBLIC_SUPABASE_URL a NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 3. Vytvořte databázi

Spusťte `sql/schema.sql` v Supabase SQL Editoru.

### 4. Spusťte vývojový server

```bash
npm run dev
```
