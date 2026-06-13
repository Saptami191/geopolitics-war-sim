# ██████╗  ██████╗  ██╗   ██╗ ███████╗ ██████╗  ███████╗ ██╗  ██████╗  ███╗   ██╗
# ██╔════╝ ██╔═══██╗ ██║   ██║ ██╔════╝ ██╔══██╗ ██╔════╝ ██║ ██╔═══██╗ ████╗  ██║
# ███████╗ ██║   ██║ ██║   ██║ █████╗   ██████╔╝ █████╗   ██║ ██║   ██║ ██╔██╗ ██║
# ╚════██║ ██║   ██║ ╚██╗ ██╔╝ ██╔══╝   ██╔══██╗ ██╔══╝   ██║ ██║   ██║ ██║╚██╗██║
# ███████║ ╚██████╔╝  ╚████╔╝  ███████╗ ██║  ██║ ███████╗ ██║ ╚██████╔╝ ██║ ╚████║
# ╚══════╝  ╚═════╝    ╚═══╝   ╚══════╝ ╚═╝  ╚═╝ ╚══════╝ ╚═╝  ╚═════╝  ╚═╝  ╚═══╝
# 
#  ██████╗  ██████╗  ███╗   ███╗ ███╗   ███╗  █████╗  ███╗   ██╗ ██████╗  
# ██╔════╝ ██╔═══██╗ ████╗ ████║ ████╗ ████║ ██╔══██╗ ████╗  ██║ ██╔══██╗ 
# ██║      ██║   ██║ ██╔████╔██║ ██╔████╔██║ ███████║ ██╔██╗ ██║ ██║  ██║ 
# ██║      ██║   ██║ ██║╚██╔╝██║ ██║╚██╔╝██║ ██╔══██║ ██║╚██╗██║ ██║  ██║ 
# ╚██████╗ ╚██████╔╝ ██║ ╚═╝ ██║ ██║ ╚═╝ ██║ ██║  ██║ ██║ ╚████║ ██████╔╝ 
#  ╚═════╝  ╚═════╝  ╚═╝     ╚═╝ ╚═╝     ╚═╝ ╚═╝  ╚═╝ ╚═╝  ╚═══╝ ╚═════╝  
#
#                         SOVEREIGN COMMAND SIMULATOR v6.0
#                DEFENSE-GRADE MULTI-AGENT GEOPOLITICAL WAR MACHINE
#                    HIGH-PERFORMANCE CLIENT-SIDE SIMULATION UNIT

<div align="center">

> **`> CLASSIFIED DIRECTIVE: COSMIC TOP SECRET // LEVEL-5 CLEARANCE REQUIRED`**  
> *Warning: Attempting to access simulated nuclear launch control without double-key authorization will trigger automatic cyber grid lockouts.*

[![Tactical Console](https://img.shields.io/badge/🛰️_TACTICAL_CONSOLE-ACTIVE_ONLINE-00ff66?style=for-the-badge&labelColor=060b09&color=00ff66)](https://geopolitics-war-sim.pages.dev/)
[![Defcon Threat](https://img.shields.io/badge/HEURISTIC_DEFCON-ALERT_LEVEL_1_TO_5-ff1549?style=for-the-badge&labelColor=060b09)](https://geopolitics-war-sim.pages.dev/)
[![Simulated Sovereigns](https://img.shields.io/badge/GEO_AGENTS-50+_ACTIVE_NATIONS-00e1ff?style=for-the-badge&labelColor=060b09)](https://geopolitics-war-sim.pages.dev/)
[![Synthesized Audio](https://img.shields.io/badge/AUDIO_CORE-100%25_DSP_SYNTH-eec152?style=for-the-badge&labelColor=060b09)](https://geopolitics-war-sim.pages.dev/)

</div>

---

## ◈ 1. ARCHITECTURAL MAP

Sovereign Command Simulator (SCS) compiles a massive system of differential state machines, visual drawing loops, and DSP audio pipelines down to a unified, reactive front-end engine. 

```
                   ┌────────────────────────────────────────────────────────┐
                   │             COMMAND VIEWPORT & HUD LAYER                │
                   │    - 3D WebGL Orbital Earth Dome (Three.js Shaders)    │
                   │    - 2D Analytical Projection Map (Precisely Styled)  │
                   │    - Cyber, Drone, Thermal, Radar Workstations         │
                   └──────────────────────────┬─────────────────────────────┘
                                              │
             ┌────────────────────────────────┴─────────────────────────────┐
             ▼                                                              ▼
┌─────────────────────────┐                                    ┌─────────────────────────┐
│     ZUSTAND ACTIONS     │                                    │  ZUSTAND BALANCED STATE │
│  Expose command APIs    │                                    │  Global atomic stores:  │
│  Trigger launch keys    │◄──────────────────────────────────►│  - worldStore.ts        │
│  Update cyber configs   │                                    │  - militaryStore.ts     │
│  Execute spot trades    │                                    │  - consequencesStore.ts │
└─────────────────────────┘                                    └─────────────────────────┘
             │                                                              ▲
             │                                                              │ (Updates variables)
             ▼                                                              │
┌─────────────────────────┐                                    ┌─────────────────────────┐
│   TACTICAL COMMANDS     │                                    │  17 CORE SIM ENGINE SMT │
│  Direct terminal hook   │                                    │  - aiDecisionEngine.ts  │
│  - /strike <CO> <WP>    │                                    │  - fiscalEngine.ts      │
│  - /print <强度>        │───────────────────────────────────►│  - commodityEngine.ts   │
│  - /haarp <CO> <LVL>    │                                    │  - defconEngine.ts      │
└─────────────────────────┘                                    │  - consequenceEngine.ts │
                                                               └─────────────────────────┘
                                                                            │
                                                                            ▼
                                                               ┌─────────────────────────┐
                                                               │  DSP OSCILLATOR CORE    │
                                                               │  Web Audio Hook:        │
                                                               │  - Real-time sweeps     │
                                                               │  - Detuned noise buzz  │
                                                               └─────────────────────────┘
```

---

## ◈ 2. SYSTEM ARCHITECTURE & 17 STATE SIMULATORS

The engine performs deterministic numerical state integration every **Tick**. State integration is divided across **17 distinct simulation pipelines** that compute geopolitical, socio-economic, and thermodynamic interactions:

### 1. `aiDecisionEngine.ts` (Dynamic Actor Strategists)
Implements utility-maximizing heuristic engines for every non-player nation. Heuristics evaluate immediate survival, military strength index, trade dependencies, and ideological hostility to execute strategic defense/offense maneuvers.

### 2. `commodityEngine.ts` (Sovereign Spot Exchange & Resource Flows)
Monitors four primary resource domains: **Gold, Oil, Silicon, and Rare Earth Minerals**. Spot rates fluctuate based on transport canal freedom, physical reserve pools, and consumer demands with dynamic price discovery formulas.

### 3. `consequenceEngine.ts` (Sovereign Degradation & Fallout Modeling)
Calculates and decays irreversible battlefield damage coordinates. Upon a nuclear weapon detonation, it records a `WorldScar` with lat/lon boundaries, injecting active degradation and permanent GDP deductions into adjacent population registries.

### 4. `defconEngine.ts` (Heuristic Security Level Estimator)
Dynamically assigns global security status ($DEFCON_{level} \in [1, 2, 3, 4, 5]$) by evaluating active war theatres, weapon payloads currently in transit, cyber security threats, civil unrest, and central bank defaults.

### 5. `diplomaticEngine.ts` (Multilateral Relationship Vector Mapping)
Tracks deep matrix of $C_{M \times N}$ bilateral relations. Diplomatic variables dynamically converge or polarize based on embargoes, armed incidents, joint security agreements, and active covert operations.

### 6. `factionEngine.ts` (Internal Sovereign Stability State Machine)
Simulates domestic cabinet compositions, regime change profiles, and substate insurgents. If civil discontent breaches critical thresholds, the engine triggers coup vectors, replacing elected cabinets with militarized hardliner groups.

### 7. `fiscalEngine.ts` (Macroeconomic Ledger Synchronizer)
Processes tax income, tariff adjustments, bond markets, and public spending profiles. Simulates live sovereign bond yields shifting dynamically based on international security factors and structural debt-to-GDP indices.

### 8. `fogOfWarEngine.ts` (Asymmetric Intelligence Visibility Filter)
Computes physical radar/visibility thresholds using naval bases, SIGINT satellite arrays, and active military systems. Prevents players from evaluating complete asset structures of hostile regimes unless scouts are directed.

### 9. `geopoliticalEngine.ts` (Territorial Boundaries & Sovereignty Ledger)
Resolves border adjustments, territorial claims, and demographic movements. Calculates migration streams and refugee pressure models on borders surrounding active military zones.

### 10. `militaryEngine.ts` (Kinetic Battle Vectors & Ballistic Tracking)
Updates coordinates, velocities, payloads, and trajectories of all active intercontinental, theatre-level, and cruise weapons in mid-air. Monitors logistics lines, fuel reserves, and air coverage grids.

### 11. `propagandaEngine.ts` (National Narrative & Ideology Converger)
Calculates institutional control on public opinion using global and regional narrative streams. Tracks information combat arrays, counter-propaganda strength, and citizen loyalty vectors.

### 12. `scenarioEngine.ts` (Mission Directive Validator)
Loads specialized conflict, trade, or resources scenarios. Tracks progress indicators and evaluates victory/failure parameters (e.g., casualties, bond failures, territorial loss) upon reaching mission horizons.

### 13. `tickEngine.ts` (Continuous Time-Loop Orchestrator)
Orchestrates continuous temporal updates. Sets precision timers, collects exceptions, handles speed state changes ($\text{Tick}_{\Delta t} \in [0.1s, 0.5s, 2s]$), and routes ticking data blocks directly to Zustand caches.

### 14. `spaceEngine.ts` (Low-Earth Orbit Asset tracker)
Simulates active orbits of modern satellites (`RECON`, `ABM-SHIELD`, `SIGINT`). Calculates field-of-view sweeps, orbital decay, and anti-satellite missile launch window intersections.

### 15. `cyberEngine.ts` (Asymmetric Core Packet Networks)
Tracks signal jamming, network firewalls, and active operations. Computes infrastructure decay, server hacks, and database intrusions that degrade enemy command-and-control subsystems.

### 16. `weatherEngine.ts` (Atmospheric Perturbations & HAARP Vectors)
Integrates regional climate profiles, storm paths, and artificial climatic anomalies. Storm paths directly affect drone visibility, maritime shipping lane throughput, and satellite tracking accuracy.

### 17. `blackmarketEngine.ts` (Illegal Technology & Arsenal Bazaar)
Maintains anonymous networks for trading prohibited technology, fuel pipelines, and biological weaponry. Price indices scale proportionally to regional embargo intensities and global oversight levels.

---

## ◈ 3. THE MATHEMATICS OF SOVEREIGN DEFENSE

The simulator runs on precise thermodynamic, macro-financial, and geometric theories. Below are the underlying mathematical formulas evaluated by the simulation core:

### A. Dynamic Air-Defense ABM Intercept Probability ($P_{intercept}$)

$$P_{intercept}(t) = \max\left(0, \ \eta_{tech} \times \left(1 - \frac{V_{target}}{V_{limit}}\right)^{2} \times \mathbf{\Psi}_{EW} \times \mathbf{\Omega}_{thermal}\right)$$

Where:
* **$\eta_{tech}$**: Baseline technology intercept multiplier ($\text{Tier 1} = 0.40$, $\text{Tier 2} = 0.72$, $\text{Tier 3 Space Dome} = 0.98$).
* **$V_{target}$**: Current velocity of the projectile (ranging from Mach 1.5 to Mach 18.0 for orbital gliders).
* **$\mathbf{\Psi}_{EW} \in (0, 1]$**: Electronic Warfare jamming factor. Represented by the cyber firewall clearance ratio:
  $$\mathbf{\Psi}_{EW} = e^{-\lambda \left(\Lambda_{jam} - \Omega_{firewall}\right)}$$
* **$\mathbf{\Omega}_{thermal} \in [0.1, 1.2]$**: Atmospheric thermal visibility index calculated over the target coordinate grid.

---

### B. Currency FX Exchange Decay & Inflation Velocity ($\Phi_{FX}$)

Sovereign currency exchange values fluctuate according to the money-printing velocity and hard physical reserve assets backing paper liabilities:

$$\Phi_{FX}(t) = \Phi_{FX}(t-1) \times \left(1 - \theta \cdot I_{print} \right) + \kappa \cdot \left[\frac{R_{gold} + \gamma \cdot R_{uranium}}{L_{bonds} \cdot \left(1 + \pi_{inflation}\right)}\right]$$

Where:
* **$I_{print}$**: Active monetary print volume injected by the central vault state.
* **$R_{gold}, R_{uranium}$**: Liquid commodity holdings in sovereign vaults.
* **$L_{bonds}$**: Aggregate market value of issued sovereign bonds held by foreign actors.
* **$\theta, \kappa, \gamma$**: Decelerating feedback constants calibrated dynamically against DEFCON levels.

---

### C. Popular Civil Discontent & Cabinet Overthrow Threshold ($D_{civil}$)

Unrest builds up dynamically inside the national ledger system by integrating six performance-index decays:

$$D_{civil}(t) = \int_{0}^{t} \left( \alpha \cdot \mathbf{\Pi}_{inflation} + \beta \cdot \mathbf{T}_{income} + \gamma \cdot \mathbf{M}_{casualties} - \delta \cdot \mathbf{\Phi}_{propaganda} - \epsilon \cdot \mathbf{U}_{employment} \right) dt$$

Where:
* **$\mathbf{\Pi}_{inflation}$**: Instantaneous price index inflation.
* **$\mathbf{T}_{income}$**: Aggressive tax rate on commercial margins.
* **$\mathbf{M}_{casualties}$**: Physical soldier and civilian deaths registered in the national registry database.
* **$\mathbf{\Phi}_{propaganda}$**: Active information management campaign output.
* **$\mathbf{U}_{employment}$**: Production grid unemployment rate.

*If $D_{civil}(t) > 0.85$, the engine triggers a regime change state, converting democratic cabinets into active military juntas or radical tribal divisions.*

---

## ◈ 4. MASTER SYSTEMS CODE DIRECTORY

```
.
├── src/
│   ├── App.tsx                   # Main layout coordinator; mounts 2D Map, 3D Globe, and overlay panels.
│   ├── main.tsx                  # Global bootstrapper and StrictMode application runner.
│   ├── index.css                 # Vector theme parameters, modern display typography, glow configurations.
│   ├── types.ts                  # Pure TypeScript domain models, enums (DEFCON, weapon catalogs, bond logs).
│   ├── constants.ts              # Mathematical constants, coordinate nodes, missile ranges, fuel requirements.
│   │
│   ├── components/
│   │   ├── css/                  # Custom overlay frames and technical scanlines.
│   │   │
│   │   ├── map/                  # High-performance geographic renderers.
│   │   │   ├── GeoMap.tsx        # High-density SVG flat map rendering with TopoJSON resolutions.
│   │   │   ├── InGameGlobe.tsx   # Three.js 3D globe viewer with daytime textures and day/night transitions.
│   │   │   ├── WorldMap.tsx      # Vector canvas coordinate tracking.
│   │   │   └── MapModeToggle.tsx # Layer switching (political, tactical, economic).
│   │   │
│   │   ├── telemetry/            # Tactical workstation units.
│   │   │   ├── ThermalRecon.tsx  # Dynamic thermal vector scanners.
│   │   │   ├── DroneFeed.tsx     # Simulated atmospheric scout terminals.
│   │   │   ├── CyberFeed.tsx     # Hex-grid attack status trackers.
│   │   │   └── HaarpRadar.tsx    # Magnetic radar signals analyzer.
│   │   │
│   │   ├── panels/               # Command-and-control dashboard widgets.
│   │   │   ├── GovernmentPanel.tsx   # Fiscal tax controls, bill settings, debt bonds.
│   │   │   ├── CentralBankPanel.tsx  # Interest rate modifications, print registers, reserves.
│   │   │   ├── ArsenalPanel.tsx      # Dynamic launch authorizations, key checks, arsenal lists.
│   │   │   ├── IntelPanel.tsx        # Infiltration directives, cyber packet networks.
│   │   │   └── SpacePanel.tsx        # Anti-satellite targeting interfaces.
│   │   │
│   │   ├── shared/               # Interactive utility units.
│   │   │   ├── TerminalShell.tsx # Interactive text command terminal input system.
│   │   │   ├── AlertBanner.tsx   # Urgent alerts notifier.
│   │   │   └── DataTicker.tsx    # Dynamic data ticker for news alerts.
│   │   │
│   │   └── intro/                # Cinematic setup screens.
│   │       ├── CinematicIntro.tsx    # Opening briefings, audio check, scanline sequences.
│   │       └── GameLobby.tsx         # Multi-scenario briefing selector.
│   │
│   ├── sim/                      # Core ticking mechanical simulation engines (see section 2).
│   ├── store/                    # Atomic Zustand states synchronizing modules (see section 5).
│   └── utils/                    # Math and DSP synthesizers (see section 6).
```

---

## ◈ 5. ZUSTAND GLOBAL STATE SYSTEMS

SCS relies on a modular state engine using optimized, non-overlapping atomic Zustand stores to prevent rendering lags:

| Store Name | Primary Core Responsibility | Relevant Data Variables Tracked |
| :--- | :--- | :--- |
| **`worldStore.ts`** | Core sovereign state database | Country profile array, alliances, resources, global stability |
| **`militaryStore.ts`** | Kinetic trajectory registers | Mid-air missiles, intercept systems, targeting vectors |
| **`defconStore.ts`** | Global threat state coordinator | DEFCON threat status (1-5), matching threat palette gradients |
| **`economyStore.ts`** | Global spot trade indexer | Commodities prices, reserve volumes, supply line statuses |
| **`intelligenceStore.ts`**| Black operation records | Infiltration units, counter-intelligence, hack progress |
| **`consequenceStore.ts`** | Irreversible scars indexer | Fallout regions, GDP detraction variables, scar markers |
| **`commsStore.ts`** | Live global news and communications logs | Text updates, alert structures, system briefings |

---

## ◈ 6. HIGH-FIDELITY AUDIO CORE (PURE DSP SYNTHESIZER)

SCS hosts a professional Web Audio API Synthesizer with zero-latency audio assets (no external `.mp3` or `.wav` network loads). Audio signals are computed on-the-fly directly inside the browser's Web Audio core:

* **Detuned Alert Drone**: Low frequency dual-sawtooth waves ($f_1 = 55\text{Hz}$, $f_2 = 55.4\text{Hz}$) modulated by an LFO, morphing into a harsh siren array during a DEFCON-1 transition.
* **Tactical Radar Sweep**: Modulates a bandpass filter sweep centered on a white noise source, synchronized to dynamic sweep loops.
* **Ballistic Fire Booster**: Low frequency noise output shaped by dynamic gain nodes with exponential falloffs, simulating booster combustion:
  $$g(t) = G_{max} \times e^{-\lambda t}$$
* **Electronic Cyber Click**: High frequency square wave pulses ($f = 880\text{Hz}$, duration $20\text{ms}$) with snappy exponential velocity decays.

---

## ◈ 7. EXTREMELY IN-DEPTH COMMAND TERMINAL DICTIONARY

Use the dynamic terminal shell component `/src/components/shared/TerminalShell.tsx` to directly interact with variables inside the running core:

```
>_ TYPE A COMMAND TO INITIATE PROTOCOLS
```

### Kinetic Weapons Deployment: `/strike`
```bash
/strike [NATION_ID] [WEAPON_TYPE] [TARGET_LAT] [TARGET_LON]
```
* **Description**: Deploy a missile launcher from your dynamic inventory towards a target coordinate on the globe.
* **Constraints**: Requires matching fuel capacities, ammunition reserves, and active satellite coordinates.
* **Arguments**:
  * `NATION_ID` (ISO-2 Code): e.g., `US`, `RU`, `CN`, `IN`.
  * `WEAPON_TYPE`: `ICBM`, `SLBM`, `HYPERSONIC`, `TACTICAL_NUKE`.

---

### Central Bank Vault Printing: `/print`
```bash
/print [INTENSITY_COEF]
```
* **Description**: Print sovereign bank notes instantly to inject reserves into your national treasury.
* **Side Effects**: Accelerates domestic inflation index ($I_{inflation}$), triggers currency conversion decay ($\Phi_{FX}$), and increases public discontent.

---

### Space-Grid ASAT System: `/sat`
```bash
/sat [target_id] [ACTION]
```
* **Description**: Deploy an Anti-Satellite interception payload to take down target recon or SIGINT assets.
* **Arguments**:
  * `target_id`: Satellite ID registry.
  * `ACTION`: `ACTIVATE_ASAT`, `SIGINT_BLOCK`.

---

### Weather Modification System: `/haarp`
```bash
/haarp [NATION_ID] [STRENGTH_FACTOR]
```
* **Description**: Trigger massive atmospheric anomalies over target country networks.
* **Side Effects**: Disrupts agricultural exports, degrades local radar defenses, and limits drone tracking.

---

## ◈ 8. OPERATION STRATEGIST MANIFEST (ELITE PLAYBOOK)

Navigate complex global interactions using advanced strategies:

### A. The Hyperinflation Sovereign Debt Loop
```
[MONETARY PRINTING] ──► [CURRENCY DEVALUATION] ──► [BOND YIELDS SPIKE] ──► [TREASURY DEFAULT]
        ▲                                                                        │
        │────────────────────────────────────────────────────────────────────────┘
```
1. Print massive currency reserves to temporarily fund advanced military developments.
2. Short your own sovereign exchange rate before inflation values spike.
3. Repurchase your national treasury bonds from foreign holders on the market at fraction values when sovereign stability scores collapse.

---

### B. The Blind Strike Protocol (Silent Decapitation)
```
[CYBER HACK WORKSPACE] ────► [LAUNCH ORBITAL ASAT] ────► [HYPERSONIC MISSILE SALVO]
 (Disables early radar)       (Destroys SIGINT Sat)      (Silos destroyed prior to launch)
```
1. Perform dynamic cyber network intrusion (`/op HACK_GRID`) on targeted early-warning radar arrays.
2. Fire low-orbit ASAT missiles to destroy target SIGINT satellites within active orbital paths.
3. Fire hypersonic gliders on designated coordinates to disable opposing ICBM rocket silos before defense launch protocols can cycle.

---

## ◈ 9. LOCAL INFRASTRUCTURE & DEVELOPMENT

Setup and run the complete application sandbox on local systems:

### Engine Version Boundaries:
* **Node.js**: `v18.0.0` to `v22.22.0` (Native ESModules architecture compliant)
* **npm**: `v9.0.0` to `v10.9.2`

### Standard Setup Script:
```bash
# 1. Clone deep-defense secure repository
git clone https://github.com/nikcygnusx1/geopolitics-war-sim.git
cd geopolitics-war-sim

# 2. Deploy native dependency packages
npm install

# 3. Trigger localized dynamic watch server
npm run dev

# 4. Compile high-performance static assembly
npm run build

# 5. Local preview of completed production bundle
npm run preview
```

---

## ◈ 10. METRIC SYSTEMS CONFIGURATION

```json
{
  "name": "Sovereign Command Simulator",
  "private": true,
  "version": "6.0.0",
  "license": "MIT",
  "status": "SECURED"
}
```

---

<div align="center">

```
========================================================================
                      [ COLD HARBOR WAR CABINET SIMULATOR ]             
                      [ END OF TRANSMISSION // BYE BYE ]               
========================================================================
```

*This simulator is a highly polished interactive strategic entertainment system. Manage assets wisely.*

</div>
