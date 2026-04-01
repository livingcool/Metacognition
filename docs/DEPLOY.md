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
2.  **Root Directory**: **LEAVE AS REPOSITORY ROOT `/`**. (Crucial for PNPM to see the lockfile).
3.  **Framework Preset**: Select **Next.js**.
4.  **Build Command Override**: `pnpm --filter @mirror/web build`.
5.  **Install Command Override**: **MUST SET TO `pnpm install`**.
6.  **Output Directory Override**: `apps/web/.next`.
7.  **Environment Variables**:
    *   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: From Clerk Dashboard.
    *   `CLERK_SECRET_KEY`: From Clerk Dashboard.
    *   `NEXT_PUBLIC_API_URL`: The URL of your deployed `apps/api`.
    *   `NEXT_PUBLIC_SUPABASE_URL`: From Supabase Settings.
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: From Supabase Settings.

### B. Deploying the API (`apps/api`)

1.  **Import Project**: Import the same repository again as a **separate** Vercel project.
2.  **Root Directory**: **LEAVE AS REPOSITORY ROOT `/`**.
3.  **Build Command Override**: `pnpm --filter @mirror/api build`.
4.  **Install Command Override**: **MUST SET TO `pnpm install`**.
5.  **Output Directory Override**: `apps/api/dist` (Vercel builds the serverless handler automatically, but this ensures a clean build path).
6.  **Environment Variables**:
    *   **GOOGLE_GENERATIVE_AI_API_KEY**: Your Gemini API key.
    *   **SUPABASE_URL**: From Supabase.
    *   **SUPABASE_SERVICE_ROLE_KEY**: **Urgent** for Bayesian archaeology writes.
    *   **SARVAM_API_KEY**: For voice-to-text processing.
    *   **CLERK_WEBHOOK_SECRET**: For user lifecycle sync.

## 3. Connecting the Frontend to the API

Once your `mirror-api` project is deployed, copy its production URL (e.g., `https://mirror-api.vercel.app`).

1.  Go to your **Frontend** Vercel project settings.
2.  Set `NEXT_PUBLIC_API_URL` to your API's production URL.
3.  Redeploy the frontend to ensure all requests hit the new live endpoint.

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
