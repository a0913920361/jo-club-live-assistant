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

function shouldNotifyStaff(record) {
  return record.source === "activity-request" || /揪活動|需求|包廂|生日|麻將|德州|喝酒|玩牌/.test(record.message);
}

async function notifyStaff(record, env) {
  if (!shouldNotifyStaff(record)) {
    return { attempted: false, reason: "not_staff_request" };
  }

  if (env.LINE_CHANNEL_ACCESS_TOKEN && env.LINE_STAFF_TO) {
    const text = [
      "【JO CLUB 現場需求通知】",
      record.message || `會員：${record.member}`,
      "",
      `送出時間：${new Date(record.createdAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}`
    ].join("\n").slice(0, 4500);

    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: env.LINE_STAFF_TO,
        messages: [
          {
            type: "text",
            text
          }
        ]
      })
    });

    if (!response.ok) {
      return {
        attempted: true,
        channel: "line",
        ok: false,
        status: response.status,
        error: cleanText(await response.text(), 1000)
      };
    }

    return { attempted: true, channel: "line", ok: true };
  }

  if (env.STAFF_WEBHOOK_URL) {
    const response = await fetch(env.STAFF_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: record.message,
        content: record.message,
        record
      })
    });

    return {
      attempted: true,
      channel: "webhook",
      ok: response.ok,
      status: response.status
    };
  }

  return { attempted: false, reason: "missing_notification_env" };
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

  let notification = { attempted: false };
  try {
    notification = await notifyStaff(record, env);
  } catch (error) {
    notification = {
      attempted: true,
      ok: false,
      error: cleanText(error.message, 1000)
    };
  }

  return json({ ok: true, record, notification });
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
