import "server-only";

type OwnerContext = {
  storeId: 1;
  ownerPrincipalId: string;
  writeEpoch: string;
  writesEnabled: boolean;
};

type OwnerContextResult =
  | { status: "ok"; context: OwnerContext }
  | { status: "unconfigured" | "denied" | "unavailable" };

const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

function readConfiguration() {
  const origin = process.env.DEQS_SUPABASE_URL;
  const key = process.env.DEQS_SUPABASE_PUBLISHABLE_KEY;
  if (!origin || !key || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) return null;

  try {
    const url = new URL(origin);
    const localHttp = url.protocol === "http:" && ["127.0.0.1", "[::1]", "localhost"].includes(url.hostname);
    if ((!localHttp && url.protocol !== "https:") || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash) return null;
    return { endpoint: new URL("/rest/v1/rpc/owner_context", url), key };
  } catch {
    return null;
  }
}

function parseOwnerContext(value: unknown): OwnerContext | null {
  if (typeof value !== "object" || value === null) return null;
  const row = value as Record<string, unknown>;
  if (row.store_id !== 1 || typeof row.owner_principal_id !== "string" || !uuid.test(row.owner_principal_id) ||
    typeof row.write_epoch !== "string" || !uuid.test(row.write_epoch) || typeof row.writes_enabled !== "boolean") {
    return null;
  }
  return {
    storeId: 1,
    ownerPrincipalId: row.owner_principal_id,
    writeEpoch: row.write_epoch,
    writesEnabled: row.writes_enabled,
  };
}

// Call from the server after session validation in the authentication milestone.
// The Data API independently verifies the token and the RPC checks owner/AAL2.
export async function readOwnerContext(accessToken: string): Promise<OwnerContextResult> {
  const config = readConfiguration();
  if (!config) return { status: "unconfigured" };
  if (accessToken.length > 8192 || !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(accessToken)) return { status: "denied" };

  try {
    const response = await fetch(config.endpoint, {
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${accessToken}`,
        "Accept-Profile": "deqs_api",
      },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(5000),
    });
    if (response.status === 401 || response.status === 403) return { status: "denied" };
    if (!response.ok) return { status: "unavailable" };
    const context = parseOwnerContext(await response.json());
    return context ? { status: "ok", context } : { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
}
