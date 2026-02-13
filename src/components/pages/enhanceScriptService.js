// ============================================
// ENHANCE SCRIPT SERVICE — Gemini AI Integration
// ============================================
//
// WHAT THIS MODULE DOES:
//   Sends a user's speech script to Google Gemini AI and receives
//   a structured enhancement including improved text, key points,
//   memory anchors, flow structure, and modulation notes.
//
// WHY IT EXISTS:
//   Separates AI communication logic from UI components.
//   This keeps TeleprompterBox.js focused on rendering and state,
//   while this module handles prompt engineering, API calls,
//   response parsing, and error handling.
//
// WHEN IT RUNS:
//   Called by TeleprompterBox when the user clicks "Enhance Script".
//   Returns a structured object or throws a descriptive error.
//

import { GoogleGenAI } from "@google/genai";

// ============================================
// GEMINI PROMPT SECTION
// ============================================
//
// WHAT IS SENT TO GEMINI:
//   The user's raw speech/presentation script as plain text.
//
// WHY THIS PROMPT STRUCTURE:
//   - We explicitly request JSON-only output (no markdown fences)
//   - We define the exact schema Gemini must follow
//   - We include modulation tags ([PAUSE], [SLOW], [FAST], [EMPHASIZE])
//     so the enhanced script can drive visual cues in the teleprompter
//   - We ask for key_points, memory_summary, flow_structure, and
//     modulation_notes to populate the review panels
//
// The prompt is intentionally detailed to reduce hallucination
// and ensure the AI returns parseable structured data.

/**
 * buildPrompt — Constructs the Gemini prompt for script enhancement.
 *
 * WHAT THIS FUNCTION DOES:
 *   Wraps the user's script inside a carefully engineered prompt
 *   that instructs Gemini to return structured JSON.
 *
 * WHY IT EXISTS:
 *   Centralizes prompt logic so it can be tuned independently
 *   of the API call mechanism.
 *
 * WHEN IT RUNS:
 *   Called internally by enhanceScriptWithGemini() before the API call.
 *
 * @param {string} script — The user's raw script text
 * @returns {string} — The full prompt string to send to Gemini
 */
function buildPrompt(script) {
    return `You are an expert speech coach and communication strategist.

I will give you a speech/presentation script. Your job is to enhance it for a speaking rehearsal system.

RULES:
1. Return ONLY valid JSON. No markdown fences, no explanation, no extra text.
2. Follow the exact schema below.
3. In "enhanced_script", embed modulation tags where appropriate:
   - [PAUSE] — insert a brief pause for dramatic effect
   - [SLOW] — slow down delivery for emphasis
   - [FAST] — speed up for energetic sections
   - [EMPHASIZE] — stress the following phrase strongly
4. Keep the original meaning intact. Improve clarity, flow, and impact.
5. "key_points" — extract 3-6 core messages from the script.
6. "memory_summary" — create 3-5 short memory anchors (mnemonics or phrases that help the speaker remember the flow).
7. "flow_structure" — break the script into logical sections (e.g., "Opening Hook", "Core Argument", "Call to Action").
8. "modulation_notes" — give 3-5 delivery tips (pacing, tone, energy advice).

REQUIRED JSON SCHEMA:
{
  "enhanced_script": "string (the full enhanced script with modulation tags)",
  "key_points": ["string", "string", "..."],
  "memory_summary": ["string", "string", "..."],
  "flow_structure": ["string", "string", "..."],
  "modulation_notes": ["string", "string", "..."]
}

HERE IS THE SCRIPT TO ENHANCE:
"""
${script}
"""

Remember: Return ONLY the JSON object. Nothing else.`;
}

// ============================================
// RESPONSE VALIDATION SECTION
// ============================================
//
// After Gemini responds, we must verify:
//   1. The response is valid JSON (not markdown or prose)
//   2. All required keys exist
//   3. Each key has the correct type (string or string[])
//
// If validation fails, we throw a descriptive error rather
// than letting malformed data propagate into the UI.

/**
 * validateResponse — Ensures the Gemini response matches our expected schema.
 *
 * WHAT THIS FUNCTION DOES:
 *   Checks that the parsed JSON has all required fields with correct types.
 *
 * WHY IT EXISTS:
 *   AI responses can be unpredictable. This gate prevents malformed
 *   data from reaching the UI and causing render errors.
 *
 * WHEN IT RUNS:
 *   Called internally by enhanceScriptWithGemini() after JSON.parse succeeds.
 *
 * @param {object} data — The parsed response object
 * @throws {Error} — If any required field is missing or has the wrong type
 */
function validateResponse(data) {
    // Required string field
    if (typeof data.enhanced_script !== "string" || data.enhanced_script.trim() === "") {
        throw new Error("Validation failed: 'enhanced_script' must be a non-empty string.");
    }

    // Required array fields
    const arrayFields = ["key_points", "memory_summary", "flow_structure", "modulation_notes"];
    for (const field of arrayFields) {
        if (!Array.isArray(data[field])) {
            throw new Error(`Validation failed: '${field}' must be an array.`);
        }
        if (data[field].length === 0) {
            throw new Error(`Validation failed: '${field}' must not be empty.`);
        }
        // Ensure every element is a string
        for (let i = 0; i < data[field].length; i++) {
            if (typeof data[field][i] !== "string") {
                throw new Error(`Validation failed: '${field}[${i}]' must be a string.`);
            }
        }
    }
}

// ============================================
// ERROR HANDLING SECTION
// ============================================
//
// This section handles:
//   1. Missing API key — tells the user to configure REACT_APP_GEMINI_API_KEY
//   2. Network failures — wraps fetch errors with user-friendly messages
//   3. Malformed AI response — catches JSON.parse failures and provides
//      the raw text for debugging
//   4. Validation failures — from validateResponse()
//   5. Empty/blank script — prevents wasted API calls
//
// All errors are thrown as standard Error objects with descriptive messages
// so the calling component can display them in the UI.

/**
 * enhanceScriptWithGemini — Main entry point for script enhancement.
 *
 * WHAT THIS FUNCTION DOES:
 *   Takes a raw script string, sends it to Google Gemini,
 *   parses and validates the response, and returns structured data.
 *
 * WHY IT EXISTS:
 *   This is the single point of contact between the UI and the AI.
 *   All prompt engineering, API communication, parsing, and validation
 *   happen here so the component stays clean.
 *
 * WHEN IT RUNS:
 *   When the user clicks "Enhance Script" in TeleprompterBox.
 *
 * @param {string} script — The user's raw speech script
 * @returns {Promise<object>} — The validated enhancement object:
 *   {
 *     enhanced_script: string,
 *     key_points: string[],
 *     memory_summary: string[],
 *     flow_structure: string[],
 *     modulation_notes: string[]
 *   }
 * @throws {Error} — Descriptive error for any failure scenario
 */
export async function enhanceScriptWithGemini(script) {
    // ── Guard: Empty script ──
    if (!script || script.trim().length === 0) {
        throw new Error("Cannot enhance an empty script. Please paste or upload your script first.");
    }

    // ── Guard: API key ──
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error(
            "Gemini API key not found. Please add REACT_APP_GEMINI_API_KEY to your .env file and restart the dev server."
        );
    }

    // ── Initialize Gemini client ──
    const ai = new GoogleGenAI({ apiKey });

    // ── Build prompt ──
    const prompt = buildPrompt(script);

    try {
        // ── API Call ──
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });

        // ── Extract text from response ──
        const rawText = response.text;

        if (!rawText || rawText.trim().length === 0) {
            throw new Error("Gemini returned an empty response. Please try again.");
        }

        // ── Parse JSON ──
        // Gemini sometimes wraps JSON in markdown code fences — strip them
        let cleanText = rawText.trim();
        if (cleanText.startsWith("```")) {
            // Remove opening fence (```json or ```)
            cleanText = cleanText.replace(/^```(?:json)?\s*\n?/, "");
            // Remove closing fence
            cleanText = cleanText.replace(/\n?```\s*$/, "");
        }

        let parsed;
        try {
            parsed = JSON.parse(cleanText);
        } catch (parseError) {
            console.error("Raw Gemini response (failed to parse):", rawText);
            throw new Error(
                "Gemini returned a response that could not be parsed as JSON. " +
                "This usually means the AI included extra text. Please try again."
            );
        }

        // ── Validate structure ──
        validateResponse(parsed);

        return parsed;

    } catch (error) {
        // Re-throw validation/parse errors as-is
        if (error.message.startsWith("Validation failed") ||
            error.message.startsWith("Gemini returned") ||
            error.message.startsWith("Cannot enhance")) {
            throw error;
        }

        // Wrap unexpected errors with context
        console.error("Gemini API error:", error);
        throw new Error(
            `Failed to enhance script: ${error.message || "Unknown error"}. Please check your internet connection and try again.`
        );
    }
}
