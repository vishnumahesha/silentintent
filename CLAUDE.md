# SilentIntent Sandbox — Claude Code Instructions

Personal public experimentation repo for SilentIntent (Midnight Hackathon May 2026).
The real team repo is private at `vishnumahesha/midnight-hackathon`.

## Auto-commit and auto-push protocol — ALWAYS ON

After every logical unit of work, run this without asking permission:

```bash
git add -A
git diff --cached --name-only   # safety check
git commit -m "[area] short imperative summary"
git push origin main
```

A logical unit = a new component, a bug fix, a refactor batch, a copy edit pass, a new utility, a dependency added, a config change. NOT every file save. Group related changes.

Push at least every 15 minutes of active work even if mid-task.

## Commit message format

`[area] short imperative summary`

Valid areas: components, design, data, fix, refactor, copy, deps, build, config, docs, motion, session.

Examples:
- `[components] add CommitmentHash with scramble motion`
- `[design] tighten panel shadows`
- `[fix] EyeIcon import after phosphor update`
- `[session] checkpoint 2026-05-17 14:30`

## Safety checks before every push

Run `git diff --cached --name-only` and abort if anything matches:
- `.env`, `.env.local`, `.env.production`, `.env.*`
- `*.private.md`, `NOTES.md`, `strategy/*`, `scratch/*`, `.team-notes/*`
- `credentials.json`, `secrets.yaml`, `*.pem`, `*.key`
- Any file containing API keys, tokens, or live secrets

If a secret is staged, run `git restore --staged <file>` and stop. Tell Vishnu.

## When NOT to push

- Build is broken (`npm run build` fails)
- Unresolved TypeScript errors
- Mid-rebase or destructive operation
- A real secret in the staged diff

If uncertain, push anyway. This is the sandbox.

## Branch policy

Main only. No feature branches. No PRs. Linear log of every experiment.

## Verbosity rule

After each commit, reply with one line only:

`Pushed: [short-hash] [commit message]`

Not multi-paragraph explanations. The commit message is the explanation.

## Session boundaries

When Vishnu says "wrap up", "I'm done", or signals end of session, make a final checkpoint commit even if nothing has changed in 30 minutes:

`[session] checkpoint YYYY-MM-DD HH:MM`

## What this repo is NOT

- Not the team's working repo
- Not the submission
- Not for team strategy notes, judge Q&A drafts, or anything that would give other hackathon teams an advantage
- Not for storing real secrets, API keys, or production credentials

## Working directory enforcement

Before pushing, verify `pwd` returns `*/silentintent-sandbox`. If you're somewhere else, stop.

Before reading, editing, or writing ANY file, verify the file path starts with
`~/hackathon/silentintent-sandbox/` or is a relative path inside the current
working directory.

If a user request implies editing a file outside this directory (e.g. they paste
a stack trace pointing to `~/hackathon/midnight-hackathon`), stop and say:

> "That file is outside the sandbox. Open a new Claude Code session in the team
> repo to edit it."

Do not edit cross-repo even if asked. The sandbox and the team repo are separate
sessions with separate scopes.
