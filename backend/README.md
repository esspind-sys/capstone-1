# Backend

Backend server for the Spoonful application: Node/Express + MongoDB, containerized with Docker.

## Commands

### Running the Backend

Build the images and start the containers in detached mode:

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

**When to use:** First-time startup, or after any change to the Dockerfile or backend code (including changes to `routes/ai.js` for the AI feature).

### Stopping the Backend

```bash
docker compose -f docker-compose.dev.yml down
```

**When to use:** To stop and remove the running containers. (Because the backend runs detached with `-d`, Ctrl + C will not stop it — use `down`.)

### Viewing Logs

API service:

```bash
docker compose -f docker-compose.dev.yml logs -f api
```

Database service:

```bash
docker compose -f docker-compose.dev.yml logs -f mongo
```

**When to use:** To debug or monitor the backend — including checking the AI endpoint's error logs if a Gemini request fails or times out. The `-f` flag follows the output live (Ctrl + C stops following; it does not stop the container).

### Testing the AI Endpoint Directly

The AI feature is a streaming (SSE) proxy to Gemini, mounted at `POST /api/ai`. It expects a JSON body with a `prompt`. Use `-N` so curl prints the stream as it arrives:

```bash
curl -N -X POST http://localhost:3000/api/ai \
  -H "Content-Type: application/json" \
  -d '{"prompt": "give me a quick vegetarian pasta recipe"}'
```

**When to use:** Any time you change `routes/ai.js` or suspect the AI feature is broken — debugging one curl call is far faster than a full React round-trip. A missing `prompt` returns `400`; an upstream timeout returns an SSE `error` event (or `504` before streaming starts).

### Pruning Images and Containers

```bash
docker image prune -f       # remove orphaned <none> images left by rebuilds
docker container prune       # remove stopped containers
```

**When to use:** After rebuilds, to reclaim disk space. Each `up --build` leaves the previous image orphaned; `image prune -f` is safe and never removes an image a running container is using.

## Reliability notes

The AI proxy (`routes/ai.js`) is hardened against two real failure modes:

- **Upstream timeout** — the Gemini call is aborted after 45s (well under Cloudflare's ~100s edge timeout), returning a clean error instead of hanging.
- **Client disconnect** — if the browser aborts mid-stream, the upstream request is cancelled (listening on the *response* close event, so a normal request is never mistaken for a disconnect).

## Deployment

**Frontend:** React (Vite) static build deployed to AWS S3.
- Bucket: `recipe-app-capstone-4821`
- Build & deploy: `npm run build && aws s3 sync dist/ s3://recipe-app-capstone-4821 --delete`
- Backend URL is injected at build time via `client/.env.production` (`VITE_BACKEND_URL`).

**Backend:** Node/Express + MongoDB in Docker on AWS EC2.
- Start: `docker compose -f docker-compose.dev.yml up -d`

### Why a Cloudflare tunnel

The backend listens on plain HTTP on port 3000. Reaching it directly (`http://<ec2-ip>:3000`) works on some networks but is blocked by others — corporate proxies and VPNs commonly block browser requests to a raw IP on a non-standard port. (Confirmed: reachable on office wifi, blocked over a home VPN; `curl` succeeded on both, but browser requests were reset.)

To make the backend reachable over HTTPS from any network, it is exposed via a Cloudflare quick tunnel, run in the background on the EC2 instance:

```bash
nohup ./cloudflared tunnel --url http://localhost:3000 > ~/tunnel.log 2>&1 &
grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' ~/tunnel.log   # read the URL
```

The frontend points at the tunnel URL via `client/.env.production`:

```bash
VITE_BACKEND_URL=https://ada-protocol-invention-office.trycloudflare.com
```

**Note:** quick-tunnel URLs are temporary and change whenever `cloudflared` restarts. When the URL changes, update `.env.production` and redeploy the frontend.

See the root [README.md](../README.md) → **Step 5: Deploy to S3** for the full deployment pipeline.