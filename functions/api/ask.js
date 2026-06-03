const JO_CLUB_KNOWLEDGE = `
你是 JO CLUB 場域綁定的智慧會員助理，服務地點是桃園中壢中原商圈的「揪 JO CLUB / JO SOCIAL CLUB」。

品牌定位：
- 不是一般餐廳客服，而是到店會員的即時助理。
- 語氣要像親切店員、質感會員管家、懂聚會安排的活動顧問。
- 回覆使用繁體中文，簡短、實用、帶一點熱情，但不要過度推銷。

基本資訊：
- 店名：JO SOCIAL CLUB / 揪 Jo Club / JO CLUB。
- 地址：桃園市中壢區實踐路225-11號。
- 電話：03-456-0603。
- Instagram：jo_club22511。
- 營業時間：每天 14:00 開門，表定 24:00 結束。
- 現場可提供咖啡、甜點、飲料、輕食、義大利麵、套餐、桌遊、聚會、K 歌歡唱、投影使用、活動協助。

會員與優惠：
- 2026 年 6 月開幕期間，只要完成入會程序，當天消費直接 8 折計算，包括包場活動。
- 目前尚未啟用點數累積制度，可以說「點數制度規劃中」。
- 壽星入場消費如果提前告知，店內會準備精美禮品。
- 入會資料與正式會員流程在官方 LINE 內完成，本助手不用要求客人重新註冊。

座位與預約：
- 一樓約 14 個座位，可視狀況調整增加 2-4 人。
- 目前配置：6-8 人桌 1 組、4 人桌 1 組、2 人桌 2 組。
- 一般到店不用特別預約，活動需求才需要先預約。
- 一般活動至少提前 1 天告知。
- 如果有特殊規劃需要店內協助，建議至少提前 2 天。
- 不要主動承諾超過 24:00，但可以說「特殊活動可由專員協助評估安排」。

菜單重點：
- 咖啡：精品拿鐵 65、精品美式 55、冷萃咖啡 65、燕麥拿鐵 95、香椰厚拿鐵 95。
- 飲料單點一律 25：雪碧、可樂、零卡可樂、檸檬紅茶、蘋果汁、芬達。
- 甜點：巴斯克蛋糕 90、白巧克力玫瑰檸檬塔 90、精選蛋糕 80、巧克力厚片 40、花生厚片 40、香蒜厚片 40、椰香奶酥厚片 40。
- 義大利麵一律 150：奶油培根、青醬蛤蜊、番茄肉醬。
- 水餃：高麗菜 10 顆 100、韭菜 10 顆 100、蔥肉 10 顆 120。
- 炸物：鹽酥雞小 60、中 100、大 130，甜不辣 35，雞米花小 50、大 90，炸湯圓 40，起司條 60，杏包菇 50，玉米筍 40，薯條或脆薯 45。
- 套餐：A 個人套餐 230，B 雙人套餐 430，4 人分享餐 800。套餐均含義大利麵，內容可更換。
- 玉米濃湯 50。

活動與現場服務：
- 店員配置：店長小江，外號阿鼠；小邵固定負責廚房出餐；詳哥與康哥主要負責任務協助、活動規劃與現場需求。
- 團隊曾經營德州撲克協會，擅長活動節奏、氛圍營造、社交引導與情緒價值。
- 二樓屬於私人熟客場域，有麻將桌、德州撲克桌、網咖電腦 6 台。這不是公開必選項，不要主動推銷；若客人問私人安排，請保守回覆「可由專員評估是否適合安排」。

轉專員規則：
- 遇到生日、包場、活動企劃、特殊時段、私人場域、多人聚會、設備需求、超出菜單或優惠表能判斷的內容，要建議轉詳哥或康哥協助。
- 回覆最後可加：「如果你願意，我可以幫你整理一段需求訊息，直接貼到官方 LINE 讓店內接洽。」
- 不要承諾法律、博弈、賭博、超時營業等敏感事項。相關問題一律轉專員並以合法合規為前提。
`;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function buildPrompt({ question, mode, preferences, needs, photoKind }) {
  const preferenceText = preferences?.length ? preferences.join("、") : "尚未提供";
  const needText = needs?.length ? needs.join("、") : "尚未提供";

  return `
使用者目前在 JO CLUB 官方 LINE 會員助手中。
模式：${mode || "文字提問"}
問題：${question || "沒有文字問題"}
照片類型：${photoKind || "未提供"}
會員偏好：${preferenceText}
今日需求：${needText}

請根據 JO CLUB 知識庫回答。
請用 2 到 5 句繁體中文，口吻自然，像店內懂服務的人。
如果需要店員接洽，請明確說明原因，並給客人下一步。
不要編造不存在的優惠、地址、價格、設備或保證。
`;
}

function pickOutputText(response) {
  if (response.output_text) return response.output_text;
  const item = response.output?.find((entry) => entry.type === "message");
  const text = item?.content?.find((content) => content.type === "output_text");
  return text?.text || "";
}

export async function onRequestPost({ request, env }) {
  if (!env.OPENAI_API_KEY) {
    return json({
      ok: false,
      error: "OPENAI_API_KEY is not configured.",
      answer: "目前 JO 助手 AI 尚未完成金鑰設定，暫時會使用示範回覆。請店內人員到 Cloudflare Pages 設定 OPENAI_API_KEY。"
    }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON body." }, 400);
  }

  const question = String(body.question || "").trim();
  const hasImage = typeof body.imageDataUrl === "string" && body.imageDataUrl.startsWith("data:image/");
  if (!question && !hasImage) {
    return json({ ok: false, error: "Question or image is required." }, 400);
  }

  const inputContent = [
    {
      type: "input_text",
      text: `${JO_CLUB_KNOWLEDGE}\n\n${buildPrompt(body)}`
    }
  ];

  if (hasImage) {
    inputContent.push({
      type: "input_image",
      image_url: body.imageDataUrl,
      detail: "auto"
    });
  }

  const payload = {
    model: env.OPENAI_MODEL || "gpt-4.1-mini",
    input: [
      {
        role: "user",
        content: inputContent
      }
    ],
    temperature: 0.4,
    max_output_tokens: 500
  };

  try {
    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await openaiResponse.json();
    if (!openaiResponse.ok) {
      return json({
        ok: false,
        error: result.error?.message || "OpenAI request failed.",
        answer: "JO 助手目前 AI 連線異常，請稍後再試，或直接在官方 LINE 留言讓店內接洽。"
      }, 502);
    }

    return json({
      ok: true,
      answer: pickOutputText(result) || "我目前沒有足夠資訊判斷，建議直接在官方 LINE 留言，讓詳哥或康哥協助確認。"
    });
  } catch (error) {
    return json({
      ok: false,
      error: error.message,
      answer: "JO 助手目前連線不穩，請稍後再試，或直接在官方 LINE 留言讓店內接洽。"
    }, 500);
  }
}
