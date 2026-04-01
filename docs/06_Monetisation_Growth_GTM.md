# Mirror — Monetisation, Growth and Go-to-Market Strategy
*The How of Building a Sustainable Business · v1.0*

---

## 0. Why This Document Exists

The five other pillars (SDLC, UX/UI, Tech Stack, Product Strategy, Architecture) define *what* Mirror is and *how* it is built. This document defines *how it grows* — how Mirror acquires users, converts them, retains them, and compounds into a defensible business. These questions are as important as the technical ones.

---

## 1. Monetisation Model — In Detail

### 1.1 Subscription Tiers

```
+-------------------+--------------------+------------------------------------+
| Tier              | Price              | Features                           |
+-------------------+--------------------+------------------------------------+
| Free              | $0/month           | 5 sessions/month                   |
|                   |                   | Canvas module only                  |
|                   |                   | Basic pattern detection             |
|                   |                   | No long-term memory (resets)        |
|                   |                   | No cognitive profile                |
+-------------------+--------------------+------------------------------------+
| Mirror            | $19/month          | Unlimited sessions                 |
|                   | ($190/year)        | All 3 modules (Canvas, X-ray,       |
|                   |                   | Devil's Advocate)                   |
|                   |                   | Full memory (persistent profile)    |
|                   |                   | Weekly deep review                  |
|                   |                   | Cognitive profile dashboard         |
|                   |                   | Growth timeline chart               |
+-------------------+--------------------+------------------------------------+
| Mirror Pro        | $49/month          | Everything in Mirror +              |
|                   | ($490/year)        | Priority access to best model       |
|                   |                   | Prediction tracking                 |
|                   |                   | Session export (PDF / markdown)     |
|                   |                   | Custom module creation              |
|                   |                   | Early access to new features        |
+-------------------+--------------------+------------------------------------+
| Teams             | $29/user/month     | Organisation accounts               |
|                   | (min 5 users)      | Team cognitive pattern analysis     |
|                   | ($290/yr/user)     | Coach dashboard view                |
|                   |                   | SAML SSO                            |
|                   |                   | Admin analytics                     |
+-------------------+--------------------+------------------------------------+
```

### 1.2 Revenue Modelling

```
Year 1 Targets:

  Conservative:
    500 Mirror tier subscribers      = $9,500/mo  = $114,000 ARR
    50 Mirror Pro subscribers        = $2,450/mo  = $29,400 ARR
    Total:                                          $143,400 ARR

  Base:
    1,000 Mirror + 150 Pro           = $26,350/mo = $316,200 ARR

  Optimistic (+Teams):
    1,500 Mirror + 300 Pro
    + 5 teams @ 10 users each        = $50,750/mo = $609,000 ARR

Unit Economics (Mirror tier baseline):
  ARPU:          $19/month
  LLM cost:      ~$0.02/session × 8 sessions/month = $0.16/month
  Infra cost:    ~$0.01/user/month (free tier covers first 1K users)
  Gross margin:  ($19 - $0.16 - $0.01) / $19 = 98.9%
```

### 1.3 Free Tier Strategy

The free tier is a conversion engine, not charity:
- **5 sessions** is enough to feel the value but not enough to build a real profile
- **No memory** means the free tier is permanently inferior — it cannot replicate what Mirror + provides
- **One module** limits exploration — X-ray and Devil's Advocate are the most powerful modes, behind the paywall
- **Conversion trigger:** After session 3, Mirror shows the user: "Your pattern is forming. Upgrade to remember it."

---

## 2. Go-to-Market Strategy

### 2.1 Phase 1 — Seeding (Months 1–3, Pre-Launch)

**Goal:** Get Mirror into the hands of 50 people who will talk about it authentically.

```
Tactic 1: Direct seeding (20 people)
  Target: Founders, VCs, coaches known to the team
  Approach: 1-on-1 demo + first session together
  Ask: Use it for 2 weeks, give us raw feedback

Tactic 2: Content seeding (10 essays)
  Write long-form essays on metacognition, cognitive biases,
  decision-making. Publish on Substack + LinkedIn.
  Topic examples:
    - "Why smart people make the same mistake twice"
    - "The calibration problem: how often are you right when you're certain?"
    - "Certainty surge: Kahneman's most underrated concept"
  These essays attract the exact user Mirror is built for.

Tactic 3: Community presence
  Post in: Indie Hackers, Build in Public Twitter/X, 
  Ness Labs community, LessWrong, Hacker News
  Show-and-tell format: "Building a cognitive mirror — here's what
  the architecture looks like, here's the first session output"
```

### 2.2 Phase 2 — Launch (Month 4–6)

**Goal:** 500 paying subscribers in 90 days of public launch.

```
Launch channels:

  Product Hunt (Day 1)
    Carefully coordinated: all 50 beta users upvote on launch day
    First comment from a real user about real pattern detected
    Target: Top 5 of the day

  Hacker News Show HN
    "Show HN: Mirror — a metacognition engine that builds a model
    of how you think over time, grounded in 500+ research papers"
    Technical audience, high quality early adopters

  LinkedIn essay series
    5 essays about real Mirror insights (anonymised):
    "What Mirror told a founder before he made a decision he regretted"
    Personal, specific, research-grounded

  Influencer partnerships (nano + micro)
    Target: coaches, productivity YouTubers, "thinking about thinking" content creators
    Not paid sponsorship — product gifting + authentic use
    3–5 creators in the productivity / decision-making space
```

### 2.3 Phase 3 — Growth (Month 7–12)

**Goal:** Sustainable organic growth loop. $100K ARR.

```
Primary growth loop:
  User gets a genuinely surprising insight from Mirror
    -> They share it (a screenshot of the pattern detected, or a quote)
    -> Their network asks "what is this?"
    -> Referral link in every Mirror output footer

  This is the only word-of-mouth mechanism that works for B2C AI tools:
  the output must be share-worthy, not just useful.

Secondary channels:
  SEO content targeting:
    "cognitive bias test" — 18,100 searches/month
    "metacognition tools" — 4,400 searches/month
    "decision making AI" — 2,900 searches/month
    "confirmation bias checker" — 1,600 searches/month

  Referral programme:
    Give 1 free month for every paying referral
    Tracked via unique referral links generated per user
```

---

## 3. Pricing Psychology

Three pricing decisions that matter:

1. **$19 not $20.** The Mirror tier must feel accessible, not enterprise. $20 feels corporate. $19 feels like a thoughtful product built by people who respect money.

2. **Annual discount at 2 months free.** $190/year vs. $228/year (12 months) = 2 months free. Increases LTV and reduces churn dramatically. Push annual hard on checkout.

3. **Teams priced per user, not flat.** Makes it easy to start small (5 users, $145/mo) and expand naturally. Avoids the "will we use all 50 seats?" objection.

---

## 4. Retention Strategy

The danger with Mirror is that users have a powerful first session, feel satisfied, and don't return. Retention is an active design problem.

### 4.1 The Weekly Review Hook

The single most powerful retention mechanism: **the weekly deep review**. Scheduled, delivered Sunday evening, requires zero effort from the user.

The weekly review email is not a summary — it is a Mirror session delivered to the inbox:
```
Subject: "Something Mirror noticed this week"
Body:
  This week's dominant pattern: Certainty surge (3 appearances)
  Your calibration this week: 0.71 (up from 0.61 last week)
  
  "Three times this week you expressed high confidence in an
  outcome before it was tested. In 2 of 3 cases, the outcome
  was different than predicted. Kahneman calls this System 1
  overreach — the pattern is consistent with your profile."
  
  → Open Mirror to explore this pattern [CTA]
```

### 4.2 Prediction Follow-up

When a user logs a prediction ("I'm certain this partnership will close by end of month"), Mirror creates a follow-up. 30 days later: "You logged a prediction. It's time to check in." This is a re-engagement mechanism that also builds the calibration dataset.

### 4.3 Pattern Milestones

Celebrate growth moments explicitly:
- "Your bias fingerprint changed this month — confirmation bias down 12%"
- "10 sessions complete. Your cognitive profile is now fully formed."
- "You've been using Mirror for 90 days. Here's your full growth report."

---

## 5. The Data Flywheel

This is Mirror's long-term moat, and it must be designed intentionally from day one.

```
More sessions
    |
    v
Better cognitive profiles (more confirmed signals)
    |
    v
More accurate pattern detection
    |
    v
More surprising + valuable insights
    |
    v
More sharing + word-of-mouth
    |
    v
More users
    |
    v
More sessions  (loop closes)
```

Additionally: Mirror's aggregate (fully anonymised) data on cognitive patterns across thousands of users becomes a research resource. This opens partnership opportunities with universities and research institutions — which in turn validates Mirror's research grounding, which becomes a marketing asset.

---

## 6. Privacy as a Feature

Mirror handles the most personal cognitive data in the world. Privacy cannot be an afterthought — it is a product feature and a sales argument:

- **The Mirror Pledge:** Public commitment on the website — "We will never sell, share, or use your cognitive data to train any AI model without your explicit opt-in."
- **Data portability:** Export your entire cognitive profile as JSON or PDF at any time, immediately
- **Right to delete:** Full account deletion removes all sessions, the cognitive profile, and all vector embeddings — within 24 hours, confirmed via email
- **No content in logs:** Mirror's analytics tracks pattern-level data (pattern X was surfaced), never session content
- **GDPR + DPDP compliance** from day one — not retrofitted at scale

---

## 7. Competitor Response Plan

When (not if) well-funded competitors build similar products:

| Our moat | Why it holds |
|---|---|
| Corpus depth | 500+ curated papers, quality-checked by humans, with bias taxonomy. Not replicable quickly. |
| Memory depth | A user with 50 sessions has a rich cognitive profile. Switching means losing all of that. |
| Research grounding | Every pattern cited. Users trust Mirror because they can verify the citation. Hard to fake. |
| Voice | Mirror's voice — specific, research-grounded, personalised — is a product quality that takes iteration to build. |
| Community | The early adopter community of serious thinkers is defensible if Mirror earns their genuine trust. |

The strategy when a big company enters: move faster on the dimensions they cannot move on (niche corpus depth, specific voice quality, trust with the serious thinker community).

---

## 8. Key Metrics Dashboard (What to Measure, Always)

```
North Star:
  % of users whose calibration score improves over 90 days

Acquisition:
  New signups per week (by channel)
  Free-to-paid conversion rate (target: 8-12%)
  Time to convert (target: within 14 days)

Engagement:
  Sessions per user per week (target: 2+)
  Choice card selection rate (target: 60%+)
  Voice input adoption (target: 30% of sessions)

Retention:
  7-day retention (target: 60%+)
  30-day retention (target: 50%+)
  90-day retention (target: 40%+)
  Monthly churn rate (target: <3%)

Revenue:
  MRR (Monthly Recurring Revenue)
  ARPU (Average Revenue Per User)
  LTV (Lifetime Value, target: $200+ for Mirror tier)
  CAC (Customer Acquisition Cost, target: <$30)
  LTV:CAC ratio (target: >6:1)

AI Quality:
  Pattern accuracy (user-reported, target: 75%+)
  LLM cost per session (target: <$0.02)
  First-token latency p95 (target: <2s)
```

---

*Mirror · Monetisation, Growth and Go-to-Market Strategy · v1.0 · March 2026*
*RootedAI — Metacognition AI · How the business grows*
