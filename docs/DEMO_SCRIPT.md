# SilentIntent — Demo Script

Target length: ~1:50. Voiceover, on-screen captions optional.

## 0:00 — Opener (5s)

> "This is SilentIntent, a Midnight hackathon project."

[Hero panel visible: "Confidential spend authorization for AI agents.
Private policy in. Public authorization out." Treasury reads $10,000
USDC.]

## 0:05 — The problem (15s)

> "AI agents are starting to spend company money. The choices today are
> a trusted backend, or a public chain where every line of the buyer's
> procurement policy leaks to every vendor that scrapes it."

[Hover over Competitor Intelligence panel. Hidden Policy panel sits
beside it with redacted bars and a policy commitment.]

## 0:20 — Setup (15s)

> "Here a company AI agent has a hidden procurement policy for buying
> dental lead data. Budget, required credentials, and a forbidden
> reuse clause. Only the policy commitment is public."

[Camera lingers on Hidden Policy commitment hash.]

## 0:35 — Vendor A surface read (10s)

> "BrightReach Data looks like the obvious winner. $1,900, freshness
> verified, high volume."

[Click Analyze BrightReach Data.]

## 0:45 — Extraction (15s)

> "The AI extraction layer turns the proposal into structured offer
> facts. It flags `campaign_metadata_reuse` and `partner_enrichment`
> buried inside the proposal."

[AI Extraction panel reveals chips one by one. Flagged chips light up
red.]

## 1:00 — Proof rejects (15s)

> "We attempt spend authorization. The proof generates, and the
> `forbiddenTerm absent` check fails. The public sees the rejection
> and the commitments. The treasury stays at $10,000."

[Public Verifier shows REJECTED card with all four commitments. Proof
timeline shows the failing constraint highlighted red.]

## 1:15 — Vendor B (15s)

> "CleanList Pro is more expensive — $2,250 — but customer-siloed and
> does not reuse campaign outputs. We analyze, all four checks pass."

[Click Analyze CleanList Pro. Then Authorize CleanList Pro.]

## 1:30 — Authorization (10s)

> "The proof authorizes the spend. Treasury debits $2,250 to a vendor
> commitment. The public sees status, deal ID, price band, treasury
> action, and four commitments — nothing else."

[Treasury ticks down to $7,750. AUTHORIZED card appears.]

## 1:40 — Truth boundary + close (10s)

> "Midnight doesn't prove the AI interpreted English correctly. It
> proves the committed offer facts satisfy the committed policy.
> Production would use vendor-signed offer artifacts. Today, that's
> SilentIntent: private policy in, public authorization out."

[Truth badge visible. End on the Public Verifier authorized card.]

---

## Recording notes

- Browser zoom 100%, full screen, no dev tools, no console open.
- Reset the demo before recording.
- Run path manually rather than auto, so the rejection beat lands.
- Mute system notifications.
- If recording at 1080p, drop to 1440px viewport so the layout fills
  without horizontal scroll bars.
