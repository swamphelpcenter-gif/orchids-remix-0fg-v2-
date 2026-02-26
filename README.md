# Vallzx APIs

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/swampyrepo/orchids-puq2978w/tree/main)

Vallzx APIs adalah platform penyedia layanan REST API gratis yang mencakup berbagai kategori seperti downloader media sosial, kecerdasan buatan (AI), alat pengolah gambar, generator teks-ke-suara, dan banyak lagi. Dibangun dengan fokus pada kecepatan dan kemudahan penggunaan.

---

## Fitur Utama

- **Downloader Media Sosial** - Download video dari TikTok, YouTube, Instagram, dan platform lainnya dengan kualitas terbaik
- **AI Chat** - Akses ke berbagai model AI seperti Gemini, ChatGPT, dan WormGPT
- **AI Image Generator** - Generate gambar dengan AI menggunakan Imagen, Fal AI, dan Dreamify
- **Text-to-Speech** - Konversi teks ke suara dengan berbagai bahasa dan suara
- **Maker Tools** - Brat generator, FF Lobby generator, IQ Certificate, dan lainnya
- **Stalker Tools** - Cari informasi profil dari berbagai platform
- **Real-time Statistics** - Pantau penggunaan API secara real-time

---

## Teknologi yang Digunakan

| Kategori | Teknologi |
|----------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Database & Auth** | Supabase |
| **Styling** | Tailwind CSS, Bootstrap 5 |
| **Animation** | Framer Motion |
| **Maps** | MapLibre GL |
| **Alerts** | SweetAlert2 |
| **Charts** | ApexCharts |
| **Runtime** | Bun / Node.js |

---

## Struktur Folder & Files

```text
src/
├── app/                        # Next.js App Router
│   ├── api/                    # Endpoint REST API
│   │   ├── ai/                 # Fitur AI (Gemini, Google AI, WormGPT)
│   │   ├── downloader/         # Downloader (TikTok, YouTube, dll)
│   │   ├── image-generator/    # AI Image Generator (Imagen, Fal, Dreamify)
│   │   ├── maker/              # Maker tools (Brat, FF Lobby, IQC)
│   │   ├── stalker/            # Stalker tools (Roblox, dll)
│   │   ├── text-to-speech/     # TTS Generator
│   │   ├── logs/               # Real-time usage logs
│   │   ├── stats/              # Statistik penggunaan API
│   │   ├── monitor/            # Server monitoring
│   │   └── maintenance/        # Maintenance mode control
│   ├── dashboard/              # Dashboard dokumentasi API
│   ├── login/                  # Halaman masuk
│   ├── register/               # Halaman daftar
│   ├── users/                  # Manajemen profil pengguna
│   ├── result/                 # Halaman hasil download
│   ├── plan/                   # Halaman pricing/plan
│   └── error/                  # Error pages (503, 404, dll)
├── components/                 # Komponen UI (React)
│   └── ui/                     # UI primitives (shadcn/ui)
├── lib/                        # Library & Utilitas
│   ├── supabase-client.ts      # Supabase client
│   ├── supabase-server.ts      # Supabase server
│   └── hooks/                  # Custom hooks
└── hooks/                      # React Hooks
```

---

## API Endpoints

### Downloader

| Endpoint | Deskripsi |
|----------|-----------|
| `/api/downloader/tiktokdownloader` | Download video TikTok (MP4 & MP3) |
| `/api/downloader/tiktokmp4downloader` | Download video TikTok (MP4 only) |
| `/api/downloader/tiktokvid2mp3` | Download audio TikTok (MP3 only) |
| `/api/downloader/youtube-hd` | Download video YouTube HD |
| `/api/downloader/yt` | Download video/audio YouTube |

### AI Chat

| Endpoint | Deskripsi |
|----------|-----------|
| `/api/ai/gemini-ai` | Google Gemini AI Chat |
| `/api/ai/googleai` | Google AI Chat |
| `/api/ai/wormgpt-ai` | WormGPT AI Chat |
| `/api/openai/chatgpt` | OpenAI ChatGPT |

### AI Image Generator

| Endpoint | Deskripsi |
|----------|-----------|
| `/api/image-generator/imagen-3.3-ultimate` | Imagen 3.3 Ultimate |
| `/api/image-generator/fal-ai` | Fal AI Image Generator |
| `/api/image-generator/dreamify` | Dreamify Image Generator |
| `/api/image-generator/nano-banana` | Nano Banana Generator |

### Maker Tools

| Endpoint | Deskripsi |
|----------|-----------|
| `/api/maker/brat` | Brat Image Generator |
| `/api/maker/bratGif` | Brat GIF Generator |
| `/api/maker/ff-lobby-gen` | Free Fire Lobby Generator |
| `/api/maker/iqc` | IQ Certificate Generator |

### Text-to-Speech

| Endpoint | Deskripsi |
|----------|-----------|
| `/api/text-to-speech/google-tts` | Google Text-to-Speech |
| `/api/text-to-speech/v2` | TTS v2 |
| `/api/v3/text-to-speech` | TTS v3 |

### Utilities

| Endpoint | Deskripsi |
|----------|-----------|
| `/api/stats` | Statistik penggunaan API |
| `/api/logs` | Real-time logs |
| `/api/monitor` | Server status monitor |
| `/api/maintenance` | Maintenance mode status |

---

## Contoh Penggunaan

### Download Video TikTok

```bash
# Download MP4 & MP3
curl "https://apis.visora.my.id/api/downloader/tiktokdownloader?tiktokvid_url=https://vm.tiktok.com/xxxxx"

# Download MP4 only
curl "https://apis.visora.my.id/api/downloader/tiktokdownloader?tiktokvid_url=https://vm.tiktok.com/xxxxx&type=mp4"

# Download MP3 only
curl "https://apis.visora.my.id/api/downloader/tiktokdownloader?tiktokvid_url=https://vm.tiktok.com/xxxxx&type=mp3"
```

### AI Chat dengan Gemini

```bash
curl "https://apis.visora.my.id/api/ai/gemini-ai?text=Halo, apa kabar?"
```

### Generate Gambar dengan AI

```bash
curl "https://apis.visora.my.id/api/image-generator/imagen-3.3-ultimate?prompt=a+beautiful+sunset"
```

### Text-to-Speech

```bash
curl "https://apis.visora.my.id/api/text-to-speech/google-tts?text=Halo+dunia&lang=id"
```

---

## Real-time Logs di Termux (cURL)

Untuk memantau penggunaan API secara real-time langsung dari Termux, Anda dapat menggunakan perintah berikut. Pastikan Anda sudah menginstal `jq` (`pkg install jq`).

### 1. Monitor Command Berhasil (GET/POST)

Perintah ini akan menampilkan log request yang berhasil setiap 2 detik:

```bash
while true; do clear; curl -s https://apis.visora.my.id/api/logs | jq -r '.latest_command[] | "[\(.timestamp)] \(.method) \(.router) - \(.status) (\(.username)) [\(.device)]"' | head -n 20; sleep 2; done
```

### 2. Monitor Error Log

Gunakan ini untuk melihat request yang gagal atau error:

```bash
while true; do clear; curl -s https://apis.visora.my.id/api/logs | jq -r '.latest_error[] | "[\(.timestamp)] \(.method) \(.router) - \(.status) ERROR: \(.error_message || "Unknown")"' | head -n 20; sleep 2; done
```

### 3. All-in-One Monitor (JSON Raw)

Jika ingin melihat data lengkap secara mentah:

```bash
watch -n 2 "curl -s https://apis.visora.my.id/api/logs | jq ."
```

---

## Environment Variables

Buat file `.env` di root project dengan variabel berikut:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Instalasi & Development

### Prerequisites

- Node.js 18+ atau Bun
- Akun Supabase

### Setup

```bash
# Clone repository
git clone https://github.com/swampyrepo/orchids-puq2978w.git
cd orchids-puq2978w

# Install dependencies
npm install
# atau
bun install

# Setup environment variables
cp .env.example .env
# Edit .env dengan kredensial Anda

# Jalankan development server
npm run dev
# atau
bun dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk melihat hasilnya.

---

## Deploy ke Vercel

Cara termudah untuk deploy Vallzx APIs adalah menggunakan Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/swampyrepo/orchids-puq2978w/tree/main)

### Manual Deploy

1. Fork repository ini
2. Buat project baru di [Vercel](https://vercel.com)
3. Connect dengan repository yang sudah di-fork
4. Tambahkan environment variables
5. Deploy!

---

## Rate Limiting

| Plan | RPS (Request Per Second) | RPD (Request Per Day) |
|------|--------------------------|----------------------|
| Free | 5 | Unlimited |
| Premium | 50 | Unlimited |

---

## Support & Komunitas

- **WhatsApp Channel**: [Join Channel](https://whatsapp.com/channel/0029Vb7fXyMId7nQmJJx1U1L)
- **WhatsApp Group**: [Join Group](https://chat.whatsapp.com/LBrMbidvSTqGyMd2UJ5o8F)
- **GitHub**: [github.com/vreden](https://github.com/vreden)

---

## License

MIT License - Bebas digunakan untuk keperluan pribadi maupun komersial.

---

Dibuat dengan hati oleh Vallzx.
