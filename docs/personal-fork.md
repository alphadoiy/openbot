# OpenBot Personal

This is a personal fork of `nightly-labs/openbot`, based on commit
`b476623a00dbc70f6c0ff3ba44b7257d6f417caf` (version 0.71.0).
The fork repository is <https://github.com/alphadoiy/openbot>.
The working branch is `personal/self-hosted`.

## License and scope

The source keeps PolyForm Noncommercial 1.0.0 and all required notices.
Removing payment features does not grant permission for commercial use.
Personal use must meet the license's noncommercial conditions. A company deployment or
a service for customers needs a separate assessment and, when required, a commercial license.
See [LICENSE](../LICENSE) and the
[official license text](https://polyformproject.org/licenses/noncommercial/1.0.0).

This first version removes commerce from the app. It is not a complete private deployment.
The account and remote service URLs still default to OpenBot's services. Third-party model,
website and plugin connections also remain. No running app, account, user database or
production service was changed to create this fork.

## Changes

The shared policy is in `packages/contracts/src/distribution.ts`.

- The account service does not create a Stripe billing service, even if a Stripe key is set.
  It uses the existing unavailable billing and license responses.
- The account service does not offer paid hosted server creation. The mobile cloud-server
  feature is off on this account service.
- Desktop and browser clients hide billing navigation and hosted-server purchase screens.
  Local server creation, joining a server and self-hosted server installation stay available.
- Packaged desktop builds use the name and data folder `OpenBot Personal`, with a separate
  application ID. Workspaces and child-server files stay inside its data folder, under `workspace`.
  Existing OpenBot data is not imported automatically.
- Desktop product analytics and anonymous failure reporting are disabled in main and renderer.
  This does not disable telemetry in provider CLIs, plugins, mobile, the public site or every service.
- Desktop application updates are disabled. The package update repository points to this fork.
  Provider CLI runtime updates still use their existing sources. The built-in Install Server
  command installs the official server and its official updates, not this personal build. Use it
  only when you intend to run the official server. This fork has no private server release yet.

Authentication, signed connection tickets, membership roles, encryption, local data migrations
and released Team API protocols keep their existing behavior. Default member and site quotas
remain. A private service can adopt its own capacity policy in a later change; hiding payment
screens does not change quotas on the official service.

The source still contains billing contracts, old database migrations and dormant sales components.
Keeping them avoids database and protocol changes and reduces the cost of merging upstream work.

## Deployment choices

| Choice | What you gain | Cost or limitation |
| --- | --- | --- |
| Personal desktop | Local agents, chats, files and browser; smallest maintenance scope | The computer must run for tasks to run. Cloud models and plugins can still send data out. |
| Your Linux or Docker agent host | Always-on tasks on your own machine | You operate the host, backups and updates. The default configuration still uses official accounts, Signal and TURN. The container does not serve an independent web client. |
| Your account service, Signal and TURN | Account and connection setup under your control | The supported route needs Cloudflare Workers, D1, R2, a domain, SMTP and a Linux server with public IPv4. TURN can add substantial bandwidth use. |
| Fully internal, without Cloudflare or external models | Strongest control of network and data | Requires porting the account/storage layer, internal identity and connection setup, and sufficient hardware for local models. This fork does not implement it. |

For the complete remote stack, follow [self-hosted remote access](self-hosting.md).
Use your own keys and accounts. Do not reuse upstream deployment IDs, encrypted credentials,
signing identities or integration secrets. Sign out before changing the account service URL.
Each client must use the same account service and Signal configuration.

The supported private remote setup has these limits:

- Official `openbot.run/app` does not connect to the private account service. Hosting and
  validating the repository's browser client at your own origin is additional work.
- Official hosted servers, GitHub App, Slack, Telegram bot and iPhone Live Activity relay stay
  off. Independent integrations need your own registrations and configuration.
- An iPhone can inherit the private service through desktop QR pairing. Its standard email
  sign-in uses the official service. A separately distributed phone app needs your own signing,
  push configuration and update infrastructure.
- Full remote self-hosting still uses Cloudflare in the supported deployment architecture.
  It does not by itself mean an offline or fully internal system.

No hardware or network measurements were made. Operating cost depends on provider usage,
host capacity, model size, storage, backup retention and TURN traffic. Removing Stripe does
not remove these costs or external model subscriptions.

## Maintenance and recovery

Keep `upstream` pointed at `nightly-labs/openbot` and `origin` at `alphadoiy/openbot`.
Merge upstream changes into the personal branch and review the distribution policy on each merge.
Keep host, clients, Worker migrations and Signal versions compatible. Do not apply a release
that expects production credentials or the official signing setup to this fork.

Back up the full application data and workspace, including the keyring and provider state.
For Docker, stop the container before backing up the complete `/data` volume. A copy of
`openbot.db` alone does not restore encrypted credentials, files or browser sessions.
See [Docker backups](docker.md) and [self-hosted servers](self-hosted-server.md).

This fork has not been packaged, signed, installed over the current app or deployed to a server.
Type checks do not establish that the packaged desktop, browser or phone flows work end to end.
