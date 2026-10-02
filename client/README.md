# Client

Client-side code for the Spoonful application: React + TypeScript (Vite).

## Commands

### Running the Development Server

Build the image and start the dev container:

```bash
docker compose up --build
```

If node modules don't update after installing a package, rebuild without cache:

```bash
docker compose up --build --force-recreate
```

List running containers:

```bash
sudo docker ps -a
```

Remove a container (ID from the command above, e.g. `2781e82e591f`):

```bash
sudo docker rm <container_id>
```

Remove all stopped containers:

```bash
sudo docker container prune
```

### Running Tests

```bash
docker compose run --rm react-dev npm run test
```

**When to use:** To run the unit/integration tests (Vitest + React Testing Library). The `--rm` flag removes the container after the run.

### Building for Production

```bash
docker compose run --rm react-dev npm run build
```

**When to use:** Before deploying — this is also what the deploy script runs. Build artifacts land in `dist/`, which is what gets synced to S3. `dist/` is a build output and is gitignored (not committed). See the root [README.md](../README.md) → **Step 5: Deploy to S3** for the deployment pipeline.