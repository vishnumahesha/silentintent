# Midnight Tooling Check

Snapshot of the local environment relevant to compiling and running
Midnight / Compact artifacts. Captured at the start of the
Midnight-native bridge phase of the sandbox.

## Versions

| Tool | Version | Notes |
|---|---|---|
| Node | `v25.5.0` | Newer than Vercel's runtime default (24.x); fine locally. |
| npm | `11.8.0` | |
| Docker | not installed | Required for the Midnight proof server and local devnet images. |
| Compact CLI (`compact`) | not installed | Required to compile `contracts/SilentIntent.compact`. |
| Compact compiler (`compactc`) | not on PATH | Same. |

## Midnight tooling availability

| Tool | Status | Notes |
|---|---|---|
| Midnight Expert (Claude Code skill) | unknown | The session's available-skills list does not include a Midnight Expert skill. `/expert:doctor` not available in this environment. |
| Proof server | not tested | No Docker, so no proof server image can be pulled or run from this machine right now. |
| Local devnet | not tested | Same. |
| Wallet integration (Lace / Compact wallet) | not tested | Not wired in this sandbox. |

## Practical implication

The sandbox can:

- Write the contract source (`contracts/SilentIntent.compact`).
- Write the witness adapter and proof-input shapes that a real circuit
  would consume.
- Run a deterministic mock proof model so the UI behaves end-to-end.
- Verify the demo outcomes with `npm run verify:demo`.

The sandbox **cannot** today:

- Compile the Compact source on this machine (no `compact` / `compactc`).
- Run a Midnight proof server (no Docker).
- Stand up a local devnet.
- Sign with a wallet.

Those steps belong on a teammate machine with the Midnight CLI set up,
or in a CI environment with the Compact toolchain installed.

## What to install to lift these limits

1. Install Docker Desktop (Apple Silicon image).
2. Install the Midnight `compact` toolchain
   (`@midnight-ntwrk/compact-cli`, plus the binary install per the
   Midnight docs).
3. Pull the proof server image and confirm `compact --version`
   succeeds.

When those exist, retry compile + run from `contracts/SilentIntent.compact`
and update `docs/MIDNIGHT_STATUS.md` with results.
