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
    feature: "今日推薦：4 人分享餐、甜點咖啡組合、桌遊聚會與生日活動可由店員協助安排。"
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

let state = loadState();
let selectedPhotoDataUrl = "";

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function loadState() {
  try {
    return { ...defaultState, ...JSON.parse(localStorage.getItem(stateKey) || "{}") };
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

function getMemberNickname() {
  return state.nickname || getUrlNickname() || "會員";
}

function activateScreen(name) {
  if (window.joClubShowScreen && activateScreen !== window.joClubShowScreen) {
    window.joClubShowScreen(name);
    return;
  }

  $$("[data-screen]").forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === name);
  });

  $$("[data-tab-target]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tabTarget === name);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function attachNavigation() {
  $$("[data-tab-target]").forEach((button) => {
    button.addEventListener("click", () => activateScreen(button.dataset.tabTarget));
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

function shouldHandoff(text) {
  return /生日|壽星|包場|預約|活動|企劃|規劃|包廂|二樓|私人|德州|麻將|網咖|超過|24|特殊|多人|投影|專員|詳哥|康哥/.test(text);
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

  return "我可以協助你查菜單、會員優惠、今日推薦、座位安排與活動規劃。這題如果需要更精準安排，建議把需求貼到官方 LINE，讓詳哥或康哥接洽。";
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
    throw new Error(data.answer || data.error || "AI 連線失敗");
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
      $("#chatLog .bubble.assistant:last-child").textContent = `${answer}\n\n目前 AI 後端尚未完成設定或暫時連線失敗，這是備援回覆。`;
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
    店內空間: "店內適合朋友聚會、桌遊、輕食、投影與活動安排。多人或特殊需求建議先由店員確認。",
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
      "請詳哥或康哥協助接洽。"
    ].join("\n");

    $("#taskMessage").textContent = message;
    $("#taskOutput").hidden = false;
  });

  $("#copyTask").addEventListener("click", async () => {
    const text = $("#taskMessage").textContent;
    try {
      await navigator.clipboard.writeText(text);
      $("#copyTask").textContent = "已複製，可貼到官方 LINE";
    } catch {
      $("#copyTask").textContent = "請手動複製上方內容";
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
        ? "若需要比較安靜的空間，建議先在官方 LINE 留言，讓店員依當天人流安排。"
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

function attachStaffFlow() {
  $("#staffForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.staff = {
      status: $("#staffStatus").value.trim() || defaultState.staff.status,
      focus: $("#staffFocus").value.trim() || defaultState.staff.focus,
      feature: $("#staffFeature").value.trim() || defaultState.staff.feature
    };
    saveState();
    updateStoreHeader();
    buildRecommendations();
    activateScreen("today");
  });
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
  attachStaffFlow();
  updateStoreHeader();
  updateMemberUI();
  updateSelectedChips("needChips", state.needs, "need");
  updateSelectedChips("preferenceChips", state.preferences, "pref");
  buildRecommendations();
  registerServiceWorker();
}

init();
