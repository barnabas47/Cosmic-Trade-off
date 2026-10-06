# Task: Build Cosmic Trade-off — NASA Space Mission Design Game

- [x] Initialize Vite + React + TypeScript + Tailwind CSS in `nasa_game`
- [x] Connect Lego components from `src/components/ui/` (aurora hero, live AI inspector, bento grid, glass card, shimmer button)
- [x] Build Spacecraft Subsystems & Trade-off Physics Engine:
  - [x] Tsiolkovsky Delta-V calculation with stage dry/wet mass
  - [x] Power generation vs. inverse-square law distance ($1/r^2$) & instrument draw
  - [x] Launch vehicle cost & payload mass limit checks
- [x] Implement 3 Core Views:
  - [x] 1. Destination & Target Selection (Moon, Mars, Europa, Titan)
  - [x] 2. Spacecraft Blueprint Configurator with real-time gauges (Mass Margin, Power Balance, Budget Cap, Science Return)
  - [x] 3. Live Flight Director & Orbital Simulator with phase execution, anomaly decisions, and NASA Scorecard
- [x] Implement 1-Click Judge Scenarios ("Europa Ice Explorer", "Artemis Scout", "Mars Fast Transit", "Titan Voyager")
- [x] Wire Live AI Inspector telemetry with real equations and sub-system state logging
- [x] Verify production build (`npm run build` passed cleanly with 0 TypeScript/bundling errors)
