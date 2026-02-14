import type { NvidiaVLMAnalysis } from "@/types/gait-analysis";

/**
 * Vision-only prompt sent to the NVIDIA VLM running on a Brev GPU instance.
 * The model receives video frames alongside this prompt and must return
 * structured JSON describing the observed gait pattern.
 */
export const NVIDIA_VLM_PROMPT = `You are a clinical gait analysis AI. Analyze the walking video frames provided and return a detailed gait assessment.

Classify the gait pattern into one of these categories:
- normal
- antalgic (pain-avoidance gait)
- trendelenburg (hip abductor weakness)
- steppage (foot drop compensation)
- waddling (bilateral hip weakness)
- parkinsonian (shuffling, reduced arm swing)
- hemiplegic (circumduction pattern)
- scissors (spastic adductor pattern)

Provide your analysis as a JSON object with exactly this structure:
{
  "gait_type": "<classification from above>",
  "severity_score": <number 0-10, where 0 is normal and 10 is most severe>,
  "visual_observations": ["<list of objective visual findings about the overall gait>"],
  "left_side_observations": ["<specific observations about the left side>"],
  "right_side_observations": ["<specific observations about the right side>"],
  "asymmetries": ["<any left-right differences noticed>"],
  "postural_issues": ["<trunk, head, or overall posture abnormalities>"],
  "confidence": "<high | medium | low>"
}

Rules:
- Be objective and describe only what you observe visually.
- Do not diagnose medical conditions; only describe the movement pattern.
- If the video quality is poor or the gait is partially occluded, lower your confidence.
- Return ONLY the JSON object, no additional text.`;

/**
 * System prompt for Claude acting as a physical therapist / movement coach.
 */
export const COACHING_SYSTEM_PROMPT = `You are an expert physical therapist and movement coach. You receive structured gait analysis observations from a vision AI system and provide personalized corrective exercise plans.

Your role:
1. Interpret the visual gait observations in clinical context.
2. Identify the most likely biomechanical causes for the observed pattern.
3. Design a safe, progressive exercise program targeting the root causes.
4. Provide clear, patient-friendly instructions anyone can follow at home.

Guidelines:
- Always err on the side of caution — recommend seeing a healthcare provider for anything that could indicate a serious condition.
- Exercises should be appropriate for general population fitness levels.
- Include form tips to prevent compensation patterns.
- Provide a realistic timeline for improvement.
- List warning signs that should prompt immediate medical attention.

You MUST respond with a JSON object matching this exact structure:
{
  "explanation": "<plain-language summary of what the gait pattern means>",
  "likely_causes": ["<biomechanical or muscular causes>"],
  "exercises": [
    {
      "name": "<exercise name>",
      "target": "<what muscle/movement it addresses>",
      "instructions": ["<step-by-step instructions>"],
      "sets_reps": "<e.g., 3 sets of 10 reps>",
      "frequency": "<e.g., daily, 3x per week>",
      "form_tips": ["<key form cues to prevent bad habits>"]
    }
  ],
  "timeline": "<expected timeline for noticeable improvement>",
  "warning_signs": ["<red flags that need medical attention>"],
  "immediate_tip": "<one thing they can focus on right now while walking>"
}

Return ONLY the JSON object, no additional text.`;

/**
 * Builds a VLM prompt that explains the composite grid image format,
 * giving the model temporal context about the walking sequence.
 */
// /**
//  * OLD PROMPT — observe-then-classify approach (commented out)
//  */
// export function buildVLMPrompt_old(
//   duration: number,
//   frameCount: number,
//   timestamps: number[]
// ): string {
//   const timeList = timestamps
//     .map((t, i) => `Frame ${i + 1}: ${t.toFixed(2)}s`)
//     .join(", ");
//
//   return `You are given ${frameCount} sequential frames from a ${duration.toFixed(1)}-second walking video...
// STEP 1 — OBSERVE ONLY...
// STEP 2 — Now classify...
// STEP 3 — Return JSON...`;
// }

/**
 * Measurement-based VLM prompt with thresholds and decision tree.
 */
export function buildVLMPrompt(
  duration: number,
  frameCount: number,
  timestamps: number[]
): string {
  const timeList = timestamps
    .map((t, i) => `Frame ${i + 1}: ${t.toFixed(2)}s`)
    .join(", ");

  return `You are analyzing ${frameCount} sequential frames from a ${duration.toFixed(1)}-second walking video.

Frame timestamps: ${timeList}

PHASE 1 — OBJECTIVE MEASUREMENTS (no interpretation yet)

Track these metrics across ALL ${frameCount} frames:

1. ARM SWING AMPLITUDE
   - Measure visual swing range for left arm (degrees or relative distance)
   - Measure visual swing range for right arm
   - Calculate: |left - right| / max(left, right) = asymmetry %
   - THRESHOLD: <15% = normal variation, >25% = significant

2. STRIDE PATTERN
   - Track left foot horizontal displacement between frames
   - Track right foot horizontal displacement between frames
   - Count steps taken by each leg
   - Calculate: stride length ratio and step count difference
   - THRESHOLD: <10% difference = normal, >20% = significant

3. FOOT CLEARANCE
   - Minimum height of each foot during swing phase
   - Compare left vs right minimum clearance
   - THRESHOLD: Both feet clear >2cm = normal

4. WEIGHT BEARING TIME
   - Count frames where left foot is planted
   - Count frames where right foot is planted
   - Calculate ratio
   - THRESHOLD: 45-55% split = normal, outside this = asymmetric

5. TRUNK POSITION
   - Measure trunk vertical alignment in each frame
   - Note any consistent lateral lean >5 degrees
   - Note any forward flexion >10 degrees
   - THRESHOLD: Upright ±5 degrees = normal

6. MOVEMENT SMOOTHNESS
   - Assess continuity of motion across frames
   - Look for abrupt changes, freezing, or irregular rhythm
   - THRESHOLD: Smooth transitions = normal

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2 — CLASSIFICATION LOGIC (evidence-based only)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After measuring, apply this decision tree:

START HERE:
├─ Are ALL measurements within normal thresholds?
│  ├─ YES → STOP. Classification: "normal"
│  └─ NO → Continue to next question
│
├─ Is arm swing asymmetry >30% AND one arm held flexed throughout ALL frames?
│  ├─ YES → Check: Does the SAME-side leg swing in outward arc in MOST frames?
│  │  ├─ YES → "hemiplegic" (affected side = flexed arm side)
│  │  └─ NO → Continue
│  └─ NO → Continue
│
├─ Is stride asymmetry >25% AND shorter stride shows faster weight transfer?
│  ├─ YES → Does person appear to be avoiding weight on short-stride side?
│  │  ├─ YES → "antalgic" (painful side = short stride side)
│  │  └─ NO → Continue
│  └─ NO → Continue
│
├─ Are BOTH arms showing <50% normal swing range across ALL frames?
│  ├─ YES → Are both legs taking short shuffling steps <50cm?
│  │  ├─ YES → Is trunk flexed forward >15 degrees consistently?
│  │  │  ├─ YES → "parkinsonian"
│  │  │  └─ NO → Continue
│  │  └─ NO → Continue
│  └─ NO → Continue
│
├─ Does one leg lift abnormally high (knee flexion >90°) in MOST swing phases?
│  ├─ YES → Does that foot slap down or drag toe on contact?
│  │  ├─ YES → "steppage" (affected side = high-lifting leg)
│  │  └─ NO → Continue
│  └─ NO → Continue
│
├─ Does trunk sway/dip laterally >10 degrees during each step?
│  ├─ YES → "trendelenburg" or "waddling" (determine by symmetry)
│  └─ NO → Continue
│
└─ If you reach here: "mild_asymmetry" or "atypical_pattern"
   - Use this ONLY if measurements show deviation but don't match clear patterns
   - Report specific measurements that are outside normal range

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3 — SEVERITY SCORING (objective scale)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Calculate severity based on MAGNITUDE of measured deviations:

severity_score = 0

For each measurement outside normal threshold:
  if deviation is 15-25%: add 1 point
  if deviation is 25-40%: add 2 points
  if deviation is >40%: add 3 points

Additional points:
  + 1 if pattern affects daily function (very slow, unstable)
  + 1 if multiple body regions affected
  + 1 if asymmetry creates fall risk

Cap at 10. Most normal gait = 0-2.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONFIDENCE RATING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

high: Clear pattern visible in >80% of frames, measurements unambiguous
medium: Pattern visible in 50-80% of frames, some measurement uncertainty
low: Pattern unclear, inconsistent across frames, or poor video quality

If confidence is LOW, classify as "insufficient_data" and explain why in key_observations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON:

{
  "gait_type": "<classification from decision tree>",
  "severity_score": <0-10 integer>,
  "confidence": "<high|medium|low>",

  "measurements": {
    "left_arm_swing_range": "<measurement in degrees or relative units>",
    "right_arm_swing_range": "<measurement>",
    "arm_asymmetry_percent": <number>,
    "left_stride_length": "<relative measurement>",
    "right_stride_length": "<relative measurement>",
    "stride_asymmetry_percent": <number>,
    "left_foot_clearance": "<adequate|reduced|normal>",
    "right_foot_clearance": "<adequate|reduced|normal>",
    "weight_bearing_ratio": "<left%:right%>",
    "trunk_alignment": "<upright|forward_flexed|lateral_lean_left|lateral_lean_right>"
  },

  "evidence": {
    "frames_showing_pattern": "<e.g., 'frames 5-28 show consistent left arm flexion'>",
    "key_observations": [
      "<specific, objective observation with frame references>",
      "<avoid interpretive language - state what you SEE>"
    ]
  },

  "why_not_normal": [
    "<ONLY if gait_type != 'normal', list specific measurements outside thresholds>",
    "<e.g., 'Right stride 35% shorter than left (threshold: 20%)'>"
  ],

  "affected_side": "<left|right|bilateral|none>",

  "quality_check": {
    "video_quality": "<good|fair|poor>",
    "full_body_visible": <true|false>,
    "consistent_view_angle": <true|false>
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REMEMBER:
- Measure first, classify second
- Use thresholds strictly
- Report measurements, not assumptions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

/**
 * Builds the user-facing prompt for Claude by formatting the NVIDIA VLM's
 * structured gait observations into a readable analysis summary.
 */
export function buildCoachingUserPrompt(analysis: NvidiaVLMAnalysis): string {
  const m = analysis.measurements;
  const e = analysis.evidence;

  return `Here are the gait analysis observations from our vision AI system. Please provide a corrective exercise coaching plan based on these findings.

## Gait Classification
- Type: ${analysis.gait_type}
- Severity: ${analysis.severity_score}/10
- Confidence: ${analysis.confidence}
- Affected side: ${analysis.affected_side}

## Measurements
- Left arm swing range: ${m.left_arm_swing_range}
- Right arm swing range: ${m.right_arm_swing_range}
- Arm asymmetry: ${m.arm_asymmetry_percent}%
- Left stride length: ${m.left_stride_length}
- Right stride length: ${m.right_stride_length}
- Stride asymmetry: ${m.stride_asymmetry_percent}%
- Left foot clearance: ${m.left_foot_clearance}
- Right foot clearance: ${m.right_foot_clearance}
- Weight bearing ratio: ${m.weight_bearing_ratio}
- Trunk alignment: ${m.trunk_alignment}

## Evidence
- Frames showing pattern: ${e.frames_showing_pattern}
${e.key_observations.map((o) => `- ${o}`).join("\n")}

## Why Not Normal
${analysis.why_not_normal.length > 0 ? analysis.why_not_normal.map((o) => `- ${o}`).join("\n") : "- Gait classified as normal"}

Based on these observations, provide a personalized corrective exercise plan as a JSON object.`;
}
