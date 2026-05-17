# SilentIntent — Submission Checklist

## Pre-recording

- [ ] `npm run build` passes
- [ ] `npm run verify:demo` passes
- [ ] `npm run dev` running cleanly, no console errors
- [ ] Browser zoom set to 100%
- [ ] Full screen, no dev tools open
- [ ] No console or terminal in the recording frame
- [ ] Demo reset before each take
- [ ] No system notifications enabled
- [ ] Mode badge visible and honest (`cached AI + mock proof`)
- [ ] No "live mainnet" claim anywhere

## Screenshots to capture (1440×900 or 1920×1080)

1. Initial state — Treasury $10,000, Hidden Policy commitment,
   Competitor Intelligence panel.
2. AI Extraction panel showing BrightReach facts with flagged chips.
3. Vendor A REJECTED card, Public Verifier showing rejection entry.
4. AI Extraction panel showing CleanList facts, all green.
5. Vendor B AUTHORIZED card, Treasury debited to $7,750, debit ghost
   line visible.
6. Public Verifier with both entries (rejected + authorized), proof
   timeline showing all checks.

## Video

- [ ] Length under 2:00
- [ ] Hits the truth-boundary beat ("AI extracts facts, Midnight
      verifies constraints")
- [ ] Doesn't claim live chain integration
- [ ] Final frame leaves the Public Verifier authorized card visible
- [ ] Uploaded somewhere stable (YouTube unlisted, Loom, or Devpost
      direct)

## Devpost

- [ ] Project name: SilentIntent
- [ ] Tagline: "Confidential spend authorization for AI agents."
- [ ] Track: DeFi primary, AI secondary
- [ ] Inspiration, What it does, How we built it, How we used Midnight,
      How we used AI sections filled in (see `docs/DEVPOST_DRAFT.md`)
- [ ] Challenges, Accomplishments, What we learned, What's next
- [ ] AI tool disclosure included
- [ ] Repo link added
- [ ] Video link added
- [ ] 6 screenshots uploaded
- [ ] Team members tagged (cross-check against the "Team contributions"
      section in `README.md` so on-Devpost order matches repo order)

## Repository

- [ ] README accurate (`README.md`)
- [ ] Contract spec present (`contracts/SilentIntentAuthorization.pseudo.compact.md`)
- [ ] License file present
- [ ] No `.env`, no API keys, no credentials staged
- [ ] No private strategy / judge Q&A drafts in any tracked file
- [ ] Repo set to public (if required by track)
- [ ] Latest commit on `main` is a clean state, not mid-experiment

## Final smoke test

- [ ] `npm install` works on a fresh clone
- [ ] `npm run dev` boots and loads in under 5 seconds
- [ ] Click Analyze BrightReach → Attempt Authorization → REJECTED
      visible
- [ ] Click Analyze CleanList → Authorize CleanList → AUTHORIZED
      visible, treasury at $7,750
- [ ] Reset returns to $10,000 USDC, no stale debit line, no stale log
