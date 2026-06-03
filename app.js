const stateKey = "jo-club-live-assistant-prototype-v5";

const defaultState = {
  nickname: "",
  preferences: [],
  needs: [],
  selectedPhotoKind: "菜單",
  lastQuestion: "",
  staff: {
    status: "14:00-24:00",
    focus: "咖啡、輕食、桌遊、聚會",
    feature: "今日推薦：4 人分享餐、甜點咖啡組合、桌遊聚會與生日活動可由店長小江協助安排。"
  },
  feedback: {
    ratings: {},
    interests: [],
    suggestion: "",
    note: "",
    submittedAt: ""
  }
};

const venueInfo = {
  address: "桃園市中壢區實踐路225-11號",
  phone: "03-456-0603",
  instagram: "jo_club22511",
  hours: "14:00-24:00",
  membership: "2026 年 6 月開幕期間，完成入會程序，當天消費 8 折，包含包場活動。",
  birthday: "壽星入場消費如果提前告知，店內會準備精美禮品。",
  seats: "一樓約 14 個座位，可視情況增加 2-4 人；包含 6-8 人桌、4 人桌與 2 人桌。"
};

const menuText = {
  drinks: "飲料單點一律 25 元：雪碧、可樂、零卡可樂、檸檬紅茶、蘋果汁、芬達。",
  coffee: "咖啡：精品拿鐵 65、精品美式 55、冷萃咖啡 65、燕麥拿鐵 95、香椰厚拿鐵 95。",
  dessert: "甜點：巴斯克蛋糕 90、白巧克力玫瑰檸檬塔 90、精選蛋糕 80、厚片系列 40。",
  food: "義大利麵一律 150；水餃 100-120；炸物 35-130；玉米濃湯 50。",
  sets: "套餐：A 個人套餐 230、B 雙人套餐 430、4 人分享餐 800，套餐內容可更換。"
};

const screenNames = ["photo", "ask", "today", "member", "feedback"];
const screenScrollTargets = {
  photo: "#screen-photo .tool-panel",
  ask: "#questionInput",
  today: "#screen-today .tool-panel",
  member: "#screen-member .tool-panel",
  feedback: "#screen-feedback .tool-panel"
};
const focusTargets = {
  ask: "#questionInput"
};

let state = loadState();
let selectedPhotoDataUrl = "";
let toastTimer = 0;

const feedbackItems = [
  { key: "arrival", label: "走進店內第一印象" },
  { key: "comfort", label: "環境舒適度" },
  { key: "cleanliness", label: "整潔衛生" },
  { key: "service", label: "人員服務態度" },
  { key: "food", label: "餐點飲品滿意度" },
  { key: "social", label: "聚會娛樂體驗" },
  { key: "return", label: "再訪意願" }
];

const feedbackInterestOptions = [
  "朋友聚會聊天",
  "K 歌歡唱",
  "桌遊輕娛樂",
  "麻將休閒交流",
  "德州競技交流",
  "線上休閒遊戲體驗",
  "包場慶生活動",
  "咖啡甜點輕食",
  "安靜包廂聊天",
  "商務交流招待"
];

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(stateKey) || "{}");
    return {
      ...defaultState,
      ...saved,
      staff: { ...defaultState.staff, ...(saved.staff || {}) },
      feedback: { ...defaultState.feedback, ...(saved.feedback || {}) }
    };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(stateKey, JSON.stringify(state));
}

function getUrlNickname() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("name") || params.get("nickname") || "").trim();
}

function getInitialScreenName() {
  const params = new URLSearchParams(window.location.search);
  const requested = (params.get("tab") || params.get("screen") || params.get("view") || window.location.hash.slice(1)).trim();
  if (requested === "staff") return "feedback";
  return screenNames.includes(requested) ? requested : "photo";
}

function getMemberNickname() {
  return state.nickname || getUrlNickname() || "會員";
}

function getScreenScrollTarget(name) {
  return $(screenScrollTargets[name]) || $(`#screen-${name}`);
}

function getFixedTopOffset() {
  const topbar = $(".topbar");
  return (topbar?.getBoundingClientRect().height || 72) + 14;
}

function scrollToScreenTarget(name, { focus = true, behavior = "smooth" } = {}) {
  const target = getScreenScrollTarget(name);
  if (!target) return;

  window.requestAnimationFrame(() => {
    const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - getFixedTopOffset());
    window.scrollTo({ top, behavior });

    const focusTarget = focus ? $(focusTargets[name]) : null;
    if (focusTarget) {
      window.setTimeout(() => {
        try {
          focusTarget.focus({ preventScroll: true });
        } catch {
          focusTarget.focus();
        }
      }, 220);
      window.setTimeout(() => scrollToScreenTarget(name, { focus: false, behavior: "auto" }), 520);
    }
  });
}

function activateScreen(name, options = {}) {
  if (!screenNames.includes(name)) return;

  $$("[data-screen]").forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === name);
    screen.setAttribute("aria-hidden", String(screen.dataset.screen !== name));
  });

  $$("[data-tab-target]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tabTarget === name);
    button.setAttribute("aria-current", button.dataset.tabTarget === name ? "page" : "false");
  });

  if (options.updateHash) {
    const nextUrl = `${window.location.pathname}${window.location.search}#${name}`;
    window.history.replaceState(null, "", nextUrl);
  }

  scrollToScreenTarget(name, options);
}

function attachNavigation() {
  $$("[data-tab-target]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      activateScreen(button.dataset.tabTarget, { updateHash: true });
    });
  });

  window.addEventListener("hashchange", () => {
    const requested = window.location.hash.slice(1);
    const name = requested === "staff" ? "feedback" : requested;
    if (screenNames.includes(name)) activateScreen(name, { behavior: "auto", focus: false });
  });
}

function updateStoreHeader() {
  $("#storeStatus").textContent = state.staff.status;
  $("#storeFocus").textContent = state.staff.focus;
}

function updateMemberUI() {
  const nickname = getMemberNickname();
  $(".member-dot")?.classList.add("is-on");
  $("#memberShort").textContent = nickname.slice(0, 4);

  const nicknameInput = $("#memberNickname");
  if (nicknameInput && !nicknameInput.value) {
    nicknameInput.value = state.nickname || getUrlNickname();
  }

  const prefs = state.preferences.length ? state.preferences.join("、") : "尚未選擇偏好";
  $("#memberSummary").innerHTML = `
    <p class="answer-label">會員狀態</p>
    <h3>${escapeHtml(nickname)}，已由官方 LINE 會員入口進入</h3>
    <p>這裡先記錄你的偏好，讓 JO 助手推薦聚會、餐點與活動時更貼近你。</p>
    <p>目前偏好：${escapeHtml(prefs)}</p>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function appendBubble(text, role) {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${role}`;
  bubble.textContent = text;
  $("#chatLog").appendChild(bubble);
  bubble.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function showToast(message) {
  const toast = $("#appToast");
  if (!toast) return;

  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 2800);
}

function shouldHandoff(text) {
  return /生日|壽星|包場|預約|活動|企劃|規劃|包廂|二樓|私人|德州|麻將|網咖|超過|24|特殊|多人|投影|專員|店長|小江/.test(text);
}

function fallbackAnswer(question) {
  if (/會員|優惠|折扣|八折|8折|點數|生日|壽星/.test(question)) {
    return `${venueInfo.membership} ${venueInfo.birthday} 目前點數制度還在規劃中。`;
  }

  if (/菜單|咖啡|飲料|甜點|輕食|義大利|套餐|炸物|水餃|吃/.test(question)) {
    return `${menuText.coffee} ${menuText.dessert} ${menuText.food} ${menuText.sets}`;
  }

  if (/聚會|四人|4人|桌遊|K歌|唱歌|活動/.test(question)) {
    return `如果是朋友聚會，可以先看 4 人分享餐 800 元，再搭配飲料或甜點。現場有桌遊、投影與活動協助，若要生日或團康規劃，建議提前 1-2 天在官方 LINE 留言。`;
  }

  if (/座位|包廂|位置|預約|人數/.test(question)) {
    return `${venueInfo.seats} 一般到店不用特別預約；活動需求建議至少提前 1 天，特殊規劃建議提前 2 天。`;
  }

  if (/地址|電話|營業|時間|停車|在哪|位置/.test(question)) {
    return `JO CLUB 地址是 ${venueInfo.address}，電話 ${venueInfo.phone}，營業時間 ${venueInfo.hours}。停車資訊可從官方 LINE 的停車資訊選單查看。`;
  }

  return "我可以協助你查菜單、會員優惠、今日推薦、座位安排與活動規劃。這題如果需要更精準安排，建議把需求貼到官方 LINE，讓店長小江接洽。";
}

async function askAssistant({ question, mode = "文字提問", imageDataUrl = "", photoKind = "" }) {
  const response = await fetch("./api/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      question,
      mode,
      imageDataUrl,
      photoKind,
      preferences: state.preferences,
      needs: state.needs
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    const detail = data.failures?.map((failure) => {
      return `${failure.model}: ${failure.message}`;
    }).join(" / ");
    throw new Error(detail || data.error || data.answer || "AI 連線失敗");
  }

  return data.answer;
}

function attachAskFlow() {
  $("#sendQuestion").addEventListener("click", async () => {
    const input = $("#questionInput");
    const question = input.value.trim();
    if (!question) return;

    state.lastQuestion = question;
    saveState();
    appendBubble(question, "user");
    input.value = "";

    const button = $("#sendQuestion");
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = "AI 思考中";
    appendBubble("我先看一下 JO CLUB 的資料，再幫你整理建議。", "assistant");

    try {
      const answer = await askAssistant({ question });
      $("#chatLog .bubble.assistant:last-child").textContent = answer;
      if (shouldHandoff(`${question} ${answer}`)) showHandoffCard(question);
    } catch (error) {
      const answer = fallbackAnswer(question);
      $("#chatLog .bubble.assistant:last-child").textContent = `${answer}\n\n目前 AI 尚未成功接上，這是備援回覆。\n偵錯訊息：${error.message}`;
      if (shouldHandoff(question)) showHandoffCard(question);
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  });

  $("#voiceDemo").addEventListener("click", () => {
    $("#questionInput").value = "我想辦生日活動，8 個人，需要店內協助規劃。";
  });

  $$("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      $("#questionInput").value = button.dataset.prompt;
      $("#sendQuestion").click();
    });
  });
}

function attachPhotoFlow() {
  $("#photoInput").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      selectedPhotoDataUrl = String(reader.result || "");
      $("#photoPreview").hidden = false;
      $("#photoPreview").innerHTML = `<img src="${selectedPhotoDataUrl}" alt="已選擇照片" />`;
    });
    reader.readAsDataURL(file);
  });

  $$("[data-photo-kind]").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.selectedPhotoKind = chip.dataset.photoKind;
      saveState();
      $$("[data-photo-kind]").forEach((item) => item.classList.toggle("is-selected", item === chip));
    });
  });

  $("#analyzePhoto").addEventListener("click", async () => {
    const answerBox = $("#photoAnswer");
    const kind = state.selectedPhotoKind;
    answerBox.innerHTML = `
      <p class="answer-label">JO CLUB AI</p>
      <h3>正在理解${escapeHtml(kind)}</h3>
      <p>我會先根據照片類型與 JO CLUB 資料整理建議。</p>
    `;

    const question = `請幫我理解這張${kind}，並以 JO CLUB 店內服務角度推薦客人下一步。`;
    try {
      const answer = await askAssistant({
        question,
        mode: "拍照問",
        imageDataUrl: selectedPhotoDataUrl,
        photoKind: kind
      });
      answerBox.innerHTML = `
        <p class="answer-label">JO CLUB AI</p>
        <h3>${escapeHtml(kind)}建議</h3>
        <p>${escapeHtml(answer)}</p>
      `;
    } catch {
      answerBox.innerHTML = `
        <p class="answer-label">JO CLUB 示範回覆</p>
        <h3>${escapeHtml(kind)}建議</h3>
        <p>${fallbackPhotoAnswer(kind)}</p>
        <p>目前 AI 後端尚未完成設定或暫時連線失敗，這是備援回覆。</p>
      `;
    }
  });
}

function fallbackPhotoAnswer(kind) {
  const answers = {
    菜單: `${menuText.coffee} ${menuText.food} ${menuText.sets}`,
    開幕海報: `${venueInfo.membership} 適合引導客人加入官方 LINE 會員後再消費。`,
    店內空間: "店內適合朋友聚會、桌遊、輕食、投影與活動安排。多人或特殊需求建議先由店長小江確認。",
    外觀招牌: `這是 JO SOCIAL CLUB 店面資訊，可引導客人確認地址：${venueInfo.address}。`,
    "LINE/IG": `官方 LINE 可用來入會、預約與詢問；IG 是 ${venueInfo.instagram}。`
  };
  return answers[kind] || answers.菜單;
}

function showHandoffCard(question = "") {
  const card = $("#handoffCard");
  card.hidden = false;

  if (/包場|預約/.test(question)) $("#handoffType").value = "包場活動";
  if (/生日|壽星/.test(question)) $("#handoffType").value = "慶生活動";
  if (/桌遊|團康|社團/.test(question)) $("#handoffType").value = "團康/社團活動";
  if (/位置|座位|包廂/.test(question)) $("#handoffType").value = "座位與包廂安排";
  if (/二樓|私人|德州|麻將|網咖/.test(question)) $("#handoffType").value = "熟客私人安排";

  $("#handoffDetail").value = question;
  card.scrollIntoView({ behavior: "smooth", block: "start" });
}

function attachHandoffFlow() {
  $("#handoffForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const message = [
      "JO CLUB 會員需求卡",
      `會員：${getMemberNickname()}`,
      "來源：官方 LINE JO 助手",
      `類型：${$("#handoffType").value}`,
      `希望時間：${$("#handoffTime").value.trim() || "未填"}`,
      `人數：${$("#handoffPeople").value.trim() || "未填"}`,
      `需求：${$("#handoffDetail").value.trim() || state.lastQuestion || "未填"}`,
      "請店長小江協助接洽。"
    ].join("\n");

    $("#taskMessage").textContent = message;
    $("#taskOutput").hidden = false;
  });

  $("#copyTask").addEventListener("click", async () => {
    const text = $("#taskMessage").textContent;
    try {
      await navigator.clipboard.writeText(text);
      $("#copyTask").textContent = "已複製，可貼到官方 LINE";
      showToast("需求卡已複製，回到 LINE 對話貼上即可。");
    } catch {
      $("#copyTask").textContent = "請手動複製上方內容";
      showToast("手機若無法自動複製，請長按需求卡內容後複製。");
    }
  });
}

function updateSelectedChips(containerId, values, dataName) {
  $$(`#${containerId} .chip`).forEach((chip) => {
    chip.classList.toggle("is-selected", values.includes(chip.dataset[dataName]));
  });
}

function buildRecommendations() {
  const values = [...state.needs, ...state.preferences].join("、");
  const has = (keyword) => values.includes(keyword);

  const cards = [
    {
      title: has("咖啡") ? "咖啡與甜點組合" : "朋友聚會分享餐",
      tag: has("咖啡") ? "輕鬆聊天" : "聚會",
      body: has("咖啡")
        ? "可從精品美式、精品拿鐵搭配巴斯克蛋糕或精選蛋糕開始，適合下午聊天。"
        : "4 人分享餐 800 元適合先墊胃，再搭配飲料與桌遊，現場節奏會比較自然。"
    },
    {
      title: has("安靜包廂") ? "安靜座位需求" : "桌遊與投影安排",
      tag: "現場服務",
      body: has("安靜包廂")
        ? "若需要比較安靜的空間，建議先在官方 LINE 留言，讓店長小江依當天人流安排。"
        : "現場可配合桌遊、投影與聚會需求，多人活動建議提前 1 天告知。"
    },
    {
      title: has("生日") ? "生日活動提醒" : "開幕會員優惠",
      tag: has("生日") ? "壽星" : "會員",
      body: has("生日")
        ? "壽星消費若提前告知，店內會準備精美禮品。若要活動規劃，建議提前 2 天。"
        : "6 月開幕期間完成入會，當天消費 8 折，包含包場活動。"
    }
  ];

  $("#recommendList").innerHTML = cards
    .map((card) => `
      <article class="recommend-card">
        <header>
          <strong>${escapeHtml(card.title)}</strong>
          <span>${escapeHtml(card.tag)}</span>
        </header>
        <p>${escapeHtml(card.body)}</p>
      </article>
    `)
    .join("");
}

function attachPreferenceFlow() {
  $("#needChips").addEventListener("click", (event) => {
    const chip = event.target.closest("[data-need]");
    if (!chip) return;
    const value = chip.dataset.need;
    state.needs = state.needs.includes(value)
      ? state.needs.filter((item) => item !== value)
      : [...state.needs, value];
    saveState();
    updateSelectedChips("needChips", state.needs, "need");
    buildRecommendations();
  });

  $("#preferenceChips").addEventListener("click", (event) => {
    const chip = event.target.closest("[data-pref]");
    if (!chip) return;
    const value = chip.dataset.pref;
    state.preferences = state.preferences.includes(value)
      ? state.preferences.filter((item) => item !== value)
      : [...state.preferences, value];
    saveState();
    updateSelectedChips("preferenceChips", state.preferences, "pref");
    updateMemberUI();
    buildRecommendations();
  });
}

function attachMemberFlow() {
  $("#memberToggle")?.addEventListener("click", () => activateScreen("member"));
  $("#saveNickname")?.addEventListener("click", () => {
    state.nickname = $("#memberNickname").value.trim();
    saveState();
    updateMemberUI();
  });
}

function ratingText(score) {
  const labels = {
    1: "需要改善",
    2: "普通",
    3: "還不錯",
    4: "滿意",
    5: "非常滿意"
  };
  return labels[score] || "未評分";
}

function renderFeedbackRatings() {
  const container = $("#feedbackRatings");
  if (!container) return;

  container.innerHTML = feedbackItems
    .map((item) => {
      const current = Number(state.feedback.ratings[item.key] || 0);
      const buttons = [1, 2, 3, 4, 5]
        .map((score) => `
          <button
            class="${score === current ? "is-selected" : ""}"
            type="button"
            data-rating-key="${escapeHtml(item.key)}"
            data-rating-score="${score}"
            aria-label="${escapeHtml(item.label)} ${score} 分"
          >${score}</button>
        `)
        .join("");

      return `
        <div class="rating-row">
          <div>
            <strong>${escapeHtml(item.label)}</strong>
            <span>${escapeHtml(ratingText(current))}</span>
          </div>
          <div class="rating-buttons">${buttons}</div>
        </div>
      `;
    })
    .join("");
}

function renderFeedbackInterests() {
  const container = $("#feedbackInterests");
  if (!container) return;

  const selected = state.feedback.interests || [];
  container.innerHTML = feedbackInterestOptions
    .map((label) => `
      <button
        class="interest-chip ${selected.includes(label) ? "is-selected" : ""}"
        type="button"
        data-interest="${escapeHtml(label)}"
      >${escapeHtml(label)}</button>
    `)
    .join("");
}

function buildFeedbackMessage() {
  const lines = [
    "JO CLUB 客人回饋卡",
    `會員：${getMemberNickname()}`,
    "給：店長小江",
    "來源：官方 LINE JO 助手",
    "評分："
  ];

  feedbackItems.forEach((item) => {
    const score = Number(state.feedback.ratings[item.key] || 0);
    lines.push(`- ${item.label}：${score || "未評"} 分（${ratingText(score)}）`);
  });

  lines.push(`休閒娛樂興趣：${state.feedback.interests?.length ? state.feedback.interests.join("、") : "未選擇"}`);
  lines.push(`建議改善：${state.feedback.suggestion || "未填"}`);
  lines.push(`想補充給小江：${state.feedback.note || "未填"}`);

  return lines.join("\n");
}

function updateFeedbackSummary(message = "") {
  const summary = $("#feedbackSummary");
  if (!summary) return;

  if (!state.feedback.submittedAt) {
    summary.innerHTML = `
      <p class="answer-label">回饋狀態</p>
      <h3>還沒有送出回饋</h3>
      <p>評分後會自動整理出重點，方便店長小江看見客人的實際感受與改善建議。</p>
    `;
    return;
  }

  summary.innerHTML = `
    <p class="answer-label">已整理回饋</p>
    <h3>謝謝你的評分，這份內容可貼到官方 LINE</h3>
    <pre class="feedback-output">${escapeHtml(message || buildFeedbackMessage())}</pre>
    <button class="secondary-action full" id="copyFeedback" type="button">複製回饋卡</button>
  `;

  $("#copyFeedback")?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(buildFeedbackMessage());
      $("#copyFeedback").textContent = "已複製，可貼到官方 LINE";
      showToast("回饋卡已複製，店長小江可從 LINE 收到內容。");
    } catch {
      $("#copyFeedback").textContent = "請手動複製上方內容";
      showToast("手機若無法自動複製，請長按回饋卡內容後複製。");
    }
  });
}

async function saveFeedbackToBackend(message) {
  const response = await fetch("./api/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      member: getMemberNickname(),
      ratings: state.feedback.ratings,
      interests: state.feedback.interests || [],
      suggestion: state.feedback.suggestion,
      note: state.feedback.note,
      message,
      submittedAt: state.feedback.submittedAt,
      source: "official-line-assistant"
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    throw new Error(data.error || "回饋後台暫時無法儲存");
  }
  return data;
}

function attachFeedbackFlow() {
  renderFeedbackRatings();
  renderFeedbackInterests();

  $("#feedbackRatings")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-rating-key]");
    if (!button) return;

    state.feedback.ratings[button.dataset.ratingKey] = Number(button.dataset.ratingScore);
    saveState();
    renderFeedbackRatings();
  });

  $("#feedbackInterests")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-interest]");
    if (!button) return;

    const value = button.dataset.interest;
    const selected = state.feedback.interests || [];
    state.feedback.interests = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    saveState();
    renderFeedbackInterests();
  });

  $("#feedbackForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    state.feedback.suggestion = $("#feedbackSuggestion").value.trim();
    state.feedback.note = $("#feedbackNote").value.trim();
    state.feedback.submittedAt = new Date().toISOString();
    saveState();

    const message = buildFeedbackMessage();
    updateFeedbackSummary(message);
    $("#feedbackSummary").scrollIntoView({ behavior: "smooth", block: "start" });
    try {
      await saveFeedbackToBackend(message);
      showToast("回饋已送出並儲存到後台。");
    } catch {
      showToast("已整理成回饋卡；後台尚未完成儲存設定。");
    }
  });

  $("#feedbackSuggestion").value = state.feedback.suggestion || "";
  $("#feedbackNote").value = state.feedback.note || "";
  updateFeedbackSummary();
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => registrations.forEach((registration) => registration.unregister()))
      .catch(() => {});
  }
}

function init() {
  attachNavigation();
  attachPhotoFlow();
  attachAskFlow();
  attachHandoffFlow();
  attachPreferenceFlow();
  attachMemberFlow();
  attachFeedbackFlow();
  updateStoreHeader();
  updateMemberUI();
  updateSelectedChips("needChips", state.needs, "need");
  updateSelectedChips("preferenceChips", state.preferences, "pref");
  buildRecommendations();
  activateScreen(getInitialScreenName(), { behavior: "auto", focus: false });
  registerServiceWorker();
}

init();
