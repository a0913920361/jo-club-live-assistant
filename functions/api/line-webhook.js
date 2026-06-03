function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function cleanText(value, maxLength = 1000) {
  return String(value || "").trim().slice(0, maxLength);
}

async function replyMessage(replyToken, text, env) {
  if (!replyToken || !env.LINE_CHANNEL_ACCESS_TOKEN) return false;

  const response = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      replyToken,
      messages: [
        {
          type: "text",
          text
        }
      ]
    })
  });

  return response.ok;
}

function getSourceId(source) {
  if (!source) return "";
  return source.groupId || source.roomId || source.userId || "";
}

function getSourceLabel(source) {
  if (!source) return "unknown";
  if (source.groupId) return "groupId";
  if (source.roomId) return "roomId";
  if (source.userId) return "userId";
  return "unknown";
}

function isIdRequest(event) {
  const text = cleanText(event.message?.text || "", 80).toLowerCase();
  return ["groupid", "group id", "line_staff_to", "群組id", "群組 id", "通知id", "通知 id"].includes(text);
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON body." }, 400);
  }

  const events = Array.isArray(body.events) ? body.events : [];

  await Promise.all(events.map(async (event) => {
    const sourceId = getSourceId(event.source);
    if (!sourceId) return;

    if (env.FEEDBACK_STORE) {
      await env.FEEDBACK_STORE.put(`line-source:${new Date().toISOString()}:${crypto.randomUUID()}`, JSON.stringify({
        createdAt: new Date().toISOString(),
        sourceType: event.source?.type || "",
        sourceLabel: getSourceLabel(event.source),
        sourceId,
        eventType: event.type || "",
        messageText: cleanText(event.message?.text || "", 200)
      }));
    }

    if (event.type === "join") {
      await replyMessage(event.replyToken, `JO CLUB 店內通知已加入。\n請到 Cloudflare 設定：\nLINE_STAFF_TO=${sourceId}`, env);
      return;
    }

    if (event.type === "message" && isIdRequest(event)) {
      await replyMessage(event.replyToken, `請複製這一行到 Cloudflare 環境變數：\nLINE_STAFF_TO=${sourceId}`, env);
    }
  }));

  return json({ ok: true });
}

export async function onRequestGet() {
  return json({
    ok: true,
    message: "LINE webhook is ready. Use POST from LINE Developers."
  });
}
