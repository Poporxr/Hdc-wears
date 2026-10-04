import { createSign } from "crypto";

/**
 * Service-account auth without the firebase-admin dependency.
 * Signs a JWT with the service account private key (Node crypto only),
 * exchanges it for a Google OAuth2 access token, and calls the Firestore
 * REST API with it. Returns null when FIREBASE_SERVICE_ACCOUNT is missing.
 * Server-only: never import from client components.
 */

const PROJECT_ID = "hdc-wears-57d82";
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

type ServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

function getServiceAccount(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    const j = JSON.parse(raw);
    if (!j.client_email || !j.private_key) return null;
    return j;
  } catch {
    return null;
  }
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

let tokenCache: { token: string; exp: number } | null = null;

export async function getAccessToken(): Promise<string | null> {
  if (tokenCache && Date.now() < tokenCache.exp - 60_000) {
    return tokenCache.token;
  }
  const sa = getServiceAccount();
  if (!sa) return null;

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: sa.client_email,
      sub: sa.client_email,
      aud: sa.token_uri || "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
      scope: "https://www.googleapis.com/auth/datastore",
    })
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${payload}`);
  const signature = base64url(signer.sign(sa.private_key));
  const jwt = `${header}.${payload}.${signature}`;

  const res = await fetch(sa.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) return null;
  const j = await res.json();
  tokenCache = {
    token: j.access_token,
    exp: Date.now() + (j.expires_in || 3600) * 1000,
  };
  return tokenCache.token;
}

/** True when server-side Firestore access is configured. */
export async function hasServerAccess(): Promise<boolean> {
  return (await getAccessToken()) !== null;
}

type FsValue =
  | { stringValue: string }
  | { integerValue: string }
  | { booleanValue: boolean }
  | { nullValue: null };

function toFsFields(obj: Record<string, string | number | boolean | null>): Record<string, FsValue> {
  const fields: Record<string, FsValue> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null) fields[k] = { nullValue: null };
    else if (typeof v === "number") fields[k] = { integerValue: String(Math.round(v)) };
    else if (typeof v === "boolean") fields[k] = { booleanValue: v };
    else fields[k] = { stringValue: v };
  }
  return fields;
}

function fromFsFields(fields: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(fields || {})) {
    if (v.stringValue !== undefined) out[k] = v.stringValue;
    else if (v.integerValue !== undefined) out[k] = parseInt(v.integerValue, 10);
    else if (v.doubleValue !== undefined) out[k] = v.doubleValue;
    else if (v.booleanValue !== undefined) out[k] = v.booleanValue;
    else if (v.nullValue !== undefined) out[k] = null;
    else out[k] = v;
  }
  return out;
}

async function fsFetch(path: string, init?: RequestInit) {
  const token = await getAccessToken();
  if (!token) throw new Error("FIREBASE_SERVICE_ACCOUNT not configured");
  const res = await fetch(`${FIRESTORE_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Firestore error ${res.status}: ${t.slice(0, 200)}`);
  }
  return res.json();
}

/** Get a document by collection + id. Returns null when missing. */
export async function fsGet(
  collection: string,
  id: string
): Promise<{ id: string; data: Record<string, any> } | null> {
  try {
    const j = await fsFetch(`/${collection}/${id}`);
    return { id, data: fromFsFields(j.fields) };
  } catch (err) {
    if (String(err).includes("Firestore error 404")) return null;
    throw err;
  }
}

/** Update specific fields on a document. */
export async function fsUpdate(
  collection: string,
  id: string,
  fields: Record<string, string | number | boolean | null>
) {
  const params = Object.keys(fields)
    .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
    .join("&");
  await fsFetch(`/${collection}/${id}?${params}`, {
    method: "PATCH",
    body: JSON.stringify({ fields: toFsFields(fields) }),
  });
}

/** Run a structured query; returns plain objects with ids. */
export async function fsQuery(opts: {
  collection: string;
  where?: { field: string; op: string; value: string | number }[];
  limit?: number;
}): Promise<{ id: string; data: Record<string, any> }[]> {
  const filters = (opts.where || []).map((w) => ({
    fieldFilter: {
      field: { fieldPath: w.field },
      op: w.op,
      value:
        typeof w.value === "number"
          ? { integerValue: String(w.value) }
          : { stringValue: w.value },
    },
  }));
  const body: any = {
    structuredQuery: {
      from: [{ collectionId: opts.collection }],
      where:
        filters.length === 1
          ? filters[0]
          : { compositeFilter: { op: "AND", filters } },
    },
  };
  if (opts.limit) body.structuredQuery.limit = opts.limit;
  const j = await fsFetch(":runQuery", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const out: { id: string; data: Record<string, any> }[] = [];
  for (const row of j || []) {
    const doc = row.document;
    if (!doc) continue;
    out.push({
      id: doc.name.split("/").pop(),
      data: fromFsFields(doc.fields),
    });
  }
  return out;
}
