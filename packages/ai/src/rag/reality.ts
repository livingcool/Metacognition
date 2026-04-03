import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * REALITY LAYER: TENSION ENGINE
 * Searches for counter-evidence or contradictory context for user assumptions.
 */
export class RealityLayer {
    private genAI: any;
    private model: any;

    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }

    /**
     * Searches for conflicting context.
     * Note: In production, this would use a real Search API like Tavily.
     * For this POC, we'll use Gemini to "simulated search" based on its latent knowledge,
     * reflecting the 'Reality' of the world.
     */
    async surfaceTension(assumption: string): Promise<string> {
        if (!assumption) return '';

        const prompt = `
        Task: Surface "Objective Tension" for the following user-held assumption.
        Assumption: "${assumption}"

        Search for:
        1. Peer-reviewed counter-arguments.
        2. Statistical anomalies.
        3. Historical precedents that contradict the assumption.
        4. Alternative explanatory models.

        Goal: Provide 1-2 sentences of high-tension, objective context that CHALLENGES the assumption without being confrontational.
        Frame it as: "Objective Reality signals: [data]"
        `;

        try {
            const result = await this.model.generateContent(prompt);
            return result.response.text();
        } catch (e) {
            console.error('[RealityLayer] Error surfacing tension:', e);
            return '';
        }
    }
}
