# On-Prem Server Setup & Sync Plan

Fresh install of the SSIC backend + frontend on a school-premises Windows box, syncing bidirectionally with the live VPS at `ssiccmr.com`.

- **VPS (already live)**: `ssiccmr.com` — source of truth for parents-from-home, remote staff.
- **On-prem (to install)**: Windows machine on school LAN — serves staff during school hours, works offline.
- **Sync**: DB via built-in sync module every 5 min; `uploads/` folder via Syncthing.
- **Routing**: split-horizon DNS so both entry points use the same URL (`ssiccmr.com`).

---

## 0. Blockers to fix BEFORE deploying

While preparing this plan I found three more bugs in the sync module that will prevent end-to-end sync. These are separate from the three already fixed in commit `1e1f0b4`. **The plan below assumes these are fixed first.**

### 0.1 Client/server route mismatch

`src/sync/api-client.ts` calls paths that don't exist on the server:

| Client call | Server route (`sync-routes.ts`) | Status |
|---|---|---|
| `POST {base}/records/:table` with `{record, timestamp}` | `POST /sync/receive/:table` expects `{records: [...]}` | 404 + shape mismatch |
| `POST {base}/batch/:table` with `{records, timestamp}` | (none) | 404 |
| `GET {base}/info` | (none) | 404 |

**Fix**: either rename client calls to hit `/sync/receive/:table` and wrap single records in a `{records: [record]}` array, or add server routes matching what the client sends. Recommend the former (fewer server changes).

### 0.2 No authentication on sync routes

`/api/sync/*` endpoints have no auth middleware. Anyone on the internet who finds `ssiccmr.com/api/sync/receive/User` can inject users. The client already sends `Authorization: Bearer <SYNC_API_KEY>` — add matching middleware server-side.

**Fix**: add a middleware to `src/sync/sync-routes.ts` that checks `req.header('Authorization')` against `process.env.SYNC_API_KEY`.

### 0.3 File uploads not synced

Confirmed: `src/sync/*` only handles the DB. Photos uploaded on-prem will 404 for parents on VPS (and vice versa) unless the `uploads/` folder is replicated. See §8 below (Syncthing).

---

## 1. Architecture

```
┌─────────────────────┐        ┌──────────────────────┐
│  School LAN         │        │  Internet            │
│                     │        │                      │
│  Staff laptops ─────┼───▶  ssiccmr.com (LAN DNS override)
│                     │        │  = 192.168.1.10 (on-prem)
│  On-prem box        │        │                      │
│  (Windows + Docker) │        │                      │
│  - Backend :4000    │◀───────┼───▶  ssiccmr.com (public DNS)
│  - Frontend :80     │  sync  │      = VPS IP
│  - Postgres         │        │                      │
│  - uploads/         │        │  Parents ────────────┘
└─────────────────────┘        └──────────────────────┘
```

- Staff on LAN → router DNS resolves `ssiccmr.com` to `192.168.1.10` → hits on-prem.
- Parents at home → public DNS resolves `ssiccmr.com` to VPS IP → hits VPS.
- Both sides run identical code, sync every 5 min while internet is up.

---

## 2. On-prem Windows box — prerequisites

| Item | Recommendation |
|---|---|
| OS | Windows 10/11 Pro or Windows Server |
| RAM | 8 GB minimum, 16 GB recommended |
| Disk | 256 GB SSD, plus a second disk (or partition) for backups |
| UPS | **Mandatory.** Dirty shutdowns corrupt Postgres. |
| Networking | Static LAN IP (e.g. `192.168.1.10`) |
| Software | WSL2 + Docker Desktop, or native Node 20 + Postgres 15 |

**Strongly recommended: install Docker Desktop with WSL2 backend.** The stack was built for Linux — Docker keeps things portable, backups become one command, and it isolates from Windows quirks.

---

## 3. VPS-side preparation

Do these on `ssiccmr.com` before touching the on-prem box.

### 3.1 Generate a sync API key

```bash
openssl rand -hex 32
# copy the output — this is your SYNC_API_KEY
```

### 3.2 Add to VPS `.env`

```bash
# /var/www/sms_backend/.env
SERVER_ID=vps                    # was previously "1"; give it a meaningful name
SYNC_API_KEY=<the key from above>
```

Restart:
```bash
pm2 restart sms-backend --update-env
```

### 3.3 Confirm sync routes accessible

```bash
curl https://ssiccmr.com/api/sync/health
# should return {"status":"healthy","server_id":"vps",...}
```

### 3.4 Snapshot the DB for on-prem seeding

```bash
pg_dump -Fc -f /tmp/ssic_snapshot.dump "$DATABASE_URL_PRODUCTION"
scp /tmp/ssic_snapshot.dump admin@school-box:/path/to/dump
```

Also copy the `uploads/` folder:
```bash
tar czf /tmp/uploads.tgz -C /var/www/sms_backend uploads
scp /tmp/uploads.tgz admin@school-box:/path/to/uploads.tgz
```

---

## 4. On-prem installation (Docker path — recommended)

### 4.1 Install dependencies on Windows
1. Enable WSL2: PowerShell (admin) → `wsl --install`
2. Install Docker Desktop → enable WSL2 backend in settings
3. Install Git for Windows

### 4.2 Clone the repo

Open WSL terminal (Ubuntu):
```bash
git clone git@github.com:TambongStercy/sms_backend.git /opt/ssic
cd /opt/ssic
```

### 4.3 Create `docker-compose.yml` at repo root

Add a `docker-compose.yml` that runs Postgres + the backend + Nginx serving the frontend. Skeleton:

```yaml
version: "3.9"
services:
  db:
    image: postgres:15
    restart: unless-stopped
    environment:
      POSTGRES_DB: ssic_db
      POSTGRES_USER: ssic
      POSTGRES_PASSWORD: <strong password>
    volumes:
      - db_data:/var/lib/postgresql/data
    ports: ["5432:5432"]

  backend:
    build: .
    restart: unless-stopped
    depends_on: [db]
    env_file: .env
    volumes:
      - ./uploads:/app/uploads
    ports: ["4000:4000"]

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    depends_on: [backend]
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./frontend-dist:/usr/share/nginx/html:ro
      - ./certs:/etc/nginx/certs:ro
    ports: ["80:80", "443:443"]

volumes:
  db_data:
```

Add a matching `Dockerfile` for the backend (multi-stage: `npm ci` → `npm run build` → run `node dist/server.js`).

### 4.4 On-prem `.env`

```bash
NODE_ENV=production
DATABASE_URL_PRODUCTION=postgresql://ssic:<password>@db:5432/ssic_db
JWT_SECRET=<SAME value as VPS>              # tokens must be interchangeable
SYNC_API_KEY=<SAME key as VPS>

# Sync identity — must differ from VPS
SERVER_ID=school-onprem
SERVER_TYPE=local
REMOTE_SYNC_URL=https://ssiccmr.com/api/sync
```

Copy `JWT_SECRET` from VPS `.env` — if they don't match, a token minted on VPS won't validate on-prem.

### 4.5 Bring the stack up

```bash
docker compose up -d db
# wait for postgres to be ready
pg_restore -h localhost -U ssic -d ssic_db /path/to/dump   # from §3.4
tar xzf /path/to/uploads.tgz -C /opt/ssic
docker compose up -d backend nginx
```

### 4.6 Apply migrations

The dump from VPS already contains the schema including `server_id`/`checksum`. If the on-prem was seeded from an older dump:

```bash
docker compose exec backend npx prisma migrate deploy
```

### 4.7 Verify

```bash
curl http://localhost:4000/api/v1/health
curl http://localhost:4000/api/sync/health
# {"status":"healthy","server_id":"school-onprem",...}
```

---

## 5. Bootstrap the first sync

**Do this with test data first.** Do NOT enable auto-sync on live records until round-trip is verified.

1. On-prem: create a throwaway student named `SYNC_TEST_1`.
2. Manually trigger a sync:
   ```bash
   curl -X POST http://localhost:4000/api/sync/trigger
   ```
3. On VPS: check the student appeared:
   ```bash
   psql "$DATABASE_URL_PRODUCTION" -c "select id, name, server_id from \"Student\" where name = 'SYNC_TEST_1';"
   ```
   Expect one row with `server_id = 'school-onprem'`.
4. On VPS: edit the student's phone.
5. On-prem: trigger sync again. Confirm the phone update propagated.
6. Delete the test student on both sides.

Once round-trip works, enable auto-sync on on-prem:
```bash
curl -X POST http://localhost:4000/api/sync/auto/start -d '{"intervalMinutes":5}' -H 'Content-Type: application/json'
```

---

## 6. Split-horizon DNS (staff-on-LAN hits on-prem, everyone else hits VPS)

**Option A — Router supports DNS overrides** (pfSense, UniFi, OpenWrt, most business routers):
- Router admin → DNS/DHCP → add entry: `ssiccmr.com` → `192.168.1.10`
- Reboot devices on the LAN or wait for DNS TTL

**Option B — Router doesn't support it → Pi-hole (~$40)**
- Flash Raspberry Pi OS on a Pi 4
- Install Pi-hole: `curl -sSL https://install.pi-hole.net | bash`
- Pi-hole admin → Local DNS → add `ssiccmr.com` → `192.168.1.10`
- Router DHCP settings → hand out Pi's IP as DNS server

### SSL cert

Public HTTPS is already handled by the VPS. On-prem needs the same cert to avoid browser warnings:

1. On VPS, reissue with DNS-01 challenge (works for split-horizon):
   ```bash
   certbot certonly --manual --preferred-challenges dns -d ssiccmr.com
   ```
2. Copy the cert + key to on-prem: `certs/fullchain.pem`, `certs/privkey.pem`
3. Mount into Nginx (see `docker-compose.yml` in §4.3)
4. Add a monthly cron on VPS to rsync the renewed cert to on-prem.

---

## 7. Backup strategy (three layers)

### Layer 1 — Nightly Postgres dump to second disk
Windows Task Scheduler → runs at 02:00 daily:
```bash
docker compose exec -T db pg_dump -Fc -U ssic ssic_db > D:\backups\ssic_$(date +%Y%m%d).dump
# keep last 14 days
```

### Layer 2 — Weekly external USB drive rotation
Same script writes to `E:\backups\` (rotated USB drive) every Sunday. Take one drive home weekly.

### Layer 3 — Continuous sync to VPS
The built-in sync module already covers this once auto-sync is enabled. If on-prem burns down, VPS is at most 5 minutes stale.

### `uploads/` folder
Not covered by pg_dump. Add it to all three layers:
- Nightly: `tar czf D:\backups\uploads_$(date +%Y%m%d).tgz uploads/`
- Continuous: Syncthing (see §8)

---

## 8. File sync — Syncthing for `uploads/`

The DB syncs but photos don't. Fix with Syncthing (free, works on Windows, handles offline reconnects):

1. Install Syncthing on both VPS and on-prem: https://syncthing.net
2. Add both `uploads/` folders to Syncthing
3. Pair the two devices (Syncthing UI exchanges IDs)
4. Set the folder to "Send & Receive" on both sides
5. Verify: upload a photo on-prem, wait 30s, confirm it appears in VPS `uploads/`

Alternative: `rsync` over SSH on a 5-min cron. Simpler but doesn't handle conflicts as gracefully.

---

## 9. Windows-specific gotchas

| Concern | Impact | Mitigation |
|---|---|---|
| Windows Update auto-restart | Data loss during forced reboot | Group Policy → "No auto-restart with logged on users" |
| Antivirus flags headless Chrome | Report generation fails | Whitelist Puppeteer's Chromium path in Windows Defender |
| Windows firewall blocks port 4000/80 | LAN can't reach the server | Add inbound rules for TCP 80, 443 |
| File permissions on `uploads/` | Backend can't write photos | Run Docker Desktop as admin, or `icacls` grant Modify on uploads/ |
| Task Scheduler vs cron | Backup script needs Windows syntax | Use PowerShell scripts or bash inside WSL |

---

## 10. Monitoring — know when sync breaks

Add a Windows Task Scheduler job that runs every 15 min and alerts if:
- Last successful sync > 30 min ago
- Nightly backup file for today is missing after 03:00

Check the sync status:
```bash
curl http://localhost:4000/api/sync/status
# {"lastSync":"...","lastSyncStatus":"COMPLETED","isOnline":true,"autoSyncEnabled":true}
```

Send alerts via email or SMS gateway. Anything that pages a human.

---

## 11. Known limitations (documented for v2)

The three critical bugs fixed in commit `1e1f0b4` are the minimum for sync to be safe. These remain and should be addressed after initial deployment:

1. **Multi-field conflicts**: `detectConflict` handles only the first conflicting field per record.
2. **Per-table sync watermarks**: A crash mid-sync loses records after the crash point.
3. **Manual conflict resolution**: `storeForManualResolution` only logs — no UI, no DB persistence.
4. **File sync outside DB**: Handled by Syncthing here, not by the sync module itself.
5. **Sync route auth**: See §0.2 above — must be added before public deployment.
6. **Client/server route mismatch**: See §0.1 above — must be fixed before sync works at all.

---

## 12. Rollout checklist

- [ ] §0 blockers fixed
- [ ] VPS `.env` updated with `SERVER_ID=vps`, `SYNC_API_KEY`
- [ ] VPS `sms-backend` restarted, `/api/sync/health` returns `server_id=vps`
- [ ] On-prem Windows box provisioned (Docker Desktop, static IP, UPS)
- [ ] DB dump + uploads copied to on-prem
- [ ] On-prem `.env` set (matching JWT, matching SYNC_API_KEY, unique SERVER_ID)
- [ ] On-prem stack up, `curl /api/v1/health` passes
- [ ] Migrations applied on on-prem
- [ ] Round-trip sync test with a throwaway student passes
- [ ] Auto-sync enabled
- [ ] Syncthing paired for `uploads/`
- [ ] Split-horizon DNS active — staff laptop resolves `ssiccmr.com` to on-prem IP
- [ ] SSL cert on on-prem, browsers show green padlock
- [ ] Nightly backup Task Scheduler job created and tested
- [ ] Weekly USB rotation labeled
- [ ] Monitoring alert configured

---

## Reference: environment variable matrix

| Variable | VPS value | On-prem value | Notes |
|---|---|---|---|
| `NODE_ENV` | `production` | `production` | |
| `DATABASE_URL_PRODUCTION` | (VPS DB) | (local DB) | Must differ |
| `JWT_SECRET` | (existing) | **same as VPS** | Tokens must be interchangeable |
| `SYNC_API_KEY` | (generated in §3.1) | **same as VPS** | |
| `SERVER_ID` | `vps` | `school-onprem` | Must differ — powers echo-loop filter |
| `SERVER_TYPE` | `remote` | `local` | Informational only |
| `REMOTE_SYNC_URL` | (unset or peer's URL) | `https://ssiccmr.com/api/sync` | |
