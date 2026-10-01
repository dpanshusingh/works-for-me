import type { RequestKind } from "@/schemas/healthcare";

/** Files can't travel as JSON — send their metadata; the file itself is shared on WhatsApp. */
function fileToMeta(_key: string, value: unknown) {
  if (typeof File !== "undefined" && value instanceof File) {
    return { name: value.name, size: value.size, type: value.type };
  }
  return value;
}

export type PostResult = {
  /** The server accepted and validated the request. */
  ok: boolean;
  /** The request reached the operations inbox (BOOKING_WEBHOOK_URL). */
  forwarded: boolean;
};

export async function postRequest(
  kind: RequestKind,
  reference: string,
  data: unknown,
): Promise<PostResult> {
  try {
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, reference, data }, fileToMeta),
    });
    const body = (await res.json().catch(() => ({}))) as { forwarded?: boolean };
    return { ok: res.ok, forwarded: res.ok && body.forwarded === true };
  } catch {
    return { ok: false, forwarded: false };
  }
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
