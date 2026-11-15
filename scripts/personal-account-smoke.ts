// Runs the real account service in local-only mode with a saved session on disk.
// Cloud actions must fail before network access, and the saved session must stay unchanged.
// Run: bun scripts/personal-account-smoke.ts
// Writes .openbot-build/personal-account-smoke/report.json and keeps its session fixture for review.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import type { Effect } from "effect";
import { runCauseEffect } from "../src/backend/effect-boundary";
import type { CentralAuthOperationError } from "../src/main/central-auth-effects";
import { CentralAuthManager } from "../src/main/central-auth-manager";

const ROOT = resolve(import.meta.dirname, "..");
const OUT = join(ROOT, ".openbot-build", "personal-account-smoke");
const REPORT = join(OUT, "report.json");

interface RejectedOperation {
  name: string;
  networkRequests: number;
  sessionUnchanged: boolean;
}

const rejected: RejectedOperation[] = [];
const calls = { fetch: 0, encrypt: 0, decrypt: 0 };
const statuses: string[] = [];
let auth: CentralAuthManager | undefined;
let fixturePath: string | undefined;
let beforeHash: string | undefined;
let afterHash: string | undefined;
let disposed = false;
let passed = false;
let error: string | undefined;

function hash(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

try {
  await mkdir(OUT, { recursive: true });
  const directory = await mkdtemp(join(OUT, "session-"));
  const storagePath = join(directory, "saved-session.bin");
  fixturePath = relative(ROOT, storagePath);
  const savedSession = Buffer.from(
    JSON.stringify({
      version: 2,
      sessionToken: "s".repeat(48),
      user: { id: "smoke-account", email: "smoke@example.invalid", name: "Saved account", avatarUrl: null },
    }),
  ).toString("base64");
  await writeFile(storagePath, savedSession, { mode: 0o600 });
  const before = await readFile(storagePath);
  beforeHash = hash(before);
  auth = new CentralAuthManager({
    enabled: false,
    apiUrl: "https://account.example.invalid",
    storagePath,
    encrypt: () => {
      calls.encrypt += 1;
      throw new Error("Local startup must not encrypt an account session.");
    },
    decrypt: () => {
      calls.decrypt += 1;
      throw new Error("Local startup must not decrypt a saved account session.");
    },
    fetch: async () => {
      calls.fetch += 1;
      throw new Error("Local account operations must not send a network request.");
    },
  });
  auth.on("changed", (state) => statuses.push(state.status));

  const initialized = await runCauseEffect(auth.initialize());
  assert.equal(initialized.status, "signed_out", "local startup must not restore the saved account");
  const retried = await runCauseEffect(auth.retry());
  assert.equal(retried.status, "signed_out", "retry must not reconnect a disabled account service");
  assert.equal(auth.hasSession(), false, "a saved cloud token must not become an active session");
  assert.equal(auth.canPersistSession(), false, "a local distribution must not offer cloud sign-in persistence");
  assert.deepEqual(calls, { fetch: 0, encrypt: 0, decrypt: 0 });
  assert.deepEqual(await readFile(storagePath), before);

  async function blocked(name: string, operation: Effect.Effect<unknown, CentralAuthOperationError>): Promise<void> {
    await assert.rejects(runCauseEffect(operation), { status: 401, code: "unauthorized" }, name);
    assert.equal(calls.fetch, 0, `${name} must fail before network access`);
    assert.equal(auth?.getState().status, "signed_out", `${name} must leave the account signed out`);
    assert.deepEqual(await readFile(storagePath), before, `${name} must preserve the saved session`);
    rejected.push({ name, networkRequests: calls.fetch, sessionUnchanged: true });
  }

  await blocked("email sign-in request", auth.requestEmailCode("smoke@example.invalid"));
  await blocked("email sign-in verification", auth.verifyEmailCode("smoke-challenge", "123456"));
  await blocked("profile update", auth.updateName("Local profile"));
  await blocked("avatar removal", auth.updateAvatar(null));
  await blocked("profile refresh", auth.refreshProfile());
  await blocked(
    "authorized cloud request",
    auth.requestAuthorized("/v1/me", { method: "GET" }, (value) => value),
  );
  await blocked("hosted server claim", auth.redeemHostedServerClaim("smoke-hosted-claim"));
  await blocked("self-hosted server claim", auth.redeemServerClaim("smoke-server-claim"));
  await blocked("mobile connection", auth.createMobileConnect({ hostId: "smoke-host", fingerprint: "f".repeat(43) }));
  await blocked("cloud sign-out", auth.logout());

  await runCauseEffect(auth.dispose());
  disposed = true;
  afterHash = hash(await readFile(storagePath));
  assert.equal(afterHash, beforeHash, "shutdown must preserve the saved session");
  assert.deepEqual(calls, { fetch: 0, encrypt: 0, decrypt: 0 });
  assert.ok(
    statuses.every((status) => status === "signed_out"),
    "the service must never announce a signed-in account",
  );
  passed = true;
} catch (cause) {
  error = cause instanceof Error ? cause.message : String(cause);
} finally {
  if (auth && !disposed) {
    try {
      await runCauseEffect(auth.dispose());
      disposed = true;
    } catch (cause) {
      error ??= cause instanceof Error ? cause.message : String(cause);
    }
  }
  if (fixturePath && afterHash === undefined) {
    try {
      afterHash = hash(await readFile(join(ROOT, fixturePath)));
    } catch {
      afterHash = "missing";
    }
  }
  await mkdir(OUT, { recursive: true });
  await writeFile(
    REPORT,
    `${JSON.stringify({ passed, disposed, calls, statuses, rejected, fixturePath, beforeHash, afterHash, error }, null, 2)}\n`,
  );
  process.stdout.write(`${passed ? "PASS" : "FAIL"}: report in ${REPORT}\n`);
  if (!passed) process.exitCode = 1;
}
