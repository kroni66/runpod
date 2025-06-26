# Runpod Pod Manager Desktop

A cross-platform Electron desktop application for viewing and managing your [Runpod.io](https://runpod.io) pods with a native, modern UI.

## Features

- **View all pods**: List your Runpod pods with realtime status, uptime, GPU and port info.
- **Start/Stop pods**: Start or stop pods directly from your desktop.
- **API key secured**: Your API key is stored locally only.
- **Beautiful, modern UI**: Styled for a great desktop experience.
- **Cross-platform**: Works on Windows, macOS, and Linux.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start in development

**For Electron desktop app (recommended):**
```bash
npm run dev
```

This will launch the Vite dev server and Electron app together.

**For web development (limited functionality):**
```bash
npm run web
```

This will start only the web server. Note: Some features may be limited due to CORS restrictions when running in web mode.

### 3. Build a packaged app

```bash
npm run build
```

The installer will be output by `electron-builder`.

## Usage

1. [Get your Runpod API Key](https://runpod.io/console/user/settings) (must have "Pods" permission).
2. Enter it in the app when prompted.
3. Manage your pods!

## Project Structure

```
├── electron/             # Electron main & preload scripts
│   ├── main.ts
│   └── preload.ts
├── src/                  # React renderer process code
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── PodList.tsx
│   │   └── PodItem.tsx
│   └── utils/
│       └── runpodAPI.ts      # Shared API utilities
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Troubleshooting

### "Cannot read properties of undefined (reading 'listPods')" Error

This error occurs when the application is running in web mode instead of Electron mode. The `window.runpodAPI` object is only available when running as an Electron app.

**Solution:**
- Use `npm run dev` instead of `npm run web` for full functionality
- If you must use web mode, the app will automatically fall back to direct API calls, but may encounter CORS restrictions

### Electron Connection Refused Error

If you see `ERR_CONNECTION_REFUSED` when running the Electron app:

1. **Port mismatch**: Make sure Vite dev server is running on the correct port
2. **Windows users**: Use `npm run dev:win` instead of `npm run dev`
3. **Manual fix**: Set environment variable `VITE_DEV_SERVER_PORT=12000`

### Git Merge Conflicts

If you see errors like `Unexpected "<<"` during build:

1. Check for merge conflict markers in your files:
   ```bash
   git status
   grep -r "<<<<<<\|======\|>>>>>>" src/
   ```
2. Resolve conflicts manually or reset to latest:
   ```bash
   git fetch origin
   git reset --hard origin/main
   ```

### CORS Issues in Web Mode

When running in web mode (`npm run web`), you may see CORS-related errors because browsers block direct requests to external APIs.

**Solutions:**
1. **Recommended:** Use the Electron desktop app (`npm run dev`)
2. Use a CORS proxy service (not recommended for production)
3. Run the app from a server that handles CORS headers

## Security

- Your API key is stored only in [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) and not transmitted anywhere except directly to Runpod.io.
- The Electron preload bridge exposes only the minimum required API.

## License

MIT