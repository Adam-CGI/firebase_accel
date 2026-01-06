# Firebase Accel (React + Vite)

This app uses Vite for development and Firebase Hosting for deployment. Local emulation is available for a production-like preview, and optional SDK wiring is included for Auth/Firestore/Storage.

## Quickstart

1) Install dependencies
```bash
npm install
```

2) Dev server (HMR)
```bash
npm run dev
```

3) Production-like preview (Firebase Hosting emulator)
```bash
npm run preview:hosting
```

4) Full emulator suite (Auth/Firestore/Storage/Hosting) + dev
```bash
npm run emulators:all
# in another terminal
npm run dev
```

For full local dev docs (env setup, emulator ports, and Firebase init), see [docs/local-dev.md](docs/local-dev.md).
