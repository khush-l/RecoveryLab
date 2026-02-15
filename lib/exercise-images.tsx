/**
 * Maps exercise names to categories and provides SVG illustration components.
 * Used on the calendar page exercise cards.
 */

type ExerciseCategory =
  | "stretching"
  | "strength"
  | "balance"
  | "walking"
  | "core"
  | "hip"
  | "ankle"
  | "shoulder"
  | "general";

const CATEGORY_KEYWORDS: Record<ExerciseCategory, string[]> = {
  stretching: [
    "stretch", "flexibility", "elongat", "hamstring stretch", "calf stretch",
    "quad stretch", "piriformis", "figure four", "toe touch", "range of motion",
    "rom", "foam roll",
  ],
  strength: [
    "squat", "lunge", "raise", "press", "curl", "deadlift", "lift",
    "resistance", "weight", "strengthening", "leg press", "wall sit",
    "step up", "push up", "pushup",
  ],
  balance: [
    "balance", "single leg stand", "one leg", "tandem", "bosu",
    "stability", "wobble", "proprioception", "romberg",
  ],
  walking: [
    "walk", "gait", "step", "march", "treadmill", "heel toe",
    "heel-toe", "cadence", "stride",
  ],
  core: [
    "plank", "bridge", "crunch", "abdominal", "core", "dead bug",
    "bird dog", "pelvic tilt", "glute bridge", "superman",
  ],
  hip: [
    "hip", "abduct", "adduct", "clam", "clamshell", "fire hydrant",
    "hip flexor", "hip circle", "lateral band", "side lying",
  ],
  ankle: [
    "ankle", "dorsiflexion", "plantarflexion", "calf", "toe raise",
    "heel raise", "foot", "achilles", "tibialis",
  ],
  shoulder: [
    "shoulder", "rotator", "arm circle", "band pull", "scapular",
    "external rotation", "internal rotation", "lat", "row",
  ],
  general: [],
};

const CATEGORY_COLORS: Record<ExerciseCategory, { bg: string; fg: string }> = {
  stretching: { bg: "from-purple-100 to-violet-50", fg: "#7c3aed" },
  strength:   { bg: "from-blue-100 to-sky-50", fg: "#2563eb" },
  balance:    { bg: "from-teal-100 to-emerald-50", fg: "#0d9488" },
  walking:    { bg: "from-green-100 to-lime-50", fg: "#16a34a" },
  core:       { bg: "from-orange-100 to-amber-50", fg: "#ea580c" },
  hip:        { bg: "from-pink-100 to-rose-50", fg: "#db2777" },
  ankle:      { bg: "from-cyan-100 to-sky-50", fg: "#0891b2" },
  shoulder:   { bg: "from-indigo-100 to-blue-50", fg: "#4f46e5" },
  general:    { bg: "from-gray-100 to-slate-50", fg: "#475569" },
};

export function getExerciseCategory(name: string): ExerciseCategory {
  const lower = name.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === "general") continue;
    for (const kw of keywords) {
      if (lower.includes(kw)) return category as ExerciseCategory;
    }
  }
  return "general";
}

function StretchingSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
      <circle cx="32" cy="12" r="5" stroke={color} strokeWidth="2.5" />
      <line x1="32" y1="17" x2="32" y2="38" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 24 L20 16 L14 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 24 L44 18 L52 22" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="32" y1="38" x2="22" y2="54" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="38" x2="42" y2="54" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function StrengthSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
      <rect x="10" y="26" width="6" height="12" rx="1.5" stroke={color} strokeWidth="2.2" />
      <rect x="48" y="26" width="6" height="12" rx="1.5" stroke={color} strokeWidth="2.2" />
      <line x1="16" y1="32" x2="48" y2="32" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="6" y="28" width="4" height="8" rx="1" stroke={color} strokeWidth="2" />
      <rect x="54" y="28" width="4" height="8" rx="1" stroke={color} strokeWidth="2" />
      <path d="M26 18 L32 14 L38 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      <path d="M28 46 L32 50 L36 46" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    </svg>
  );
}

function BalanceSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
      <circle cx="32" cy="10" r="4.5" stroke={color} strokeWidth="2.5" />
      <line x1="32" y1="14.5" x2="32" y2="36" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="20" y1="24" x2="44" y2="24" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="36" x2="32" y2="54" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 36 L42 44 L46 40" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="26" y1="54" x2="38" y2="54" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function WalkingSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
      <circle cx="30" cy="10" r="4.5" stroke={color} strokeWidth="2.5" />
      <line x1="30" y1="14.5" x2="32" y2="34" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M30 22 L22 30" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M30 22 L40 26" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 34 L24 50 L20 54" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 34 L40 48 L44 54" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="48" y1="20" x2="52" y2="20" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      <line x1="50" y1="26" x2="54" y2="26" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

function CoreSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
      <circle cx="14" cy="28" r="4" stroke={color} strokeWidth="2.2" />
      <line x1="18" y1="30" x2="46" y2="30" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="18" y1="30" x2="14" y2="44" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="46" y1="30" x2="50" y2="44" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="8" y1="44" x2="56" y2="44" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

function HipSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
      <circle cx="26" cy="10" r="4.5" stroke={color} strokeWidth="2.5" />
      <line x1="26" y1="14.5" x2="26" y2="34" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="26" y1="22" x2="18" y2="28" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="26" y1="22" x2="34" y2="28" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="26" y1="34" x2="26" y2="54" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M26 34 L44 26" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M38 38 C42 34 44 30 44 26" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" strokeDasharray="3 3" />
    </svg>
  );
}

function AnkleSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
      <line x1="30" y1="8" x2="30" y2="38" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <circle cx="30" cy="38" r="3.5" stroke={color} strokeWidth="2" fill="none" />
      <path d="M30 41.5 L30 48 L42 52 L44 50" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 48 C22 42 26 38 30 34" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" strokeDasharray="3 3" />
      <path d="M40 44 C38 40 34 38 30 34" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" strokeDasharray="3 3" />
    </svg>
  );
}

function ShoulderSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
      <circle cx="32" cy="14" r="5" stroke={color} strokeWidth="2.5" />
      <line x1="32" y1="19" x2="32" y2="42" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 26 L46 14 L50 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 26 L22 34" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M44 28 C48 22 48 16 46 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" strokeDasharray="3 3" />
      <line x1="32" y1="42" x2="26" y2="56" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="42" x2="38" y2="56" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function GeneralSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
      <circle cx="32" cy="12" r="5" stroke={color} strokeWidth="2.5" />
      <line x1="32" y1="17" x2="32" y2="38" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 24 L22 20 L16 22" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 24 L42 20 L48 22" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="32" y1="38" x2="24" y2="54" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="38" x2="40" y2="54" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50 10 L51 13 L54 14 L51 15 L50 18 L49 15 L46 14 L49 13 Z" fill={color} opacity="0.35" />
    </svg>
  );
}

const SVG_MAP: Record<ExerciseCategory, React.FC<{ color: string }>> = {
  stretching: StretchingSvg,
  strength: StrengthSvg,
  balance: BalanceSvg,
  walking: WalkingSvg,
  core: CoreSvg,
  hip: HipSvg,
  ankle: AnkleSvg,
  shoulder: ShoulderSvg,
  general: GeneralSvg,
};

export function ExerciseIllustration({ name, className }: { name: string; className?: string }) {
  const category = getExerciseCategory(name);
  const colors = CATEGORY_COLORS[category];
  const SvgComponent = SVG_MAP[category];

  return (
    <div className={`flex items-center justify-center rounded-xl bg-gradient-to-br ${colors.bg} ${className ?? ""}`}>
      <div className="h-3/4 w-3/4">
        <SvgComponent color={colors.fg} />
      </div>
    </div>
  );
}

const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  stretching: "Stretch",
  strength: "Strength",
  balance: "Balance",
  walking: "Gait",
  core: "Core",
  hip: "Hip",
  ankle: "Ankle",
  shoulder: "Upper Body",
  general: "Exercise",
};

export function getExerciseCategoryLabel(name: string): string {
  return CATEGORY_LABELS[getExerciseCategory(name)];
}
