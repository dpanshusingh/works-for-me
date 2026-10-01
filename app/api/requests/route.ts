import { NextResponse } from "next/server";
import { z } from "zod";
import { buildSummary, summaryToText } from "@/lib/summaries";
import { REQUEST_KINDS, requestSchemas, type RequestKind } from "@/schemas/healthcare";

const MAX_BODY_BYTES = 64 * 1024;

const EnvelopeSchema = z.object({
  kind: z.enum(REQUEST_KINDS as [RequestKind, ...RequestKind[]]),
  reference: z.string().regex(/^HHH-[A-Z0-9]{6}$/),
  data: z.unknown(),
});

/**
 * Receives every booking / order / enquiry submitted on the site.
 *
 * The payload is re-validated with the same zod schema the form used.
 * When BOOKING_WEBHOOK_URL is configured the validated request (plus a
 * ready-to-read text summary) is forwarded there — point it at Zapier,
 * Make, n8n, a Google Apps Script or your CRM. Without it, only the
 * reference is logged and the visitor's WhatsApp message is the
 * confirmation channel.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "Request too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const envelope = EnvelopeSchema.safeParse(body);
  if (!envelope.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const { kind, reference } = envelope.data;
  const parsed = requestSchemas[kind].safeParse(envelope.data.data);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", issues: z.flattenError(parsed.error as z.ZodError).fieldErrors },
      { status: 422 },
    );
  }

  const summary = buildSummary(kind, parsed.data as never, reference);
  const record = {
    reference,
    kind,
    submittedAt: new Date().toISOString(),
    summary: summaryToText(summary),
    data: parsed.data,
  };

  const webhook = process.env.BOOKING_WEBHOOK_URL;
  if (!webhook) {
    // Patient details are deliberately not written to server logs.
    console.info(`[requests] ${reference} (${kind}) received; BOOKING_WEBHOOK_URL not set, not forwarded`);
    return NextResponse.json({ ok: true, reference, forwarded: false });
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(record),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
  } catch (error) {
    console.error(`[requests] ${reference} (${kind}) could not be forwarded:`, error);
    return NextResponse.json(
      { ok: false, reference, error: "Could not record the request" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, reference, forwarded: true });
}
