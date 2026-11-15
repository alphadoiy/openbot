# OpenBot

Personal, noncommercial fork of `nightly-labs/openbot`, based on commit
`b476623a00dbc70f6c0ff3ba44b7257d6f417caf` (0.71.0).
Repository: <https://github.com/alphadoiy/openbot>. Branch: `personal/self-hosted`.

## Scope

This distribution is for one person working on their own computer. It needs no OpenBot account.
The account manager remains signed out. It does not restore a saved account session, call the
account health endpoint, request an email code, refresh a profile or register a cloud host.
Existing saved account files are left unchanged. This does not sign the user in as a fictional owner.

Language selection, model-provider setup and first-use permission guidance remain. Workspaces,
chats, files, routines and the embedded browser use the existing local backend. Signed-out
conversation and task read records use the existing local reader identity.

The shared policy is `packages/contracts/src/distribution.ts`:

- `accountEnabled: false`: no OpenBot sign-in, profile, mobile pairing or cloud WebRTC transport.
- `commerceEnabled: false`: no billing navigation, license purchase, cloud-server order or upsell.
  The included account service does not create Stripe billing or offer paid hosted servers.
- `desktopTelemetryEnabled: false`: desktop product analytics and anonymous failure reporting are off.
- `desktopUpdatesEnabled: false`: desktop application updates are off. Provider runtime updates
  still follow their existing sources.

The desktop can create password-owned child workspaces on the same computer. Their transport
stays on loopback. Local child rename, restart and deletion remain available. The base local
workspace has no published host identity, so its cloud identity editor, members, roles, audit,
website hosting, agent publication and remote installation controls do not show.

Phone access, remote team servers, hosted website publishing, official integration relays,
account-backed invitations and push notifications are outside this version. Existing protocol
adapters, account authorization, encrypted storage and Electron isolation remain in the source.
Billing contracts and migrations remain for compatibility; no user schema is removed.

## Run from source

Use Bun 1.4.2 and the repository's required Node version. From this checkout:

```sh
bun install --frozen-lockfile
bun run dev
```

The personal development runner starts the desktop app only. It does not start the account Worker
or Signal, load shared cloud secrets, run D1 migrations or seed a showcase account. Cloud and mobile
development harness commands fail with an explanation in this distribution.

The desktop startup prepares the pinned Computer Use driver in `build/cua-driver/`, as well as
the local voice runtime. These binary assets are not stored in Git. If a download fails, the app
still opens. Repair Computer Use with `bun run prepare:cua-driver`, then select Retry in its
settings panel. `bun run cua-driver:doctor` verifies which binary is selected. macOS Screen
Recording and Accessibility permissions must still be granted through the app and system settings.

Development data stays in `.openbot/profiles/` under this checkout, with a worktree-specific profile.
`OPENBOT_DEV_PROFILE_ROOT` can select another profile root. The application, executable and installer
show the name `OpenBot`. Packaged builds keep the existing `OpenBot Personal` data directory and
separate app ID, so this display-name change does not move data into the official app's directory.
On macOS and Linux, the startup name stays `OpenBot Personal` until `ready`, after Electron captures its
credential-store identity; the public name becomes `OpenBot` before application windows open. Workspaces, child-server files and
managed provider runtimes stay inside that profile. Existing OpenBot data is not imported.
A manually supplied `--user-data-dir` takes precedence.

Official installers in the upstream sections of README install the official app. Build a local
personal DMG with `bun run dist:mac`; generated images stay under `dist/` and are not stored in Git.
The local ARM64 image includes Computer Use and the voice runtime, uses a separate application ID,
and is not Developer ID signed or notarized. Its image checksum, resources and Electron security
fuses were checked; full Apple signature and application launch verification did not pass in the
restricted execution environment. The original Electron binary also exits with code 134 there.
See `dist/personal-package-report.json` for the local artifact report. Existing user data was not migrated.
Provider CLI logins can still use their provider's own user folders and credentials; profile isolation
does not copy or erase those folders.

## Checks

```sh
bun scripts/personal-account-smoke.ts
bun run typecheck:node
bun run typecheck:renderer
```

The service smoke check uses the real account manager and verifies genuine signed-out startup,
retry, rejection of cloud operations, zero account network/encryption calls and preservation of a
saved-session fixture. Its report is `.openbot-build/personal-account-smoke/report.json`.

Desktop end-to-end verification needs a development environment that can bind loopback ports.
The current execution environment rejects a listener on `127.0.0.1` with `EPERM`; no claim is made
that fresh-start UI, provider execution or packaged installation has been verified here.

## Costs and maintenance

No OpenBot account, Cloudflare account, mail server, domain, Signal or TURN deployment is needed
for this local version. The computer must remain running for tasks to run. Model subscriptions,
API charges, local-model hardware, visited websites and installed plugins keep their own requirements
and network behavior. Disabling OpenBot accounts does not make these services offline.

Keep `upstream` pointed at `nightly-labs/openbot` and `origin` at `alphadoiy/openbot`. Review this
policy when merging upstream. Back up the whole profile and workspace, including the keyring;
`openbot.db` alone does not restore credentials or attachments. No existing production service or
user database was changed for this fork.

The source keeps PolyForm Noncommercial 1.0.0 and all required notices. Personal use must meet
its noncommercial conditions. Removing purchase screens does not grant commercial-use rights.
See [LICENSE](../LICENSE) and the
[official license text](https://polyformproject.org/licenses/noncommercial/1.0.0).
