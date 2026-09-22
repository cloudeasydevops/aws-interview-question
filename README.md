# AWS DevOps Interview Questions — Topic-wise (React + Vite)

A modern, responsive **static website** built with the latest **React + Vite** that
presents your AWS DevOps interview questions organised **topic-wise**.

## ✨ Features

- Sticky sidebar navigation across all **27 topics** (with per-topic question counts).
- Clean card-based rendering of each question.
- **Live search** across topics and questions (case/accent-insensitive).
- Fully responsive — sidebar collapses into an off-canvas menu on small screens.
- Dark, modern UI — no external CSS framework or icons required.

## 🗂 Project structure

```
.
├── index.html                 # Vite entry (static content served from root)
├── package.json
├── vite.config.js
├── tsconfig.json
├── AWS_DevOps_Interview_Questions_Topicwise.html   # source data (exported)
├── scripts/
│   └── extract_topics.py      # HTML -> src/data/topics.json converter
└── src/
    ├── main.tsx               # React entry point (mounts #root)
    ├── App.tsx                # UI components & logic
    ├── App.css                # Styles
    └── data/
        └── topics.json        # Generated topic-wise data (27 topics / 314 Qs)
```

## 🚀 Getting started

```bash
# 1. Install dependencies
npm install

# 2. (Re)generate data if the source HTML changed
npm run extract

# 3. Start the dev server (opens http://localhost:5173)
npm run dev
```

## 🏗 Production build (static hosting)

```bash
npm run build      # outputs to dist/
npm run preview    # serve the built site locally to verify
```

The build uses relative paths (`base: "./"`), so you can drop the
`dist/` folder onto any static host — GitHub Pages, S3, Netlify, Nginx, etc.

## 🧰 Commands

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `npm run dev`    | Start Vite dev server                |
| `npm run build`  | Build static site into `dist/`       |
| `npm run preview`| Preview the production build         |
| `npm run extract`| Regenerate `src/data/topics.json`    |
| `npm run typecheck` | Type-check with TypeScript        |