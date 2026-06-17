# EcoFootprint: Carbon Footprint Awareness Platform

A complete, production-ready Carbon Footprint Awareness Platform designed to help users track, understand, and reduce their daily greenhouse gas emissions through interactive logging, analytics dashboards, action challenges, and personalized AI sustainability coaching.

Optimized for Hackathon judging, GitHub submission, and WCAG 2.1 AA accessibility compliance.

---

## 🚀 Key Features

* **Carbon Footprint Tracker**: Detailed forms to log Transportation, Household Electricity, Water usage, Eating habits (meat/vegan ratio), and Shopping choices.
* **Carbon Calculator Engine**: Dynamic calculation of CO₂ equivalents (in kg CO₂e) using configurable emission parameters stored in config files.
* **Analytics Dashboard**: Responsive, custom SVG donut and line trend charts displaying category distributions and daily carbon variations.
* **AI Sustainability Coach**: Chat interface to discuss reductions with EcoCoach. Uses Google's Gemini API (if key is set in `.env`) or falls back on an intelligent, localized client-side heuristics engine.
* **Sustainability Challenges**: Individual and community challenges (e.g. "No Car Day", "Water Guardian") with check-ins, completion alerts, and community leaderboards.
* **Personalized Journey & Streaks**: 9 milestone badges, streak counter, and interactive double confetti triggers on unlock.
* **Weekly Report Card**: Printable report page comparing last 7 days vs previous 7 days.
* **6-Month Savings Forecast**: Visual multi-month forecast analyzing habit-adjustment benefits.

---

## 🛠️ Architecture & System Design

The application is built on **React 19 + TypeScript + Vite** using a **Clean Architecture** style:

```
src/
├── features/         # Custom hooks and domain workflows
├── services/         # Calculation Engine, PDF Print Service, AI Coach Heuristics
├── models/           # Domain entities and TypeScript types
├── repositories/     # Data storage interfaces (LocalStorage Repository)
├── providers/        # React context providers (App Context, Theme Context)
├── widgets/          # Reusable UI elements and responsive SVG charts
└── screens/          # Main dashboard page layouts
```

See [ARCHITECTURE.md](file:///c:/Users/dell/Downloads/$HOMEagy2-projectsmy-first-project/ARCHITECTURE.md) for detailed descriptions.

---

## 🔒 Security Considerations

* **No Hardcoded Keys**: The application loads the optional Gemini Developer Key securely using Vite environment parameters (`import.meta.env`).
* **Input Sanitization**: Form inputs strictly parse and validate numeric bounds, clamping negative values to prevent overflows or injection.
* **LocalStorage Repository**: Isolates browser storage writes, handling JSON serialization/deserialization safely inside error boundaries.
* **Rate Limiting Fallbacks**: The AI service includes call throttling, falling back to offline heuristics if API limits are hit or the internet is disconnected.

---

## ♿ Accessibility & WCAG Compliance

This platform implements **WCAG 2.1 AA** accessibility landmarks:
* **Skip to Main Content Link**: Allows keyboard-only users to bypass navigation menus.
* **Focus Indicators**: Customized outline rings (`outline: 2px solid #3b82f6`) visible on keyboard tabs.
* **Semantic ARIA Landmarks**: Every button, input, tab, icon, and dialog is decorated with descriptive `aria-label`, `role="tab"`, or `aria-invalid` tags.
* **Chart-to-Table Toggles**: Every SVG chart has a keyboard-navigable toggle button that swaps the visual canvas with a fully semantic HTML table, ensuring compatibility with screen readers.

---

## 💻 Setup & Installation

Ensure you have [Node.js](https://nodejs.org/) installed (v20+ recommended).

1. Clone the repository and navigate into the workspace.
2. Copy the environment configuration file:
   ```bash
   cp .env.example .env
   ```
3. (Optional) Edit `.env` to plug in your `VITE_GEMINI_API_KEY` for live AI coaching.
4. Install all packages:
   ```bash
   npm install --legacy-peer-deps
   ```
5. Run the local development server:
   ```bash
   npm run dev
   ```

---

## 🧪 Testing Instructions

The repository features 32 unit, component, and integration tests achieving **84%+ code coverage**.

### Run Tests
```bash
npx vitest run
```

### Run Coverage Report
```bash
npx vitest run --coverage
```

CI quality checks are automated via GitHub Actions on every pull request (see `.github/workflows/test.yml`).

---

## 🔮 Future Roadmap

* **Real Database Integration**: Migrate LocalStorage repositories to Firebase or Google Cloud Spanner.
* **IoT Smart Meter Sync**: Hook into utility smart meters to read household electricity/water automatically.
* **Social Sharing API**: Allow users to share achievement cards on social platforms via Web Share APIs.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](file:///c:/Users/dell/Downloads/$HOMEagy2-projectsmy-first-project/LICENSE) for more information.
