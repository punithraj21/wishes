# 🎉 Wishes Platform

A beautiful, interactive wishes platform built with **Next.js 16**, **Supabase**, **Three.js**, and **Framer Motion**. Create personalized wish experiences with stunning animations, interactive elements, and shareable links.

---

## ✨ Features

### 🔐 Admin Module

- **Authentication** — Email/password + Google OAuth (login & register)
- **Dashboard** — List, preview, edit, delete, and share wishes
- **Rich Wish Creator** — Form with:
  - Person name, title, special date
  - Tiptap rich text editor for messages
  - Drag-and-drop image uploader (up to 10 images, 10MB each)
  - Audio upload or recording support
  - Visual theme selector (4 themes)
- **Route Protection** — Middleware-based auth guard on all admin routes

### 🎂 Public Wish Experience (6-Step Interactive Flow)

| Step | Component          | Description                                            |
| ---- | ------------------ | ------------------------------------------------------ |
| 1    | **Intro Screen**   | Animated gift box with particles and themed CTA        |
| 2    | **Name Reveal**    | Letter-by-letter name animation with gradient orbs     |
| 3    | **Memory Gallery** | Swipeable image carousel with Framer Motion            |
| 4    | **Message Reveal** | Typewriter effect with HTML rendering                  |
| 5    | **Birthday Cake**  | SVG cake with 5 tappable candles — blow them out!      |
| 6    | **Celebration**    | Three.js 3D fireworks + CSS fireworks + confetti burst |

### 🎆 Animations & Effects

- **Three.js 3D Fireworks** — WebGL particle system with shell launches, spherical explosions, gravity, and additive blending
- **CSS Fireworks** — Staggered burst animations with glowing particles
- **Canvas Confetti** — Multi-directional confetti cannons
- **Floating Balloons** — Emoji balloons with wobbling strings
- **Interactive Cake** — SVG two-tier cake with flickering candle flames, smoke puffs on blow-out

### 🎨 Theme System

| Theme      | Style                       |
| ---------- | --------------------------- |
| 🎪 Cartoon | Fun, vibrant, playful       |
| 💎 Elegant | Sophisticated, gold accents |
| ✨ Minimal | Clean, modern, simple       |
| 🎄 Festive | Holiday, warm, celebratory  |

---

## 🛠 Tech Stack

| Layer           | Technology                             |
| --------------- | -------------------------------------- |
| Framework       | Next.js 16 (App Router, Turbopack)     |
| Language        | TypeScript                             |
| Styling         | Tailwind CSS                           |
| Database & Auth | Supabase (PostgreSQL + Auth + Storage) |
| 3D Graphics     | Three.js via @react-three/fiber        |
| Animations      | Framer Motion                          |
| Confetti        | canvas-confetti                        |
| Audio           | Howler.js                              |
| Rich Text       | Tiptap                                 |
| Forms           | React Hook Form + Zod                  |
| State           | Zustand                                |
| File Upload     | React Dropzone                         |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx                # Root layout (fonts + dark mode)
│   ├── globals.css               # Global styles & animations
│   ├── page.tsx                  # Redirect → /admin/login
│   ├── admin/
│   │   ├── layout.tsx            # Admin sidebar layout
│   │   ├── login/page.tsx        # Login (email + Google)
│   │   ├── register/page.tsx     # Register (email + Google)
│   │   ├── dashboard/page.tsx    # Wish listing
│   │   └── create/page.tsx       # Create wish form
│   └── wish/[slug]/page.tsx      # Public wish experience
├── components/
│   ├── admin/                    # WishForm, WishCard, uploaders, editor
│   ├── ui/                       # Button, Card, Input, Modal, Spinner
│   └── wish/                     # All 6 experience steps + effects
│       ├── IntroScreen.tsx
│       ├── NameReveal.tsx
│       ├── MemoryGallery.tsx
│       ├── MessageReveal.tsx
│       ├── BirthdayCake.tsx      # SVG cake + interactive candles
│       ├── CelebrationScreen.tsx
│       ├── Fireworks3D.tsx       # Three.js WebGL fireworks
│       ├── Fireworks.tsx         # CSS fireworks
│       ├── FloatingBalloons.tsx
│       ├── AudioPlayer.tsx
│       └── WishExperience.tsx    # Step orchestrator
├── lib/
│   ├── supabase/client.ts        # Browser Supabase client
│   ├── supabase/server.ts        # Server Supabase client
│   ├── types.ts                  # TypeScript interfaces
│   ├── constants.ts              # Theme configs
│   └── utils.ts                  # Slug gen, date format, sanitize
├── store/wishStore.ts            # Zustand state
└── middleware.ts                 # Auth route protection
```

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js 18+
- npm
- Supabase account

### 1. Clone & Install

```bash
git clone https://github.com/punithraj21/wishes.git
cd wishes
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql)
3. Go to **Storage** → Create a bucket named `wishes` → Set to **Public**
4. Run these storage policies in SQL Editor:

```sql
CREATE POLICY "Public read" ON storage.objects FOR SELECT USING (bucket_id = 'wishes');
CREATE POLICY "Auth upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'wishes');
CREATE POLICY "Auth update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'wishes');
CREATE POLICY "Auth delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'wishes');
```

5. _(Optional)_ Enable Google OAuth in **Authentication** → **Providers**

### 3. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📋 Database Schema

### `wishes` table

| Column       | Type        | Description                           |
| ------------ | ----------- | ------------------------------------- |
| id           | UUID        | Primary key                           |
| slug         | TEXT        | Unique shareable slug                 |
| person_name  | TEXT        | Recipient name                        |
| title        | TEXT        | Wish title                            |
| special_date | DATE        | Birthday/occasion date                |
| message      | TEXT        | Rich text HTML message                |
| theme        | TEXT        | cartoon / elegant / minimal / festive |
| created_by   | UUID        | Auth user reference                   |
| created_at   | TIMESTAMPTZ | Auto timestamp                        |
| updated_at   | TIMESTAMPTZ | Auto-updated via trigger              |

### `wish_media` table

| Column      | Type    | Description          |
| ----------- | ------- | -------------------- |
| id          | UUID    | Primary key          |
| wish_id     | UUID    | Foreign key → wishes |
| type        | TEXT    | `image` or `audio`   |
| file_url    | TEXT    | Supabase Storage URL |
| order_index | INTEGER | Display order        |

**RLS Policies:** Public read, creator-only write/update/delete.

---

## 🌐 Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
npx vercel deploy
```

Set the same environment variables in your Vercel project settings.

---

## 📄 License

MIT

---

Built with ❤️ by [punithraj21](https://github.com/punithraj21)
