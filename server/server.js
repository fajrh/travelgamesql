{
  "name": "travel-game",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "gcp-build": "npm run build",
    "build": "vite build",
    "start": "node server/server.js",
    "dev": "node server/server.js",
    "preview": "vite preview"
  },
  "dependencies": {
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "mysql2": "^3.10.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.12.12",
    "@vitejs/plugin-react": "^4.3.2",
    "vite": "^5.4.10"
  },
  "engines": {
    "node": ">=20.x"
  }
}
