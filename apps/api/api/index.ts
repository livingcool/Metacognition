import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Triggering dev server restart to pick up AI package changes v3 (Final Fix)

// Load API-local .env first (has service role key), then fallback to root .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

/** MIRROR ENGINE RESTART: 2026-04-01T19:10:00Z **/
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import {
  SpeechConfig,
  AudioConfig,
  AudioInputStream,
  SpeechRecognizer,
  ResultReason,
  RecognitionResult,
} from "microsoft-cognitiveservices-speech-sdk";
import { mirrorAI } from "@mirror/ai";
import { supabase, supabaseAdmin } from "@mirror/db";
import type { Database } from "@mirror/db";
import { Webhook } from "svix";
import type {
  Message,
  CognitiveProfile,
  ContextPackage,
  Decision,
  Session,
  DNAScore,
  ChoiceCard,
} from "@mirror/types";

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const port = process.env.PORT || 3005;

// 1. GLOBAL MIDDLEWARE
const whitelist = [
  "mirror.rootedai.co.in",
  "https://mirror.rootedai.co.in",
  "http://localhost:3000",
];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow: boolean) => void,
  ) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    const allowed = whitelist.some((w) => origin.includes(w));
    if (allowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Rejected origin: ${origin}`);
      callback(new Error("Not allowed by CORS"), false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "clerk-db-jwt",
  ],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions) as any); // Explicitly handle OPTIONS preflight for all routes
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.use(morgan("dev"));
app.use(express.json());

// Monitoring
app.get("/health", (req, res) =>
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() }),
);

// Global routes (moved /api below its declaration)

/**
 * CLERK WEBHOOK HANDLER
 * Initializes user and cognitive profile on signup.
 */
app.post("/api/webhooks/clerk", express.json(), async (req, res) => {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    return res.status(500).json({ error: "Missing CLERK_WEBHOOK_SECRET" });
  }

  const payload = JSON.stringify(req.body);
  const headers = req.headers;

  const svix_id = headers["svix-id"] as string;
  const svix_timestamp = headers["svix-timestamp"] as string;
  const svix_signature = headers["svix-signature"] as string;

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: "Missing svix headers" });
  }

  const wh = new Webhook(SIGNING_SECRET);
  let evt: {
    type: string;
    data: { id: string; email_addresses?: Array<{ email_address?: string }> };
  };

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as typeof evt;
  } catch (err: any) {
    console.error("[Webhook] Verification failed:", err.message);
    return res.status(400).json({ error: "Invalid signature" });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === "user.created") {
    const email = evt.data.email_addresses?.[0]?.email_address ?? "no-email";
    console.log(`[Webhook] User created: ${id} (${email})`);

    if (supabaseAdmin) {
      // 1. Sync User
      const { error: userError } = await (supabaseAdmin as any)
        .from("users")
        .upsert({ id, email });

      if (userError) console.error("[Webhook] DB User Error:", userError);

      // 2. Init Cognitive Profile
      const { error: profileError } = await (supabaseAdmin as any)
        .from("cognitive_profiles")
        .insert({
          user_id: id,
          dominant_patterns: [],
          dna_history: [],
        });

      if (profileError)
        console.error("[Webhook] DB Profile Error:", profileError);
    }
  }

  return res.status(200).json({ success: true });
});

// Standard JSON parsing for other routes
app.use(express.json());

// 2. HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0-alpha",
    service: "@mirror/api",
  });
});

// 3. API ROUTER
const apiRouter = express.Router();

// 2. PRIMARY ROUTES
app.use("/api", apiRouter);

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
    .from("cognitive_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (profile) return profile;

  // 2. If not, check if user exists (clerk might have synced via webhook, or maybe not)
  const { data: user } = await (supabaseAdmin as any)
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (!user) {
    // Create skeleton user
    await (supabaseAdmin as any)
      .from("users")
      .upsert({ id: userId, email: `${userId}@placeholder.com` });
  }

  // 3. Create default profile
  const { data: newProfile, error: createError } = await (supabaseAdmin as any)
    .from("cognitive_profiles")
    .insert({
      user_id: userId,
      dominant_patterns: [],
      dna_history: [],
    })
    .select()
    .single();

  if (createError) {
    console.error("[API] Lazy Init Error:", createError);
    return null;
  }

  return newProfile;
}

/**
 * SESSION ROUTES
 */
apiRouter.get("/sessions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch sessions with the first reflection as a preview
    const { data: sessions, error } = await supabase
      .from("sessions")
      .select(
        `
                *,
                preview_msg:messages(content)
            `,
      )
      .eq("user_id", userId)
      .eq("messages.role", "assistant")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Flatten to include preview
    const formattedSessions = sessions.map((s: any) => ({
      ...s,
      preview: s.preview_msg?.[0]?.content || "Empty Neural State",
    }));

    res.json(formattedSessions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post("/session", async (req, res) => {
  try {
    const { userId, title = "New Reflection" } = req.body;
    console.log(`[API] Creating new session for user: ${userId}`);

    if (!userId) {
      console.error("[API] Missing userId in request body");
      return res.status(400).json({ error: "Missing userId" });
    }

    // Self-Healing Sync: Ensure user and profile exist even if webhook failed
    await getOrCreateProfile(userId);

    // Use supabaseAdmin (service role) to bypass RLS for server-side writes
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Admin client not configured" });
    }

    const { data: session, error } = await (supabaseAdmin as any)
      .from("sessions")
      .insert({
        user_id: userId,
        title,
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ success: true, sessionId: (session as any).id });
  } catch (error: any) {
    console.error("[API] Error creating session:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get("/session/:id/history", async (req, res) => {
  try {
    const { id } = req.params;
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", id)
      .order("created_at", { ascending: true });

    if (error) throw error;
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get("/session/:id/message", async (req, res) => {
  const { id } = req.params;
  const { text, userId, isChoice } = req.query;

  if (!text || !userId) {
    return res.status(400).json({ error: "Missing query parameters" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    // 1. Fetch Cognitive Profile (Lazy Init if needed)
    const profile = await getOrCreateProfile(userId as string);

    // 2. IMMEDIATE SAVE: Commit User Intent/Stitch BEFORE streaming
    // We use supabaseAdmin to ensure RLS doesn't block the server-side log.
    const { data: userMsg, error: userMsgError } = await (supabaseAdmin as any)
      .from("messages")
      .insert({
        session_id: id,
        role: "user",
        content: text as string,
      })
      .select()
      .single();

    if (userMsgError) {
      console.error("[API] Atomic Persistence Error (User):", userMsgError);
    }

    // 3. Fetch History (Up to 3 turns)
    const { data: history } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", id)
      .neq("id", userMsg?.id) // Don't include the message we just saved in "lastThreeTurns" as it's the current 'input'
      .order("created_at", { ascending: false })
      .limit(3);

    const context: ContextPackage = {
      input: text as string,
      sessionId: id,
      userId: userId as string,
      module: "canvas", // Default for alpha
      profile: profile as any as CognitiveProfile,
      lastThreeTurns: (history || []).reverse() as Message[],
      isChoiceReply: isChoice === "true",
      timestamp: new Date().toISOString(),
    };

    // 4. Reflect & Stream
    let finalResponse: any = {};
    for await (const chunk of mirrorAI.reflect(context)) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      finalResponse = { ...finalResponse, ...chunk };
    }

    // 5. RESILIENT SAVE & DNA UPDATE: Record Assistant Reflection & Bayesian Evolution
    if (finalResponse.reflection && supabaseAdmin) {
      // Await the assistant message save to prevent data loss in serverless
      const { error: assistantError } = await (supabaseAdmin as any)
        .from("messages")
        .insert({
          session_id: id,
          role: "assistant",
          content: finalResponse.reflection,
          metadata: {
            patternDetected: finalResponse.patternDetected?.name,
            dnaScores: finalResponse.dnaScores,
            question: finalResponse.question,
            choices: finalResponse.choices,
            nodes: finalResponse.nodes,
            thinkingRationale: finalResponse.thinkingRationale,
          },
        });

      if (assistantError) {
        console.error("[API] Persistence Error (Assistant):", assistantError);
      }

      // Perform Bayesian Micro-Update to Cognitive Profile DNA
      if (finalResponse.dnaScores) {
        const currentDNA = profile?.dna_history || [];
        const newScore = {
          ...finalResponse.dnaScores,
          timestamp: new Date().toISOString(),
        };

        // Keep last 50 scores for the moving average radar
        const updatedDNA = [newScore, ...currentDNA].slice(0, 50);

        await (supabaseAdmin as any)
          .from("cognitive_profiles")
          .update({
            dna_history: updatedDNA,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        console.log(`[API] Bayesian Evolution complete for ${userId}`);
      }
    }

    res.write("event: end\ndata: {}\n\n");
    res.end();
  } catch (error: any) {
    console.error("[API] Streaming Error:", error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

apiRouter.post("/session/:id/choice", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, choiceId, text } = req.body;

    if (!userId || !choiceId)
      return res.status(400).json({ error: "Missing choice data" });

    console.log(`[API] Choice selected: ${choiceId} for session ${id}`);

    // Record choice in session metadata
    const { data: lastMsg } = await (supabase as any)
      .from("messages")
      .select("*")
      .eq("session_id", id)
      .eq("role", "assistant")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (lastMsg) {
      await (supabase as any)
        .from("messages")
        .update({
          metadata: {
            ...(lastMsg as any).metadata,
            selectedChoiceId: choiceId,
          },
        })
        .eq("id", lastMsg.id);
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * CALIBRATION ENGINE: LOG DECISION
 */
apiRouter.post("/decisions", async (req, res) => {
  try {
    const { userId, description, predictedConfidence, assumptions } = req.body;
    
    if (!userId || !description) {
      return res.status(400).json({ error: "Missing required decision fields" });
    }

    console.log(`[API] Logging new decision for user ${userId}: ${description}`);

    const { data, error } = await (supabaseAdmin as any)
      .from("decisions")
      .insert({
        user_id: userId,
        description,
        predicted_confidence: predictedConfidence || 50,
        assumptions: assumptions || [],
        status: "pending"
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, decisionId: data.id });
  } catch (error: any) {
    console.error("[API] Decision Logging Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * CALIBRATION ENGINE: GET PENDING
 */
apiRouter.get("/decisions/:userId/pending", async (req, res) => {
  try {
    const { userId } = req.params;
    const { data: decisions, error } = await supabase
      .from("decisions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(decisions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * CALIBRATION ENGINE: RESOLVE DECISION
 * Updates decision status and recalibrates the user's cognitive profile.
 */
apiRouter.post("/decision/:id/resolve", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, actualOutcome, outcomeType } = req.body; // outcomeType: 'positive' | 'negative' | 'neutral'

    if (!userId || !actualOutcome) {
      return res.status(400).json({ error: "Missing resolution data" });
    }

    console.log(`[API] Resolving decision ${id} for user ${userId}`);

    // 1. Fetch the original decision to get predicted confidence
    const { data: decision, error: fetchError } = await (supabaseAdmin as any)
      .from("decisions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !decision) {
      throw new Error("Decision not found or access denied");
    }

    // 2. Calculate Calibration Error
    // Simplified logic: If outcome is positive, 'reality' is 100. If negative, 0.
    const realityValue =
      outcomeType === "positive" ? 100 : outcomeType === "negative" ? 0 : 50;
    const calibrationError = Math.abs(
      decision.predicted_confidence - realityValue,
    );

    // 3. Update Decision
    await (supabaseAdmin as any)
      .from("decisions")
      .update({
        status: "resolved",
        actual_outcome: actualOutcome,
        calibration_error: calibrationError,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", id);

    // 4. Update User's Calibration Score (Moving average logic)
    const { data: profile } = await (supabaseAdmin as any)
      .from("cognitive_profiles")
      .select("calibration_score")
      .eq("user_id", userId)
      .single();

    if (profile) {
      const currentScore = profile.calibration_score || 50;
      // Weigh the new error (smoothing factor 0.2)
      // A 'perfect' score is 100 (0 error). A 'bad' score is 0 (100 error).
      const newScoreContribution = 100 - calibrationError;
      const updatedScore = Math.round(
        currentScore * 0.8 + newScoreContribution * 0.2,
      );

      await (supabaseAdmin as any)
        .from("cognitive_profiles")
        .update({
          calibration_score: updatedScore,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
    }

    res.json({
      success: true,
      calibrationError,
      newScore: profile?.calibration_score,
    });
  } catch (error: any) {
    console.error("[API] Resolution Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PHASE 3: LONGITUDINAL TRENDS
 * Returns snapshots for the last 30 days.
 */
apiRouter.get("/profile/:userId/trends", async (req, res) => {
  try {
    const { userId } = req.params;
    const { data: snapshots, error } = await supabase
      .from("daily_cognitive_snapshots")
      .select("*")
      .eq("user_id", userId)
      .order("snapshot_date", { ascending: true })
      .limit(30);

    if (error) throw error;
    res.json(snapshots);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post("/session/:id/end", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    console.log(`[API] Cleaning up session ${id}...`);

    // Trigger Layer 6 Write-back (Async)
    mirrorAI.closeSession(userId, id).catch((err) => {
      console.error("[API] Memory Write-back Error:", err);
    });

    const { error } = await (supabase as any)
      .from("sessions")
      .update({ status: "completed", ended_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * SUBMIT SESSION FEEDBACK
 * Records user impact and satisfaction.
 */
apiRouter.post("/session/:id/feedback", async (req, res) => {
  try {
    const { id } = req.params;
    const { impact, resolved, rating } = req.body;

    console.log(`[API] Recording feedback for session ${id}:`, {
      impact,
      resolved,
      rating,
    });

    const { data: session, error: fetchError } = await (supabaseAdmin as any)
      .from("sessions")
      .select("metadata")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    const updatedMetadata = {
      ...(session.metadata || {}),
      feedback: {
        impact,
        resolved,
        rating,
        timestamp: new Date().toISOString(),
      },
    };

    const { error: updateError } = await (supabaseAdmin as any)
      .from("sessions")
      .update({
        metadata: updatedMetadata,
        status: "completed",
        ended_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) throw updateError;

    res.json({ success: true });
  } catch (error: any) {
    console.error("[API] Feedback Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PROFILE ROUTES
 */
apiRouter.get("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await getOrCreateProfile(userId);
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * VOICE TRANSCRIBE (Azure Speech)
 * Uses Azure Speech-to-Text for transcription.
 */
apiRouter.post("/voice/transcribe", upload.single("file"), async (req, res) => {
  try {
    console.log("[API] Transcribing voice input (Azure Speech)...");

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const speechConfig = SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY!,
      process.env.AZURE_SPEECH_REGION!,
    );
    speechConfig.speechRecognitionLanguage = "en-US";

    const audioBuffer = req.file.buffer;
    const arrayBuffer = new Uint8Array(audioBuffer).buffer;
    const pushStream = AudioInputStream.createPushStream();
    pushStream.write(arrayBuffer as ArrayBuffer);
    pushStream.close();

    const audioInput = AudioConfig.fromStreamInput(pushStream);
    const recognizer = new SpeechRecognizer(speechConfig, audioInput);

    const result = await new Promise<RecognitionResult>((resolve, reject) => {
      recognizer.recognized = (_s, e) => {
        if (e.result.reason === ResultReason.RecognizedSpeech) {
          resolve(e.result);
        } else if (e.result.reason === ResultReason.NoMatch) {
          resolve({
            text: "",
            reason: ResultReason.NoMatch,
          } as RecognitionResult);
        }
      };
      recognizer.canceled = (_s, e) => {
        reject(new Error(e.errorDetails));
      };
      recognizer.startContinuousRecognitionAsync();
    });

    const transcript = result.text || "";
    console.log(
      `[API] Azure Speech Success. Transcript length: ${transcript.length}`,
    );

    if (!transcript) {
      console.warn("[API] Azure returned empty transcript");
    }

    res.json({ text: transcript });
  } catch (error: any) {
    console.error("[API] Azure Speech Error:", {
      message: error.message,
    });
    res.status(500).json({
      error: "Transcription Failed",
      details: error.message,
    });
  }
});

// 4. ERROR HANDLING
app.use(((err, req, res, next) => {
  console.error("🔥 [API] Global Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
    stack: err.stack,
    context: "Global Handler",
  });
}) as express.ErrorRequestHandler);

// 4. SERVER STARTUP
if (process.env.NODE_ENV !== "production") {
  app.listen(Number(port), "0.0.0.0", () => {
    console.log(`🚀 Mirror API live at http://0.0.0.0:${port}`);
    console.log(`📡 Use http://localhost:${port}/api for services`);
  });
}

export default app;
