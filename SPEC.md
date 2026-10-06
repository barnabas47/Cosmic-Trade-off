# SPEC.md — Cosmic Trade-off: NASA Mission Planner & Flight Lab

## 1. Project Overview & Challenge Alignment
- **Challenge:** NASA International Space Apps Challenge — Space Mission Design Game
- **Problem:** Designing space missions involves complex, competing trade-offs (mass, budget, power, delta-V, science return, communications, launch vehicle limits) that are abstract for students and enthusiasts.
- **Solution:** **Cosmic Trade-off** is an interactive, browser-based space mission engineering laboratory and flight simulator. Students design a probe for targeted space destinations (Moon South Pole, Mars Jezero Crater, Jupiter's Europa, Titan), configure subsystems with real engineering physics, and execute live flight simulations with telemetry, real-time anomalies, and mission success scoring.

---

## 2. Grand Prize Winner Rules & Architecture
1. **Judge Demo Mode (Instant Gratification):**
   - 1-click preset scenarios:
     - 🚀 *Europa Ice Explorer* (High risk, nuclear RTG, extreme science)
     - 🌕 *Artemis South Pole Scout* (Balanced budget, solar array, lunar orbit)
     - 🪐 *Mars Fast Probe* (Budget-constrained, high delta-V crunch)
   - Zero empty state: Launches straight into active visualization with interactive telemetry and animated mission states.
2. **Visible Deep Tech (Live AI Inspector & Telemetry):**
   - Integrates the `live-ai-inspector` component showing real-time trade-off physics engine calculations:
     - Tsiolkovsky Rocket Equation ($\Delta v = I_{sp} \cdot g_0 \cdot \ln(m_0 / m_f)$)
     - Power balance & solar flux degradation by distance ($1/r^2$)
     - Thermal and link budget attenuation
     - Active simulation latency, tick rate, and engineering margins
3. **Stitch & 21st.dev Visual Standard:**
   - Obsidian dark UI (`#050508`), ambient cyan/violet liquid aurora glow, frosted glass cards, and crisp interactive control pills.

---

## 3. Core Gameplay & Simulation Loop
1. **Phase 1: Mission Target & Requirements**
   - Select Destination: Moon (Artemis Track), Mars (Perseverance Track), Europa (Jovian Track), Titan (Deep Atmosphere).
   - Objectives: Mapping, Atmospheric Sample, Ice Drilling, Long-range Relay.
   - Constraints: Budget cap ($M), Max Launch Mass (kg), Duration (years).
2. **Phase 2: Spacecraft Engineering Configurator (Trade-off Matrix)**
   - **Launch Vehicle:** SmallSat Rocket ($15M, 500kg LEO), Medium Heavy ($60M, 5,000kg), Super Heavy ($120M, 20,000kg).
   - **Power Subsystem:** Multi-junction Solar Arrays (lightweight, drops at Jupiter), RTG Nuclear Battery (heavy, expensive, infinite life).
   - **Propulsion:** Chemical Monopropellant (cheap, low Isp), Ion / Hall Effect Thrusters (efficient Isp, requires massive power).
   - **Communications:** S-band Low-Gain (light, low bitrate), Deep Space X/Ka-band Dish (heavy, high data rate).
   - **Scientific Instruments:** Multispectral Imager, Ground-Penetrating Radar, Magnetometer, Mass Spectrometer.
   - **Real-time Trade-off Feedback:** Mass Margin gauge, Power Budget balance, Cost bar, Scientific Value rating.
3. **Phase 3: Real-Time Flight Simulator & Mission Control**
   - 4 Flight Phases: Launch & Staging -> Trans-Planetary Cruise -> Orbital Insertion / Landing -> Science Operations.
   - Interactive events & anomalies: Solar flare, micrometeorite strike, communication blackout behind the planet.
   - Flight Director commands: Deploy panels, enter Safe Mode, fire correction burn, dump telemetry.
   - Final Mission Debrief & NASA Grade (A+ to C- with scientific discovery breakdown).

---

## 4. Technical Stack
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS + Lucide Icons + Glassmorphism tokens
- **Animations:** Framer Motion + HTML5 Canvas dynamic trajectory renderer
- **Vault Components Pulled:**
  - `stitch-aurora-hero`
  - `live-ai-inspector`
  - `bento-metric-grid`
  - `glass-card`
  - `shimmer-button`

---

## 5. Google Stitch Reference Prompt
```markdown
Design an ultra-minimalist, high-end obsidian dark (#050508) web application interface for Cosmic Trade-off: NASA Space Mission Design Game.
Visual Style:
- Continuous ambient liquid aurora mesh gradient (electric cyan, vivid violet, subtle deep blue glow) with a fine dot matrix overlay.
- Giant clean headline: "COSMIC TRADE-OFF", subtitle: "Interactive Space Mission Design & Real-Time Flight Simulator".
- Centerpiece: Bento Grid showing active Spacecraft Blueprints, Mass/Power/Delta-V gauges, Launch Vehicle selection, and 2D Keplerian Trajectory canvas.
- Quick Judge Scenarios: "Artemis Lunar Scout", "Europa Ice Explorer", "Mars Fast Transit".
- Bottom-right corner: Floating micro-telemetry pill ("Live AI Inspector & Physics Engine" with active pulse, Isp calculator, and latency ms indicator).
```

