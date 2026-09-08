// Robotické barevné schéma podle dokumentace
export const COLORS = {
  PAGE_BG: "#F5E6D0",        // Světle béžová (sjednoceno s NumberRecognitionGame)
  SLOT_BG: "#FFFFFF",        // Bílé sloty
  SLOT_LINE: "#C0C4FF",      // Světle modrá ohraničení
  DRAGGABLE_BG: "#F0F9FF",   // Světle modrá pro drag prvky
  DRAGGABLE_BORDER: "#4EA3FF", // Modrá border
  HOVER_BG: "#FEF3CD",       // Žlutá hover
  SUCCESS_BG: "#4CAF50",     // Zelená úspěch
  CRIMSON: "#9B1C1C",        // Tmavě červená text
  BLUE: "#4EA3FF",           // Modrá tlačítka
  GREEN: "#4CAF50",          // Zelená progress
  PURPLE: "#7E57C2",         // Fialová accent
  RED: "#FF4D6D",            // Červená chyby
  ORANGE: "#F7A800",         // Oranžová reset
  GRAY: "#B0B0B0",           // Šedá neaktivní
  FILLED_BG: "#E8F5E8",      // Světle zelená vyplněné
  FILLED_BORDER: "#4CAF50"   // Zelená border vyplněné
};

// Geometrické tvary a barvy podle dokumentace
export const SHAPES = ['circle', 'square', 'triangle'] as const;

// 12 barev organizovaných do skupin podle dokumentace
export const COLOR_GROUPS = {
  reds: ['#85324C', '#FF144D', '#FF4D6D'],      // Červená skupina
  yellows: ['#FFD700'],                         // Žlutá skupina
  greens: ['#00E46C', '#007B5C', '#4CAF50'],    // Zelená skupina
  blues: ['#3FA9FF', '#0077FF', '#002DFF'],     // Modrá skupina
  purples: ['#6736FF', '#7E57C2', '#02006F']    // Fialová skupina
};

export const SHAPE_COLORS = [
  '#85324C', '#FF144D', '#FFD700', '#00E46C',
  '#007B5C', '#3FA9FF', '#0077FF', '#002DFF', '#6736FF', '#02006F'
];

// Konfigurační vzory pro různé obtížnosti podle dokumentace
export const PATTERN_CONFIGS = {
  easy: [
    { 
      type: 'AB', 
      title: 'Střídavý vzor (AB)',
      description: 'Dva prvky se střídají',
      generate: (shapes: string[], colors: number[]) => ({
        pattern: 'AB',
        elements: [
          { shape: shapes[0], color: colors[0] },
          { shape: shapes[1], color: colors[1] }
        ]
      })
    },
    {
      type: 'AAB',
      title: 'Dvojitý vzor (AAB)', 
      description: 'Dva stejné, pak jeden jiný',
      generate: (shapes: string[], colors: number[]) => ({
        pattern: 'AAB',
        elements: [
          { shape: shapes[0], color: colors[0] },
          { shape: shapes[0], color: colors[0] },
          { shape: shapes[1], color: colors[1] }
        ]
      })
    },
    {
      type: 'ABC',
      title: 'Trojitý vzor (ABC)',
      description: 'Tři různé prvky',
      generate: (shapes: string[], colors: number[]) => ({
        pattern: 'ABC',
        elements: [
          { shape: shapes[0], color: colors[0] },
          { shape: shapes[1], color: colors[1] },
          { shape: shapes[2] || shapes[0], color: colors[2] || colors[0] }
        ]
      })
    },
    {
      type: 'AAAB',
      title: 'Trojitý první vzor (AAAB)',
      description: 'Tři stejné, pak jeden jiný',
      generate: (shapes: string[], colors: number[]) => ({
        pattern: 'AAAB',
        elements: [
          { shape: shapes[0], color: colors[0] },
          { shape: shapes[0], color: colors[0] },
          { shape: shapes[0], color: colors[0] },
          { shape: shapes[1], color: colors[1] }
        ]
      })
    }
  ],
  medium: [
    {
      type: 'AABB',
      title: 'Párový vzor (AABB)',
      description: 'Dva páry prvků',
      generate: (shapes: string[], colors: number[]) => ({
        pattern: 'AABB',
        elements: [
          { shape: shapes[0], color: colors[0] },
          { shape: shapes[0], color: colors[0] },
          { shape: shapes[1], color: colors[1] },
          { shape: shapes[1], color: colors[1] }
        ]
      })
    },
    {
      type: 'ABCD',
      title: 'Čtyřitý vzor (ABCD)',
      description: 'Čtyři různé prvky',
      generate: (shapes: string[], colors: number[]) => ({
        pattern: 'ABCD',
        elements: [
          { shape: shapes[0], color: colors[0] },
          { shape: shapes[1], color: colors[1] },
          { shape: shapes[2] || shapes[0], color: colors[2] || colors[0] },
          { shape: shapes[0], color: colors[1] } // Mix tvarů a barev pro komplexnost
        ]
      })
    }
  ],
  hard: [
    {
      type: 'ABAC',
      title: 'Složený vzor (ABAC)',
      description: 'Komplexní opakování',
      generate: (shapes: string[], colors: number[]) => ({
        pattern: 'ABAC',
        elements: [
          { shape: shapes[0], color: colors[0] },
          { shape: shapes[1], color: colors[1] },
          { shape: shapes[0], color: colors[0] },
          { shape: shapes[2] || shapes[1], color: colors[2] || colors[1] }
        ]
      })
    }
  ]
};