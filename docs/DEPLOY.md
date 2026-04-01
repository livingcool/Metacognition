# Deployment Guide: Mirror AI Metacognitive Protocol

This guide outlines the steps to deploy the Mirror AI monorepo to **Vercel** for live hosting.

## 1. Prerequisites

*   A **Vercel** account.
*   **Supabase** project (with `pgvector` enabled and migrations applied).
*   **Clerk** account (for authentication).
*   **Google Gemini API Key** (v1.5/2.5 flash access).

## 2. Vercel Monorepo Configuration

Since Mirror is a PNPM monorepo, you need to configure the specialized build settings for each application.

### A. Deploying the Frontend (`apps/web`)

1.  **Import Project**: Connect your Git repository to Vercel.
2.  **Root Directory**: Set this to `apps/web`.
3.  **Framework Preset**: Select **Next.js**.
4.  **Build Command**: `pnpm build` (Vercel automatically detects the monorepo root for workspace dependencies).
5.  **Output Directory**: `.next` (Default).
6.  **Environment Variables**:
    *   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: From Clerk Dashboard.
    *   `CLERK_SECRET_KEY`: From Clerk Dashboard.
    *   `NEXT_PUBLIC_API_URL`: The URL of your deployed `apps/api` (see below).
    *   `NEXT_PUBLIC_SUPABASE_URL`: From Supabase Settings.
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: From Supabase Settings.

### B. Deploying the API (`apps/api`)

Vercel can host the Express API as a series of Serverless Functions.

1.  **Import Project**: Import the same repository again as a *new* project.
2.  **Root Directory**: Set this to `apps/api`.
3.  **Build Command**: `pnpm build` (Ensure your `package.json` has a build script that compiles TS to JS).
4.  **Environment Variables**:
    *   `GOOGLE_GENERATIVE_AI_API_KEY`: Your Gemini API key.
    *   `SUPABASE_URL`: From Supabase.
    *   `SUPABASE_SERVICE_ROLE_KEY`: **Crucial** for Bayesian updates and archaeology writes.
    *   `PORT`: `3005` (or default).
    *   `CLERK_WEBHOOK_SECRET`: If you use Clerk sync webhooks.

## 3. Supabase Integration

Ensure your Supabase project has the latest migrations applied:
1. `supabase/migrations/20260331000000_initial_schema.sql`
2. `supabase/migrations/20260401000000_session_chunks_and_rpcs.sql`
3. `supabase/migrations/20260401010000_disable_rls_temporary.sql` (Adjust for production security).

## 4. Verification

Once deployed:
1.  Verify the Mirror Orb renders correctly (WebGL/Three.js support is standard on Vercel).
2.  Test a "Start Reflection" cycle to ensure the API -> Gemini -> Supabase pipeline is functional.
3.  Check the "Neural State" gallery to confirm session persistence.

---
*(Deployment Protocol v4.0.0-vercel)*
