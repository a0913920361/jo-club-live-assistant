function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function isAuthorized(request, env) {
  if (!env.FEEDBACK_ADMIN_PIN) return true;
  const url = new URL(request.url);
  return url.searchParams.get("pin") === env.FEEDBACK_ADMIN_PIN;
}

function cleanText(value, maxLength = 1000) {
  return String(value || "").trim().slice(0, maxLength);
}

function cleanRatings(value) {
  const source = value && typeof value === "object" ? value : {};
  return Object.fromEntries(
    Object.entries(source).map(([key, score]) => {
      const numeric = Number(score);
      return [key, Number.isFinite(numeric) ? Math.max(0, Math.min(5, numeric)) : 0];
    })
  );
}

function cleanInterests(value) {
  return Array.isArray(value)
    ? value.map((item) => cleanText(item, 40)).filter(Boolean).slice(0, 12)
    : [];
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON body." }, 400);
  }

  const record = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    member: cleanText(body.member, 80) || "會員",
    ratings: cleanRatings(body.ratings),
    interests: cleanInterests(body.interests),
    suggestion: cleanText(body.suggestion),
    note: cleanText(body.note),
    message: cleanText(body.message, 3000),
    source: cleanText(body.source, 80) || "official-line-assistant",
    userAgent: request.headers.get("user-agent") || ""
  };

  if (!env.FEEDBACK_STORE) {
    return json({
      ok: false,
      error: "FEEDBACK_STORE KV binding is not configured.",
      record
    }, 503);
  }

  await env.FEEDBACK_STORE.put(`feedback:${record.createdAt}:${record.id}`, JSON.stringify(record));
  return json({ ok: true, record });
}

export async function onRequestGet({ request, env }) {
  if (!isAuthorized(request, env)) {
    return json({ ok: false, error: "Unauthorized." }, 401);
  }

  if (!env.FEEDBACK_STORE) {
    return json({
      ok: false,
      error: "FEEDBACK_STORE KV binding is not configured.",
      records: []
    }, 503);
  }

  const list = await env.FEEDBACK_STORE.list({ prefix: "feedback:", limit: 100 });
  const records = await Promise.all(
    list.keys
      .sort((a, b) => b.name.localeCompare(a.name))
      .map(async (key) => JSON.parse(await env.FEEDBACK_STORE.get(key.name)))
  );

  return json({ ok: true, records });
}
