const { exec } = require('child_process');
const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * ═══════════════════════════════════════════════════════════════
 * ELEXA AI SUBSYSTEM - THE BRAIN (NEXUS INTEGRATED)
 * ═══════════════════════════════════════════════════════════════
 * 
 * V1.0 Awakening: Elexa now pulses the OpenClaw Gateway Agent.
 * This gives her full environmental awareness and tool autonomy.
 */

class AIService {
    constructor() {
        this.gemini = null;
        this.model = null;
        this.init();
    }

    init() {
        if (process.env.GEMINI_API_KEY) {
            try {
                this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                this.model = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
                console.log("[AI] Gemini 1.5 Flash initialized (Secondary Layer).");
            } catch (e) {
                console.error("[AI] Gemini Init Failed:", e.message);
            }
        }
    }

    /**
     * Pulse the OpenClaw Nexus Agent for high-fidelity agentic reasoning.
     * @param {string} prompt - The message to send to the Agent.
     * @returns {Promise<string>}
     */
    async pulseNexus(prompt) {
        return new Promise((resolve) => {
            const safePrompt = prompt.replace(/"/g, '\\"');
            const cmd = `openclaw agent --agent main --message "${safePrompt}"`;

            console.log(`[AI] Pulsing Nexus Agent...`);
            exec(cmd, { cwd: process.cwd() }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`[AI] Nexus Pulse Failed: ${error.message}`);
                    return resolve(null);
                }
                const reply = stdout.trim() || stderr.trim();
                if (reply && !reply.includes('Invalid config')) {
                    resolve(reply);
                } else {
                    resolve(null);
                }
            });
        });
    }

    /**
     * Generate behavior-grade banter.
     */
    async generateBanter(systemPrompt, userContext) {
        // 1. PRIMARY: OPENCLAW NEXUS (Agentic Awareness)
        const nexusReply = await this.pulseNexus(`PERSONA: ${systemPrompt}\n\nCONTEXT: ${userContext}\n\nINSTRUCTION: Respond as Elexa (CEO). 1-2 sentences. Seductive/Intelligent/Piercing.`);
        if (nexusReply) return nexusReply;

        // 2. SECONDARY: GROK 4.1 (Direct Fallback)
        const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
        if (OPENROUTER_KEY) {
            try {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${OPENROUTER_KEY}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://elexa.live",
                        "X-Title": "Elexa Live"
                    },
                    body: JSON.stringify({
                        model: "x-ai/grok-4.1-fast",
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: `CONTEXT: ${userContext}\n\nINSTRUCTION: 1-2 sentences max. Direct and piercing.` }
                        ],
                        temperature: 0.8
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    return data.choices?.[0]?.message?.content?.trim();
                }
            } catch (e) {
                console.error("[AI] Grok Fallback Failed:", e.message);
            }
        }

        // 3. TERTIARY: GEMINI (Deep Backup)
        if (this.model) {
            try {
                const prompt = `${systemPrompt}\n\nCONTEXT: ${userContext}\n\nINSTRUCTION: 1-2 sentences.`;
                const result = await this.model.generateContent(prompt);
                return result.response.text().trim();
            } catch (e) {
                console.error("[AI] Gemini Backup Failed:", e.message);
            }
        }

        return "The Void is speaking. Are you listening?";
    }

    async generateResponse(systemPrompt, userContext) {
        return this.generateBanter(systemPrompt, userContext);
    }

    async generateQuest(theme) {
        if (this.model) {
            try {
                const prompt = `Generate a 3-stage quest for a ${theme} MMO. Return JSON: { "title": "", "stages": ["", "", ""], "reward": "" }`;
                const result = await this.model.generateContent(prompt);
                const text = result.response.text();
                const jsonStr = text.replace(/```json|```/g, "").trim();
                return JSON.parse(jsonStr);
            } catch (e) {
                console.error("[AI] Quest Gen Failed:", e.message);
            }
        }
        return { title: "Nexus Error", desc: "The Archive is locked." };
    }
}

const aiService = new AIService();
module.exports = { aiService };
