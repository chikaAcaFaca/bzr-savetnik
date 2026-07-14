# Triolingos — monorepo

Platforma za učenje srpskog za strane radnike. Specifikacija: **PLAN-v2.md**.

```
web/         Next.js PWA (static export) + Capacitor → Android APK
functions/   Cloud Functions: Freemius webhook, testovi, tutor kvota, admin grant
agent/       LiveKit agent worker (Python): Soniox STT/TTS + Claude Haiku + idle-cut
content/     Seed lekcije (brojevi N1–N6, uzorak slova Š, BZR osnove)
scripts/     seed.mjs — puni Firestore
```

## Verifikovano u ovom repou
- `web/src/lib/numbers/` — **112/112 testova** prolazi; puna srpska paradigma
  (hiljadu / dve hiljade / pet hiljada; rod; paukal; genitiv). **47 audio atoma** pokriva
  sve brojeve do 999.999.999.999.
- `web/src/lib/questions/` — generator distraktora, **2.400 pitanja validirano**.

## Setup (redosled)

### 1. Firebase
```bash
firebase init   # firestore + functions, projekat: triolingos
firebase deploy --only firestore:rules
cd functions && npm i && npm run build && firebase deploy --only functions
```
Secrets: `firebase functions:secrets:set FREEMIUS_SECRET LIVEKIT_API_KEY LIVEKIT_API_SECRET AGENT_SHARED_SECRET`

### 2. LiveKit (Contabo VPS + Coolify)
- `livekit-server generate-keys` → upiši u `livekit.yaml` i `.env`
- Uvezi `docker-compose.yml` u Coolify (isti Contabo VPS gde ti je već Coolify, ili poseban)
- **Firewall: UDP 50000–60000, TCP 7880/7881, TURN 3478/5349**
- DNS: `livekit.nknet-consulting.com` → Contabo VPS IP

### 3. Audio atomi (jednokratno)
47 atoma × 2 glasa × 2 brzine → Soniox TTS → `Storage /audio/atoms/{voice}/{atom}.mp3`
Lista atoma: `node -e "import('./web/src/lib/numbers/numberToSerbian.mjs').then(m=>console.log(m.allAtoms().join('\n')))"`

### 4. Seed + web
```bash
node scripts/seed.mjs
cd web && npm i && cp .env.example .env.local  # popuni
npm run dev            # web
npm run test:numbers   # 112 testova
npm run cap:sync       # Android build
```

### 5. Freemius
Proizvod tipa **SaaS/Serverless**. Webhook URL → `freemiusWebhook` function.
Planovi: monthly (3.000 RSD/10h), quarterly (9.000 RSD/36h), add-on 5h/10h.

## Faza 0 — pre lansiranja OBAVEZNO
1. Soniox TTS test: **Đorđe, njegov, ključ, šešir, čaša, ćevap, džem, žuti, ljubav**
2. Soniox STT test sa pravim govornikom (nepalski akcenat)
3. LiveKit PoC kroz mobilnu mrežu (CGNAT!) — TURN mora da radi
