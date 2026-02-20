Dobre pytanie — wideo to najdroższa i najbardziej zasobożerna część platformy społecznościowej. Rozłóżmy to:

**Problem z wideo sprowadza się do trzech rzeczy:** storage (miejsce), transkodowanie (konwersja formatów), i delivery (dostarczanie do użytkownika).

---

**1. Upload + transkodowanie**

Użytkownik uploaduje plik → ląduje w MinIO → BullMQ job uruchamia FFmpeg:

```
Upload MP4 (1080p, 2GB)
    ↓
FFmpeg generuje:
    → 1080p.m3u8 (HLS, ~1.5GB)
    → 720p.m3u8  (HLS, ~800MB)
    → 480p.m3u8  (HLS, ~400MB)
    → 360p.m3u8  (HLS, ~200MB)
    → thumbnail.jpg (poster)
    → preview.gif (5s podgląd)
    ↓
Wszystko wraca do MinIO
```

HLS (HTTP Live Streaming) dzieli wideo na małe chunki po 2-10 sekund. Użytkownik pobiera tylko to, co ogląda — jak na YouTube. Adaptive bitrate automatycznie dopasowuje jakość do łącza.

---

**2. Storage — tu jest główny koszt**

Jeden film 10 min w 4 wariantach to ~1-3 GB. Przy 1000 filmów = 1-3 TB.

Opcje na Hetznerze:

**Hetzner Storage Box** — najtańszy, od €3.81/mies. za 1TB. BX11 = 1TB, BX21 = 5TB za ~€12. Dostęp po SFTP/SMB/WebDAV. Można podmontować jako backend dla MinIO lub serwować bezpośrednio.

**Hetzner Object Storage** — S3-compatible, €5/TB/mies. + €1/TB egress. Najbardziej elastyczne, natywnie współgra z MinIO client i imgproxy.

**Hetzner Volume** — block storage podpięty do VPS, €0.052/GB/mies. (~€52/TB). Droższy, ale szybki, lokalny dostęp.

Rekomendacja: **Hetzner Object Storage** jako primary, jest najtańszy przy dużej skali i S3-compatible.

---

**3. Delivery — jak serwować szybko**

Sam Hetzner z Niemiec będzie wolny dla użytkowników w Polsce na mobilnym. Rozwiązanie:

**Cloudflare (darmowy plan):** Stawiasz domenę na Cloudflare → proxujesz ruch do MinIO/Hetzner → Cloudflare cachuje chunki HLS na swoim CDN globalnie. Darmowy plan nie ma limitu transferu. Ale uwaga — Cloudflare ToS zabrania serwowania wideo jako primary content na darmowym planie. W praktyce przy małej skali nikt tego nie egzekwuje, ale to ryzyko.

**Cloudflare R2** — alternatywa dla MinIO. S3-compatible, **zero opłat za egress**. $0.015/GB storage. Przy 1TB = $15/mies. Bez limitu transferu. To jest game changer dla wideo.

**BunnyCDN** — tani CDN, $0.01/GB transfer w Europie. Mają też **Bunny Stream** — dedykowany hosting wideo z transkodowaniem za $5/mies. + $0.005/min przechowywania. Dla małej platformy to może być prostsze niż własny FFmpeg pipeline.

---

**4. Odtwarzacz**

Na froncie: **Video.js** (https://github.com/videojs/video.js) lub **Plyr** (https://github.com/sampotts/plyr) — oba obsługują HLS, adaptive bitrate, customowy skin.

---

**Dwa realistyczne scenariusze:**

**Scenariusz A — full self-hosted (max kontrola, więcej pracy):**
Hetzner VPS + Hetzner Object Storage + FFmpeg/BullMQ + Cloudflare proxy + Video.js. Koszt: ~€20-30/mies. na start. Musisz sam zarządzać transkodowaniem, kolejkami, błędami.

**Scenariusz B — pragmatyczny hybrid (polecam na start):**
Bunny Stream do wideo ($5/mies. base) — uploadujesz plik, oni transkodują, dają CDN i embed. Reszta platformy (posty, czat, zdjęcia) na Hetznerze. Kiedy urośniesz i Bunny stanie się drogi, migrujesz na własny pipeline FFmpeg.

---

Na jaką skalę celujesz na start? Ile filmów dziennie / jaka długość? To pomoże wybrać konkretne rozwiązanie.