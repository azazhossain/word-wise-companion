// Theme palette definitions. Each palette overrides a small set of CSS
// variables on the document root so the rest of the design system reacts.

export interface Palette {
  id: string;
  label: string;
  swatch: string;
  vars: {
    primary: string;
    primaryGlow: string;
    accent: string;
    success?: string;
    blob1: string;
    blob2: string;
    blob3: string;
    gradientHero: string;
    gradientCard: string;
    gradientAccent: string;
    gradientMint: string;
    gradientSunset: string;
  };
  darkVars: Partial<Palette["vars"]>;
}

export const PALETTES: Palette[] = [
  {
    id: "aurora",
    label: "Aurora",
    swatch: "linear-gradient(135deg,#7c3aed 0%,#d946ef 50%,#fb7185 100%)",
    vars: {
      primary: "258 88% 60%",
      primaryGlow: "280 90% 70%",
      accent: "340 90% 62%",
      success: "160 78% 42%",
      blob1: "280 95% 65%",
      blob2: "200 95% 60%",
      blob3: "340 90% 65%",
      gradientHero: "linear-gradient(135deg, hsl(258 88% 55%) 0%, hsl(290 85% 60%) 40%, hsl(340 90% 62%) 100%)",
      gradientCard: "linear-gradient(135deg, hsl(258 88% 60%) 0%, hsl(200 95% 55%) 100%)",
      gradientAccent: "linear-gradient(135deg, hsl(340 90% 62%) 0%, hsl(20 95% 60%) 100%)",
      gradientMint: "linear-gradient(135deg, hsl(160 78% 42%) 0%, hsl(190 90% 50%) 100%)",
      gradientSunset: "linear-gradient(135deg, hsl(340 90% 65%) 0%, hsl(38 95% 60%) 100%)",
    },
    darkVars: {
      gradientHero: "linear-gradient(135deg, hsl(258 70% 32%) 0%, hsl(290 70% 36%) 40%, hsl(340 70% 38%) 100%)",
      gradientCard: "linear-gradient(135deg, hsl(258 70% 42%) 0%, hsl(200 80% 38%) 100%)",
      gradientAccent: "linear-gradient(135deg, hsl(340 80% 48%) 0%, hsl(20 80% 48%) 100%)",
      gradientMint: "linear-gradient(135deg, hsl(160 70% 38%) 0%, hsl(190 80% 40%) 100%)",
      gradientSunset: "linear-gradient(135deg, hsl(340 80% 48%) 0%, hsl(38 80% 48%) 100%)",
    },
  },
  {
    id: "sky",
    label: "Sky Blue",
    swatch: "linear-gradient(135deg,#0ea5e9 0%,#3b82f6 50%,#6366f1 100%)",
    vars: {
      primary: "210 90% 55%",
      primaryGlow: "200 95% 65%",
      accent: "190 95% 50%",
      success: "165 75% 42%",
      blob1: "210 95% 65%",
      blob2: "190 95% 60%",
      blob3: "230 90% 65%",
      gradientHero: "linear-gradient(135deg, hsl(210 90% 50%) 0%, hsl(200 95% 55%) 50%, hsl(190 95% 55%) 100%)",
      gradientCard: "linear-gradient(135deg, hsl(210 90% 55%) 0%, hsl(230 85% 60%) 100%)",
      gradientAccent: "linear-gradient(135deg, hsl(190 95% 50%) 0%, hsl(200 95% 60%) 100%)",
      gradientMint: "linear-gradient(135deg, hsl(170 80% 42%) 0%, hsl(195 90% 50%) 100%)",
      gradientSunset: "linear-gradient(135deg, hsl(195 95% 55%) 0%, hsl(220 90% 60%) 100%)",
    },
    darkVars: {
      gradientHero: "linear-gradient(135deg, hsl(210 70% 30%) 0%, hsl(200 80% 32%) 50%, hsl(190 80% 35%) 100%)",
      gradientCard: "linear-gradient(135deg, hsl(210 75% 38%) 0%, hsl(230 70% 42%) 100%)",
      gradientAccent: "linear-gradient(135deg, hsl(190 75% 38%) 0%, hsl(200 75% 42%) 100%)",
      gradientMint: "linear-gradient(135deg, hsl(170 70% 35%) 0%, hsl(195 80% 40%) 100%)",
      gradientSunset: "linear-gradient(135deg, hsl(195 80% 40%) 0%, hsl(220 75% 42%) 100%)",
    },
  },
  {
    id: "emerald",
    label: "Emerald",
    swatch: "linear-gradient(135deg,#059669 0%,#10b981 50%,#34d399 100%)",
    vars: {
      primary: "158 78% 38%",
      primaryGlow: "150 75% 48%",
      accent: "180 80% 42%",
      success: "150 75% 42%",
      blob1: "158 80% 50%",
      blob2: "180 80% 50%",
      blob3: "120 70% 55%",
      gradientHero: "linear-gradient(135deg, hsl(158 80% 32%) 0%, hsl(165 78% 40%) 50%, hsl(178 80% 42%) 100%)",
      gradientCard: "linear-gradient(135deg, hsl(158 78% 38%) 0%, hsl(180 78% 42%) 100%)",
      gradientAccent: "linear-gradient(135deg, hsl(150 80% 40%) 0%, hsl(120 70% 50%) 100%)",
      gradientMint: "linear-gradient(135deg, hsl(150 78% 40%) 0%, hsl(170 78% 45%) 100%)",
      gradientSunset: "linear-gradient(135deg, hsl(170 80% 42%) 0%, hsl(195 85% 50%) 100%)",
    },
    darkVars: {
      gradientHero: "linear-gradient(135deg, hsl(158 60% 22%) 0%, hsl(165 60% 28%) 50%, hsl(178 60% 30%) 100%)",
      gradientCard: "linear-gradient(135deg, hsl(158 65% 28%) 0%, hsl(180 60% 32%) 100%)",
      gradientAccent: "linear-gradient(135deg, hsl(150 65% 30%) 0%, hsl(120 60% 35%) 100%)",
      gradientMint: "linear-gradient(135deg, hsl(150 65% 30%) 0%, hsl(170 65% 35%) 100%)",
      gradientSunset: "linear-gradient(135deg, hsl(170 65% 32%) 0%, hsl(195 70% 38%) 100%)",
    },
  },
  {
    id: "rose",
    label: "Rose",
    swatch: "linear-gradient(135deg,#e11d48 0%,#f43f5e 50%,#fb923c 100%)",
    vars: {
      primary: "350 85% 55%",
      primaryGlow: "10 90% 65%",
      accent: "20 95% 60%",
      success: "160 75% 42%",
      blob1: "350 90% 65%",
      blob2: "20 90% 65%",
      blob3: "320 85% 65%",
      gradientHero: "linear-gradient(135deg, hsl(350 85% 50%) 0%, hsl(10 90% 58%) 50%, hsl(30 95% 60%) 100%)",
      gradientCard: "linear-gradient(135deg, hsl(350 85% 55%) 0%, hsl(20 95% 60%) 100%)",
      gradientAccent: "linear-gradient(135deg, hsl(320 85% 60%) 0%, hsl(350 90% 60%) 100%)",
      gradientMint: "linear-gradient(135deg, hsl(160 78% 42%) 0%, hsl(180 80% 50%) 100%)",
      gradientSunset: "linear-gradient(135deg, hsl(20 95% 60%) 0%, hsl(38 95% 58%) 100%)",
    },
    darkVars: {
      gradientHero: "linear-gradient(135deg, hsl(350 65% 28%) 0%, hsl(10 70% 32%) 50%, hsl(30 75% 38%) 100%)",
      gradientCard: "linear-gradient(135deg, hsl(350 65% 35%) 0%, hsl(20 75% 38%) 100%)",
      gradientAccent: "linear-gradient(135deg, hsl(320 65% 35%) 0%, hsl(350 70% 38%) 100%)",
      gradientMint: "linear-gradient(135deg, hsl(160 65% 30%) 0%, hsl(180 70% 35%) 100%)",
      gradientSunset: "linear-gradient(135deg, hsl(20 75% 38%) 0%, hsl(38 75% 38%) 100%)",
    },
  },
  {
    id: "royal",
    label: "Royal",
    swatch: "linear-gradient(135deg,#4338ca 0%,#7c3aed 50%,#9333ea 100%)",
    vars: {
      primary: "248 80% 50%",
      primaryGlow: "260 85% 65%",
      accent: "275 80% 58%",
      success: "160 70% 42%",
      blob1: "248 85% 60%",
      blob2: "275 85% 65%",
      blob3: "215 85% 60%",
      gradientHero: "linear-gradient(135deg, hsl(248 80% 42%) 0%, hsl(260 80% 50%) 50%, hsl(280 80% 55%) 100%)",
      gradientCard: "linear-gradient(135deg, hsl(248 80% 50%) 0%, hsl(215 85% 55%) 100%)",
      gradientAccent: "linear-gradient(135deg, hsl(275 80% 58%) 0%, hsl(310 75% 60%) 100%)",
      gradientMint: "linear-gradient(135deg, hsl(160 70% 42%) 0%, hsl(190 80% 50%) 100%)",
      gradientSunset: "linear-gradient(135deg, hsl(275 80% 60%) 0%, hsl(310 80% 60%) 100%)",
    },
    darkVars: {
      gradientHero: "linear-gradient(135deg, hsl(248 60% 28%) 0%, hsl(260 65% 32%) 50%, hsl(280 65% 38%) 100%)",
      gradientCard: "linear-gradient(135deg, hsl(248 65% 35%) 0%, hsl(215 70% 38%) 100%)",
      gradientAccent: "linear-gradient(135deg, hsl(275 65% 40%) 0%, hsl(310 60% 42%) 100%)",
      gradientMint: "linear-gradient(135deg, hsl(160 60% 30%) 0%, hsl(190 70% 35%) 100%)",
      gradientSunset: "linear-gradient(135deg, hsl(275 65% 42%) 0%, hsl(310 65% 42%) 100%)",
    },
  },
  {
    id: "amber",
    label: "Amber",
    swatch: "linear-gradient(135deg,#d97706 0%,#f59e0b 50%,#fbbf24 100%)",
    vars: {
      primary: "32 95% 48%",
      primaryGlow: "42 95% 58%",
      accent: "20 95% 55%",
      success: "150 75% 42%",
      blob1: "32 95% 60%",
      blob2: "20 95% 60%",
      blob3: "55 95% 60%",
      gradientHero: "linear-gradient(135deg, hsl(32 95% 42%) 0%, hsl(20 95% 50%) 50%, hsl(10 90% 55%) 100%)",
      gradientCard: "linear-gradient(135deg, hsl(32 95% 48%) 0%, hsl(20 95% 55%) 100%)",
      gradientAccent: "linear-gradient(135deg, hsl(20 95% 55%) 0%, hsl(0 90% 60%) 100%)",
      gradientMint: "linear-gradient(135deg, hsl(150 75% 42%) 0%, hsl(180 78% 48%) 100%)",
      gradientSunset: "linear-gradient(135deg, hsl(20 95% 55%) 0%, hsl(45 95% 55%) 100%)",
    },
    darkVars: {
      gradientHero: "linear-gradient(135deg, hsl(32 70% 28%) 0%, hsl(20 70% 32%) 50%, hsl(10 70% 35%) 100%)",
      gradientCard: "linear-gradient(135deg, hsl(32 70% 35%) 0%, hsl(20 70% 40%) 100%)",
      gradientAccent: "linear-gradient(135deg, hsl(20 70% 40%) 0%, hsl(0 65% 42%) 100%)",
      gradientMint: "linear-gradient(135deg, hsl(150 65% 32%) 0%, hsl(180 70% 38%) 100%)",
      gradientSunset: "linear-gradient(135deg, hsl(20 70% 40%) 0%, hsl(45 75% 40%) 100%)",
    },
  },
];

export const DEFAULT_PALETTE_ID = "aurora";

export function getPalette(id: string | null | undefined): Palette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}

export function applyPalette(id: string, isDark: boolean) {
  const p = getPalette(id);
  const root = document.documentElement;
  const v = { ...p.vars, ...(isDark ? p.darkVars : {}) };

  root.style.setProperty("--primary", v.primary!);
  root.style.setProperty("--primary-glow", v.primaryGlow!);
  root.style.setProperty("--accent", v.accent!);
  if (v.success) root.style.setProperty("--success", v.success);
  root.style.setProperty("--blob-1", v.blob1!);
  root.style.setProperty("--blob-2", v.blob2!);
  root.style.setProperty("--blob-3", v.blob3!);
  root.style.setProperty("--gradient-hero", v.gradientHero!);
  root.style.setProperty("--gradient-card", v.gradientCard!);
  root.style.setProperty("--gradient-accent", v.gradientAccent!);
  root.style.setProperty("--gradient-mint", v.gradientMint!);
  root.style.setProperty("--gradient-sunset", v.gradientSunset!);

  // Force readable white text on all gradient surfaces (fixes dark-mode bug
  // where primary-foreground used to be near-black and disappeared on cards).
  root.style.setProperty("--primary-foreground", "0 0% 100%");
  root.style.setProperty("--accent-foreground", "0 0% 100%");
  root.style.setProperty("--success-foreground", "0 0% 100%");
}
