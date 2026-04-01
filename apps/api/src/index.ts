import * as dotenv from 'dotenv';
import path from 'path';
// Triggering dev server restart to pick up AI package changes v3 (Final Fix)

// Load API-local .env first (has service role key), then fallback to root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

/** MIRROR ENGINE RESTART: 2026-04-01T19:10:00Z **/
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import { mirrorAI } from '@mirror/ai';
import { supabase, supabaseAdmin } from '@mirror/db';
import { Webhook } from 'svix';
import { Message, CognitiveProfile, ContextPackage } from '@mirror/types';

const upload = multer({ storage: multer.memoryStorage() });

const app: express.Express = express();
const port = process.env.PORT || 3005;

// 1. GLOBAL MIDDLEWARE
app.use(cors());
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(morgan('dev'));
app.use(express.json());

// Monitoring
app.get('/health', (req: Request, res: Response) => res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() }));

// Global routes (moved /api below its declaration)

/**
 * CLERK WEBHOOK HANDLER
 * Initializes user and cognitive profile on signup.
 */
app.post('/api/webhooks/clerk', express.json(), async (req: Request, res: Response) => {
    const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!SIGNING_SECRET) {
        return res.status(500).json({ error: 'Missing CLERK_WEBHOOK_SECRET' });
    }

    const payload = JSON.stringify(req.body);
    const headers = req.headers;

    const svix_id = headers['svix-id'] as string;
    const svix_timestamp = headers['svix-timestamp'] as string;
    const svix_signature = headers['svix-signature'] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json({ error: 'Missing svix headers' });
    }

    const wh = new Webhook(SIGNING_SECRET);
    let evt: any;

    try {
        evt = wh.verify(payload, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        });
    } catch (err: any) {
        console.error('[Webhook] Verification failed:', err.message);
        return res.status(400).json({ error: 'Invalid signature' });
    }

    const { id } = evt.data;
    const eventType = evt.type;

    if (eventType === 'user.created') {
        const email = evt.data.email_addresses[0]?.email_address;
        console.log(`[Webhook] User created: ${id} (${email})`);

        if (supabaseAdmin) {
            // 1. Sync User
            const { error: userError } = await supabaseAdmin
                .from('users')
                .upsert({ id, email });

            if (userError) console.error('[Webhook] DB User Error:', userError);

            // 2. Init Cognitive Profile
            const { error: profileError } = await supabaseAdmin
                .from('cognitive_profiles')
                .insert({
                    user_id: id,
                    dominant_patterns: [],
                    dna_history: []
                });

            if (profileError) console.error('[Webhook] DB Profile Error:', profileError);
        }
    }

    return res.status(200).json({ success: true });
});

// Standard JSON parsing for other routes
app.use(express.json());

// 2. HEALTH CHECK
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0-alpha',
        service: '@mirror/api'
    });
});

// 3. API ROUTER 
const apiRouter = express.Router();

// 2. PRIMARY ROUTES
app.use('/api', apiRouter);

/**
 * INITIALIZE SESSION
 */

/**
 * LAZY PROFILE INIT HELPER
 * Ensures user and profile exist even if webhook skipped.
 */
async function getOrCreateProfile(userId: string) {
    if (!supabaseAdmin) return null;

    // 1. Check if profile exists
    const { data: profile, error } = await supabaseAdmin
        .from('cognitive_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (profile) return profile;

    // 2. If not, check if user exists (clerk might have synced via webhook, or maybe not)
    const { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (!user) {
        // Create skeleton user
        await supabaseAdmin.from('users').upsert({ id: userId, email: `${userId}@placeholder.com` });
    }

    // 3. Create default profile
    const { data: newProfile, error: createError } = await supabaseAdmin
        .from('cognitive_profiles')
        .insert({
            user_id: userId,
            dominant_patterns: [],
            dna_history: []
        })
        .select()
        .single();

    if (createError) {
        console.error('[API] Lazy Init Error:', createError);
        return null;
    }

    return newProfile;
}

/**
 * SESSION ROUTES
 */
apiRouter.get('/sessions/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        
        // Fetch sessions with the first reflection as a preview
        const { data: sessions, error } = await supabase
            .from('sessions')
            .select(`
                *,
                preview_msg:messages(content)
            `)
            .eq('user_id', userId)
            .eq('messages.role', 'assistant')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Flatten to include preview
        const formattedSessions = sessions.map((s: any) => ({
            ...s,
            preview: s.preview_msg?.[0]?.content || 'Empty Neural State'
        }));

        res.json(formattedSessions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

apiRouter.post('/session', async (req: Request, res: Response) => {
    try {
        const { userId, title = 'New Reflection' } = req.body;
        console.log(`[API] Creating new session for user: ${userId}`);
        
        if (!userId) {
            console.error('[API] Missing userId in request body');
            return res.status(400).json({ error: 'Missing userId' });
        }

        // Lazy Init
        await getOrCreateProfile(userId);

        // Use supabaseAdmin (service role) to bypass RLS for server-side writes
        if (!supabaseAdmin) {
            return res.status(500).json({ error: 'Admin client not configured' });
        }

        const { data: session, error } = await supabaseAdmin
            .from('sessions')
            .insert({
                user_id: userId,
                title,
                status: 'active'
            })
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({ success: true, sessionId: session.id });
    } catch (error: any) {
        console.error('[API] Error creating session:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

apiRouter.get('/session/:id/history', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('session_id', id)
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json(messages);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

apiRouter.get('/session/:id/message', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { text, userId, isChoice } = req.query;

    if (!text || !userId) {
        return res.status(400).json({ error: 'Missing query parameters' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        // 1. Fetch Cognitive Profile (Lazy Init if needed)
        const profile = await getOrCreateProfile(userId as string);

        // 2. Fetch Last 3 Messages
        const { data: history } = await supabase
            .from('messages')
            .select('*')
            .eq('session_id', id)
            .order('created_at', { ascending: false })
            .limit(3);

        const context: ContextPackage = {
            input: text as string,
            sessionId: id,
            userId: userId as string,
            module: 'canvas', // Default for alpha
            profile: profile as CognitiveProfile,
            lastThreeTurns: (history || []).reverse() as Message[],
            isChoiceReply: isChoice === 'true',
            timestamp: new Date().toISOString()
        };

        // 3. Reflect & Stream
        let finalResponse: any = {};
        for await (const chunk of mirrorAI.reflect(context)) {
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
            finalResponse = { ...finalResponse, ...chunk };
        }

        // 4. Record Assistant Reflection (Once Complete)
        if (finalResponse.reflection) {
            await supabase.from('messages').insert({
                session_id: id,
                role: 'assistant',
                content: finalResponse.reflection,
                metadata: {
                    patternDetected: finalResponse.patternDetected?.name,
                    dnaScores: finalResponse.dnaScores,
                    question: finalResponse.question,
                    choices: finalResponse.choices,
                    thinkingRationale: finalResponse.thinkingRationale
                }
            });
        }

        // 4. Record User Message (Async)
        await supabase.from('messages').insert({
            session_id: id,
            role: 'user',
            content: text as string
        });

        res.write('event: end\ndata: {}\n\n');
        res.end();
    } catch (error: any) {
        console.error('[API] Streaming Error:', error);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
});

apiRouter.post('/session/:id/choice', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId, choiceId, text } = req.body;

        if (!userId || !choiceId) return res.status(400).json({ error: 'Missing choice data' });

        console.log(`[API] Choice selected: ${choiceId} for session ${id}`);

        // Record choice in session metadata or a specialized signals table if it existed
        // For now, we update the last assistant message in DB to reflect the selection
        const { data: lastMsg } = await supabase
            .from('messages')
            .select('*')
            .eq('session_id', id)
            .eq('role', 'assistant')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (lastMsg) {
            // 1. Update the message metadata
            await supabase
                .from('messages')
                .update({
                    metadata: { ...lastMsg.metadata, selectedChoiceId: choiceId }
                })
                .eq('id', lastMsg.id);

            // 2. Securely log the choice for long-term pattern analysis
            await supabase
                .from('user_choices')
                .insert({
                    user_id: userId,
                    session_id: id,
                    choice_id: choiceId,
                    choice_text: text
                });
        }

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

apiRouter.post('/session/:id/end', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        console.log(`[API] Cleaning up session ${id}...`);

        // Trigger Layer 6 Write-back (Async)
        mirrorAI.closeSession(userId, id).catch(err => {
            console.error('[API] Memory Write-back Error:', err);
        });

        const { error } = await supabase
            .from('sessions')
            .update({ status: 'completed', ended_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * PROFILE ROUTES
 */
apiRouter.get('/profile/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const profile = await getOrCreateProfile(userId);
        res.json(profile);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * VOICE PROXY (Sarvam AI)
 * Proxies multipart audio content to Sarvam translate api.
 */
apiRouter.post('/voice/transcribe', upload.single('file'), async (req: Request, res: Response) => {
    try {
        console.log('[API] Transcribing voice input (Sarvam Proxy)...');

        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const formData = new FormData();
        formData.append('file', req.file.buffer, {
            filename: 'input.webm',
            contentType: 'audio/webm',
        });
        formData.append('model', 'saaras:v3'); // Sarvam v3 engine 
        formData.append('mode', 'translate'); // Translate Indic to English directly

        if (!process.env.SARVAM_API_KEY) {
            console.error('[API] Missing SARVAM_API_KEY in .env');
            return res.status(500).json({ error: 'Transcription Service Unconfigured' });
        }

        const sarvamRes = await axios.post('https://api.sarvam.ai/speech-to-text', formData, {
            headers: {
                ...formData.getHeaders(),
                'api-subscription-key': process.env.SARVAM_API_KEY
            }
        });

        const transcript = sarvamRes.data.transcript || sarvamRes.data.text || '';
        console.log(`[API] Sarvam Success. Transcript length: ${transcript.length}`);

        if (!transcript) {
            console.warn('[API] Sarvam returned empty transcript:', sarvamRes.data);
        }

        res.json({ text: transcript });
    } catch (error: any) {
        const errorData = error.response?.data;
        console.error('[API] Sarvam Proxy Error:', {
            status: error.response?.status,
            data: errorData,
            message: error.message
        });
        res.status(500).json({
            error: 'Transcription Failed',
            details: errorData?.message || error.message
        });
    }
});

// 4. ERROR HANDLING
app.use(((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('🔥 [API] Global Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        stack: err.stack,
        context: 'Global Handler'
    });
}) as express.ErrorRequestHandler);

// 4. SERVER STARTUP
if (process.env.NODE_ENV !== 'production') {
    app.listen(Number(port), '0.0.0.0', () => {
        console.log(`🚀 Mirror API live at http://0.0.0.0:${port}`);
        console.log(`📡 Use http://localhost:${port}/api for services`);
    });
}

export default app;

