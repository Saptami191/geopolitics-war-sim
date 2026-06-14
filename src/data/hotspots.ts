import { CountryHotspot, HotspotType } from '../types';

export const SEEDED_HOTSPOTS: CountryHotspot[] = [
  // --- United States (US) ---
  {
    id: 'us_cheyenne_mountain',
    countryId: 'US',
    name: 'Cheyenne Mountain Complex',
    type: 'MISSILE_SITE',
    lat: 38.744,
    lon: -104.843,
    importance: 5,
    status: 'OPERATIONAL',
    classification: 'TOP SECRET // ORCON',
    threatLevel: 'STABLE',
    confidenceScore: 99,
    strategicValue: 98,
    summary: 'Sovereign early warning command center and underground nuclear bunker. Coordinates strategic and ballistic defense layers.',
    description: 'Constructed deep within the granite of Cheyenne Mountain in El Paso County, Colorado. The facility acts as the core central defensive signals receiver for the defense networks of North America. Protected by giant 25-ton blast doors designed to withstand multi-megaton EMP and thermal radiation strikes. Coordinates passive threat grids and locks counter-strikes globally.',
    tags: ['EARLY WARNING', 'HARDENED', 'BUNKER', 'COMMAND'],
    imageAssets: [
      {
        id: 'img_us_cheyenne_1',
        hotspotId: 'us_cheyenne_mountain',
        kind: 'HERO',
        src: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=200&q=60',
        alt: 'NORAD Operations Center',
        caption: 'Central screens monitoring ballistic vector simulations inside Cheyenne Mountain hub.'
      },
      {
        id: 'img_us_cheyenne_2',
        hotspotId: 'us_cheyenne_mountain',
        kind: 'SATELLITE',
        src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=200&q=60',
        alt: 'Orbital Reconnaissance Overlay',
        caption: 'Space radar signature scans detailing deep structural foundations and cavern vectors.'
      },
      {
        id: 'img_us_cheyenne_3',
        hotspotId: 'us_cheyenne_mountain',
        kind: 'DOSSIER',
        src: 'https://images.unsplash.com/photo-1510519138101-570d1dca3d66?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1510519138101-570d1dca3d66?auto=format&fit=crop&w=200&q=60',
        alt: 'Emergency Hardened Servers',
        caption: 'Sublevel tactical communications arrays isolated from global internet networks.'
      }
    ]
  },
  {
    id: 'us_norfolk_naval',
    countryId: 'US',
    name: 'Norfolk Naval Station',
    type: 'NAVAL_BASE',
    lat: 36.936,
    lon: -76.326,
    importance: 4,
    status: 'OPTIMIZED',
    classification: 'SECRET // NOFORN',
    threatLevel: 'NOMINAL',
    confidenceScore: 95,
    strategicValue: 92,
    summary: 'The largest naval station in the world, serving as the central logistics and command station for Transatlantic fleet operations.',
    description: 'Host to over 75 combat vessels and housing major aircraft carrier strike groups. Spans massive coastal territory along the Atlantic seaboard. The premier launchpad for global projection of aircraft carrier power, maritime defense, and deep sea anti-submarine warfare.',
    tags: ['FLEET DOCK', 'MARITIME', 'SUPPLY GATE', 'CARRIER GROUP'],
    imageAssets: [
      {
        id: 'img_us_norfolk_1',
        hotspotId: 'us_norfolk_naval',
        kind: 'HERO',
        src: 'https://images.unsplash.com/photo-1507682531662-421b17ac4f83?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1507682531662-421b17ac4f83?auto=format&fit=crop&w=200&q=60',
        alt: 'Fleet Maneuvers Dock',
        caption: 'Active destroyers and logistics cruisers anchored at coastal deep docks.'
      },
      {
        id: 'img_us_norfolk_2',
        hotspotId: 'us_norfolk_naval',
        kind: 'DETAIL',
        src: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=200&q=60',
        alt: 'Cargo and Carrier Logistics',
        caption: 'Refueling crane systems prepared for critical carrier launch sequences.'
      },
      {
        id: 'img_us_norfolk_3',
        hotspotId: 'us_norfolk_naval',
        kind: 'SATELLITE',
        src: 'https://images.unsplash.com/photo-1624397576579-dd2ae15264b3?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1624397576579-dd2ae15264b3?auto=format&fit=crop&w=200&q=60',
        alt: 'Aerial Thermal Mapping',
        caption: 'High-altitude thermal scans measuring fleet movement vectors in the harbor.'
      }
    ]
  },
  {
    id: 'us_area_51',
    countryId: 'US',
    name: 'Groom Lake Test Range (Area 51)',
    type: 'COVERT_SITE',
    lat: 37.235,
    lon: -115.811,
    importance: 3,
    status: 'CLASSIFIED',
    classification: 'TOP SECRET // TS-SCI SPECIAL ACCESS',
    threatLevel: 'STABLE',
    confidenceScore: 82,
    strategicValue: 90,
    summary: 'Highly classified aerospace defense research and covert intelligence signals hub. Operating behind advanced visual shielding.',
    description: 'A classified facility managed by the Air Force Test Center near Groom Lake, Nevada. Serves as the preeminent location for top-secret prototype aerospace trials, advanced stealth radar arrays, and intercepted electronic warfare experiments.',
    tags: ['STEALTH', 'PROTOTYPE', 'COVERT RESEARCH'],
    imageAssets: [
      {
        id: 'img_us_51_1',
        hotspotId: 'us_area_51',
        kind: 'HERO',
        src: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=200&q=60',
        alt: 'Desert Sublevel Entry',
        caption: 'Hangar networks isolated under deep rock layers in the Nevada flatlands.'
      },
      {
        id: 'img_us_51_2',
        hotspotId: 'us_area_51',
        kind: 'SATELLITE',
        src: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=200&q=60',
        alt: 'Groom Lake Salt Flats Scan',
        caption: 'Terrain elevation topology focusing on experimental long-range airstrip grids.'
      },
      {
        id: 'img_us_51_3',
        hotspotId: 'us_area_51',
        kind: 'DETAIL',
        src: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=200&q=60',
        alt: 'Signals Hardware Center',
        caption: 'Passive electronic surveillance nodes processing microwave transmission beams.'
      }
    ]
  },

  // --- Russia (RU) ---
  {
    id: 'ru_severomorsk_naval',
    countryId: 'RU',
    name: 'Severomorsk Fleet base',
    type: 'NAVAL_BASE',
    lat: 69.071,
    lon: 33.421,
    importance: 5,
    status: 'NORMAL READINESS',
    classification: 'COSMOS SECRET',
    threatLevel: 'STABLE',
    confidenceScore: 92,
    strategicValue: 95,
    summary: 'Administrative and combat headquarters for the Northern Fleet. Direct launching point of regional strategic submarines.',
    description: 'Located in the ice-free Kola Peninsula, Severomorsk serves as the absolute vital nerve center of Russian nuclear deterrent ships. Houses elite ballistic missile submarine squadrons capable of global deep sea positioning, guarded by heavily fortified coastal cruise missile defense nets.',
    tags: ['SUBMARINES', 'ARCTIC DEPLOYMENT', 'COAST DEFENSE'],
    imageAssets: [
      {
        id: 'img_ru_sev_1',
        hotspotId: 'ru_severomorsk_naval',
        kind: 'HERO',
        src: 'https://images.unsplash.com/photo-1548813735-e2cd8cfae4f1?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1548813735-e2cd8cfae4f1?auto=format&fit=crop&w=200&q=60',
        alt: 'Northern Fleet Submarine Base',
        caption: 'Icebound cruiser and submarine docks located on the Kola Peninsula inlet.'
      },
      {
        id: 'img_ru_sev_2',
        hotspotId: 'ru_severomorsk_naval',
        kind: 'SATELLITE',
        src: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=200&q=60',
        alt: 'Arctic Ice Orbit Scan',
        caption: 'Visual light spectrum feed scanning polar shipping route openings.'
      }
    ]
  },
  {
    id: 'ru_plesetsk_cosmo',
    countryId: 'RU',
    name: 'Plesetsk Strategic Silos',
    type: 'MISSILE_SITE',
    lat: 62.927,
    lon: 40.574,
    importance: 4,
    status: 'ON-GUARD',
    classification: 'TOP SECRET // KOLA CORE',
    threatLevel: 'ELEVATED',
    confidenceScore: 97,
    strategicValue: 97,
    summary: 'Primary ballistic testing range and defense rocket deployment silos in northern sector.',
    description: 'A critical launch complex for intercontinental ballistic missiles (ICBM) and orbital spy craft payloads. Positioned strategically in the northwestern forests to maximize launch corridors to transatlantic target blocks. Features highly hardened underground silo clusters.',
    tags: ['ICBM SILOS', 'STRATEGIC LAUNCH', 'FOREST COMPLEX'],
    imageAssets: [
      {
        id: 'img_ru_ples_1',
        hotspotId: 'ru_plesetsk_cosmo',
        kind: 'HERO',
        src: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=200&q=60',
        alt: 'Silo Launch Scaffolding',
        caption: 'Vertical steel gantry platforms holding ballistic thrust stages.'
      },
      {
        id: 'img_ru_ples_2',
        hotspotId: 'ru_plesetsk_cosmo',
        kind: 'DETAIL',
        src: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=200&q=60',
        alt: 'Missile Core Mechanics',
        caption: 'Heavy fuel-assembly transport machinery inspected inside underground facilities.'
      }
    ]
  },
  {
    id: 'ru_kapustin_nuclear',
    countryId: 'RU',
    name: 'Kapustin Yar Science Complex',
    type: 'NUCLEAR_FACILITY',
    lat: 48.565,
    lon: 46.251,
    importance: 3,
    status: 'NORMAL READINESS',
    classification: 'SECRET // VECTOR RED',
    threatLevel: 'STABLE',
    confidenceScore: 89,
    strategicValue: 85,
    summary: 'Historic development center for ballistic rocketry and advanced energy weapons research.',
    description: 'A legendary development base dating back to early missile defense foundations. Today, it hosts advanced nuclear physics laboratories, strategic directed-energy testing, and simulated radar countermeasures development.',
    tags: ['LABORATORY', 'ENERGY WEAPONS', 'RADAR TEST'],
    imageAssets: [
      {
        id: 'img_ru_kap_1',
        hotspotId: 'ru_kapustin_nuclear',
        kind: 'HERO',
        src: 'https://images.unsplash.com/photo-1485081669829-bacb8c7bb1f3?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1485081669829-bacb8c7bb1f3?auto=format&fit=crop&w=200&q=60',
        alt: 'Quantum Nuclear Field Lab',
        caption: 'High-voltage reactor tubes researching experimental electromagnetic energy weapons.'
      },
      {
        id: 'img_ru_kap_2',
        hotspotId: 'ru_kapustin_nuclear',
        kind: 'SATELLITE',
        src: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=200&q=60',
        alt: 'Complex Perimeter Scan',
        caption: 'Radar array telemetry profiles tracing physical boundary security sensor grids.'
      }
    ]
  },

  // --- China (CN) ---
  {
    id: 'cn_lop_nur',
    countryId: 'CN',
    name: 'Lop Nur Testing Center',
    type: 'NUCLEAR_FACILITY',
    lat: 41.562,
    lon: 88.514,
    importance: 5,
    status: 'SECURED',
    classification: 'RED SHIELD CLASSIFIED',
    threatLevel: 'STABLE',
    confidenceScore: 94,
    strategicValue: 99,
    summary: 'Primary research base for strategic thermonuclear weapon optimization. Underground facilities heavily hardened.',
    description: 'Deep in the arid salt components of eastern Xinjiang, Lop Nur remains the crucial operational testing theater for Chinese nuclear payloads. Hardened tunnels deep inside neighboring mountains are locked under maximum military blockade.',
    tags: ['THERMONUCLEAR', 'UNDERGROUND TUNNELS', 'BLOCKADE'],
    imageAssets: [
      {
        id: 'img_cn_lop_1',
        hotspotId: 'cn_lop_nur',
        kind: 'HERO',
        src: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=200&q=60',
        alt: 'Desert Subsurface Complex',
        caption: 'Remote canyon access roads leading to high-security blast tunnels.'
      },
      {
        id: 'img_cn_lop_2',
        hotspotId: 'cn_lop_nur',
        kind: 'SATELLITE',
        src: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=200&q=60',
        alt: 'Mountain Thermal Core',
        caption: 'Thermal satellite overlay tracking power grid emissions from subterranean generators.'
      }
    ]
  },
  {
    id: 'cn_qingdao_naval',
    countryId: 'CN',
    name: 'Qingdao Port Command',
    type: 'NAVAL_BASE',
    lat: 36.115,
    lon: 120.528,
    importance: 4,
    status: 'HIGH ALERT',
    classification: 'SECRET // STRATEGIC CORRIDOR',
    threatLevel: 'ELEVATED',
    confidenceScore: 91,
    strategicValue: 93,
    summary: 'Strategic naval base serving as the tactical dock for regional warning groups and submarine strike systems.',
    description: 'Homeport for the North Sea Fleet of the PLA Navy. Coordinates patrols through regional oceans and straits. Hosts cutting-edge anti-air destroyers, multi-sensor radar frigates, and localized defense alert groups.',
    tags: ['FLEET PORT', 'NORTH SEA PATROL', 'RADAR FRIGATES'],
    imageAssets: [
      {
        id: 'img_cn_qing_1',
        hotspotId: 'cn_qingdao_naval',
        kind: 'HERO',
        src: 'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&w=200&q=60',
        alt: 'Naval Port Crane Outlines',
        caption: 'Cargo crane grid preparing rapid fleet restocking lines at twilight docks.'
      },
      {
        id: 'img_cn_qing_2',
        hotspotId: 'cn_qingdao_naval',
        kind: 'DETAIL',
        src: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=200&q=60',
        alt: 'Deep Harbor Infrastructure',
        caption: 'Reinforced fuel piping bridges supporting active destroyer hulls.'
      }
    ]
  },
  {
    id: 'cn_chengdu_aero',
    countryId: 'CN',
    name: 'Chengdu Special Aviation Hub',
    type: 'AIR_BASE',
    lat: 30.582,
    lon: 103.953,
    importance: 3,
    status: 'OPERATIONAL',
    classification: 'SECRET // TS SPECIAL OPS',
    threatLevel: 'NOMINAL',
    confidenceScore: 88,
    strategicValue: 86,
    summary: 'Advanced fighter assembly facility and tactical drone division deployment staging ground.',
    description: 'A major aviation complex assembling stealth fighters and highly autonomous drone swarms. Acts as the command hub for Western-sector theater logistics.',
    tags: ['STEALTH JETS', 'DRONES', 'WAR GAMES'],
    imageAssets: [
      {
        id: 'img_cn_chen_1',
        hotspotId: 'cn_chengdu_aero',
        kind: 'HERO',
        src: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=60',
        alt: 'Aerospace Engineering Plant',
        caption: 'Clean-room assembly platforms detailing wing design structures.'
      },
      {
        id: 'img_cn_chen_2',
        hotspotId: 'cn_chengdu_aero',
        kind: 'DETAIL',
        src: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=200&q=60',
        alt: 'Hypersonic Wind Tunnel',
        caption: 'High-pressure experimental turbines used to validate aircraft heat resistance.'
      }
    ]
  },

  // --- United Kingdom (GB) ---
  {
    id: 'gb_portsmouth_naval',
    countryId: 'GB',
    name: 'HMNB Portsmouth',
    type: 'NAVAL_BASE',
    lat: 50.812,
    lon: -1.109,
    importance: 4,
    status: 'OPERATIONAL',
    classification: 'UK EYES ONLY // SECRET',
    threatLevel: 'NOMINAL',
    confidenceScore: 96,
    strategicValue: 90,
    summary: 'Primary homeport of the Royal Navy, hosting fleet flagships and state-of-the-art aircraft carrier task groups.',
    description: 'Dating back centuries, today’s base is a masterclass in nuclear carrier support. Serving as the primary base for Queen Elizabeth-class carriers. Complete with deep-water facilities, nuclear logistics depots, and radar control.',
    tags: ['ROYAL NAVY', 'CARRIER DOCK', 'MARITIME HQ'],
    imageAssets: [
      {
        id: 'img_gb_port_1',
        hotspotId: 'gb_portsmouth_naval',
        kind: 'HERO',
        src: 'https://images.unsplash.com/photo-1605553259461-2678f103caab?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1605553259461-2678f103caab?auto=format&fit=crop&w=200&q=60',
        alt: 'Portsmouth Carrier Docks',
        caption: 'Navy auxiliary transport and multi-role ships moored in Portsmouth harbor.'
      },
      {
        id: 'img_gb_port_2',
        hotspotId: 'gb_portsmouth_naval',
        kind: 'DETAIL',
        src: 'https://images.unsplash.com/photo-1501535088662-0df1f3e44985?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1501535088662-0df1f3e44985?auto=format&fit=crop&w=200&q=60',
        alt: 'Maritime Communications Mast',
        caption: 'L-band tactical naval satellite transceiver array under review.'
      }
    ]
  },
  {
    id: 'gb_bude_gchq',
    countryId: 'GB',
    name: 'GCHQ Bude Signal Intercept',
    type: 'CYBER_FACILITY',
    lat: 50.885,
    lon: -4.538,
    importance: 4,
    status: 'ACTIVE LOGGING',
    classification: 'UK EYES ONLY // CONFIDENTIAL // NOFORN',
    threatLevel: 'NOMINAL',
    confidenceScore: 98,
    strategicValue: 95,
    summary: 'Massive undersea fiber-optic data logging base and strategic signal analysis workstation.',
    description: 'Part of the Five Eyes signals network. Collects and analyzes satellite and oceanic fiber communications, providing real-time code-breaking and interception coverage of European channels.',
    tags: ['SIGNAL INTELLIGENCE', 'INTECEPT STATION', 'FIVE EYES'],
    imageAssets: [
      {
        id: 'img_gb_bude_1',
        hotspotId: 'gb_bude_gchq',
        kind: 'HERO',
        src: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=200&q=60',
        alt: 'Bude Intercept Dishes',
        caption: 'Massive telemetry dome listening posts scanning the Atlantic.'
      },
      {
        id: 'img_gb_bude_2',
        hotspotId: 'gb_bude_gchq',
        kind: 'SATELLITE',
        src: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=200&q=60',
        alt: 'Optic Fiber Light Grid',
        caption: 'Graphic simulation logging submarine cable landing signal speeds.'
      }
    ]
  },

  // --- Israel (IL) ---
  {
    id: 'il_shimon_nuclear',
    countryId: 'IL',
    name: 'Dimona Nuclear Research Center',
    type: 'NUCLEAR_FACILITY',
    lat: 31.002,
    lon: 34.502,
    importance: 5,
    status: 'MAX SECURITY',
    classification: 'COSMIC TOP SECRET // EYE-LEVEL',
    threatLevel: 'HIGH ALERT',
    confidenceScore: 95,
    strategicValue: 100,
    summary: 'Hardened research complex rumored to house the sovereign strategic independent deterrent program.',
    description: 'Officially a nuclear research laboratory in the Negev desert. Operates under supreme multi-layered anti-missile air defense nets and electronic jamming covers. Hardened below ground level for maximum survivability.',
    tags: ['NEGEV', 'NUCLEAR RETALIATION', 'JAMMING CORE'],
    imageAssets: [
      {
        id: 'img_il_dim_1',
        hotspotId: 'il_shimon_nuclear',
        kind: 'HERO',
        src: 'https://images.unsplash.com/photo-1510251147517-5735eff21e64?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1510251147517-5735eff21e64?auto=format&fit=crop&w=200&q=60',
        alt: 'Hardened Negev Reactor Dome',
        caption: 'Concrete and steel reactor containment silo in the early desert twilight.'
      },
      {
        id: 'img_il_dim_2',
        hotspotId: 'il_shimon_nuclear',
        kind: 'DETAIL',
        src: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=200&q=60',
        alt: 'Sublevel Centrifuge Arrays',
        caption: 'High-speed isotopic separation centrifuges operating in sterile concrete bunkers.'
      }
    ]
  },
  {
    id: 'il_tel_aviv_cyber',
    countryId: 'IL',
    name: 'Unit 8200 Tel Aviv Command',
    type: 'CYBER_FACILITY',
    lat: 32.083,
    lon: 34.781,
    importance: 4,
    status: 'MONITORING',
    classification: 'TOP SECRET // DECRYPT-ALPHA',
    threatLevel: 'STABLE',
    confidenceScore: 93,
    strategicValue: 91,
    summary: 'Hub for electronic intelligence operations, digital countermeasures, and decryptions.',
    description: 'Elite technological cyber warfare base under military intelligence command. Directs defensive cryptanalysis, offensive payload delivery systems, and real-time counter-intelligence signals harvesting.',
    tags: ['CYBER OPERATIONS', 'DECRYPTION CORE', 'METROPOLITAN'],
    imageAssets: [
      {
        id: 'img_il_ta_1',
        hotspotId: 'il_tel_aviv_cyber',
        kind: 'HERO',
        src: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=200&q=60',
        alt: 'Decryption Tactical Terminals',
        caption: 'Main tracking workstations in Tel Aviv monitoring real-time server activity.'
      },
      {
        id: 'img_il_ta_2',
        hotspotId: 'il_tel_aviv_cyber',
        kind: 'SATELLITE',
        src: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
        thumbSrc: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=200&q=60',
        alt: 'Virtual Intrusion Heatmap',
        caption: 'Digital simulation tracking regional subnet penetrations.'
      }
    ]
  }
];

export function getHotspotsForCountry(countryId: string): CountryHotspot[] {
  return SEEDED_HOTSPOTS.filter(h => h.countryId === countryId);
}
