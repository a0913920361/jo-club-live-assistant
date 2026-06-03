const stateKey = "jo-club-live-assistant-prototype-v4";

const defaultState = {
  member: null,
  nickname: "",
  preferences: [],
  needs: [],
  selectedPhotoKind: "菜單",
  lastQuestion: "",
  staff: {
    status: "14:00-24:00",
    focus: "咖啡・輕食・桌遊・聚會",
    feature: "今日主打 A 個人套餐 230 元、B 雙人套餐 430 元、4 人分享餐 800 元；官方 LINE 會員結帳 8 折。"
  }
};

const venueInfo = {
  name: "JO SOCIAL CLUB",
  address: "桃園市中壢區實踐路225-11號",
  phone: "03-456-0603",
  instagram: "jo_club22511",
  hours: "14:00-24:00",
  lineBenefit: "2026 年 6 月開幕期間，完成入會程序後，當天消費直接 8 折計算，目前包含一般消費與包場活動。",
  birthdayBenefit: "壽星入場消費若提前告知，店內會準備精美禮品贈送。",
  seats: "一樓約 14 席：6-8 人座 1 組、4 人座 1 組、2 人座 2 組，可依現場狀況彈性增加 2-4 人。"
};

const menuData = {
  coffee: ["精品拿鐵 65 元", "精品美式 55 元", "冷萃咖啡 65 元", "燕麥拿鐵 95 元", "香椰厚拿鐵 95 元"],
  drinks: ["飲料單點一律 25 元：雪碧、可樂、零卡可樂、檸檬紅茶、蘋果汁、芬達"],
  desserts: ["巴斯克蛋糕 90 元", "白巧克力玫瑰檸檬塔 90 元", "精選蛋糕 80 元", "厚片專區 40 元"],
  meals: ["義大利麵 150 元：奶油培根、青醬蛤蜊、番茄肉醬", "水餃系列 100-120 元", "單點炸物 35-130 元", "玉米濃湯 50 元"],
  sets: ["A 個人套餐 230 元", "B 雙人套餐 430 元", "4 人分享餐 800 元，套餐內容可更換"]
};

function shouldHandoff(question) {
  return /包場|慶生|生日|活動規劃|特殊|私人|二樓|麻將|德州|撲克|網咖|超過|超時|24|半夜|訂金|價格|專員|協助/.test(question);
}

let state = loadState();

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

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return Array.from(document.querySelectorAll(selector));
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
  const dot = $(".member-dot");
  const short = $("#memberShort");
  const summary = $("#memberSummary");
  const nicknameInput = $("#memberNickname");
  const nickname = getMemberNickname();

  dot.classList.add("is-on");
  short.textContent = nickname.slice(0, 4);
  if (nicknameInput && !nicknameInput.value) {
    nicknameInput.value = state.nickname || getUrlNickname();
  }

  const prefs = state.preferences.length ? state.preferences.join("、") : "尚未累積偏好";
  summary.innerHTML = `
    <p class="answer-label">會員狀態</p>
    <h3>${nickname}，官方 LINE 會員入口已啟用</h3>
    <p>會員身份由官方 LINE 承接，助手負責記錄偏好與整理需求。</p>
    <p>目前偏好：${prefs}</p>
  `;
}

function updateSelectedChips(containerId, values, dataName) {
  $$(`#${containerId} .chip`).forEach((chip) => {
    chip.classList.toggle("is-selected", values.includes(chip.dataset[dataName]));
  });
}

function attachPhotoFlow() {
  $("#photoInput").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const preview = $("#photoPreview");
    const url = URL.createObjectURL(file);
    preview.hidden = false;
    preview.innerHTML = `<img src="${url}" alt="上傳照片預覽" />`;
  });

  $$("[data-photo-kind]").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.selectedPhotoKind = chip.dataset.photoKind;
      saveState();
      $$("[data-photo-kind]").forEach((item) => {
        item.classList.toggle("is-selected", item === chip);
      });
    });
  });

  $("#analyzePhoto").addEventListener("click", () => {
    const kind = state.selectedPhotoKind;
    const map = {
      菜單: ["這份菜單包含咖啡、飲料、甜點、厚片、義大利麵、水餃、炸物與套餐。", "四人聚會可優先看 800 元分享餐；想簡單吃可選義大利麵 150 元或 A 個人套餐 230 元。"],
      開幕海報: ["海報重點是中原生活圈新據點：桌遊派對、K 歌歡唱、包場聚會與團康活動。", "2026 年 6 月開幕期間，完成入會程序後當天消費 8 折；壽星提前告知會準備精美禮品。"],
      店內空間: ["店內有主桌、包廂感座位、投影幕、電視與木質裝潢，適合朋友聚會或商務聊天。", "如果客人想安靜，建議安排靠內側或四人桌；如果想活動感，建議主空間搭配桌遊或 K 歌。"],
      外觀招牌: ["外觀招牌主打 JO SOCIAL CLUB，服務包含咖啡、桌遊、輕食與娛樂。", `地址是${venueInfo.address}，電話 ${venueInfo.phone}，可引導客人先加 LINE 或追蹤 IG。`],
      "LINE/IG": ["官方 LINE 是會員入口，也是助手連結入口。", `${venueInfo.lineBenefit} IG 帳號為 ${venueInfo.instagram}。`]
    };

    const lines = map[kind] || map.菜單;
    $("#photoAnswer").innerHTML = `
      <p class="answer-label">JO CLUB 建議</p>
      <h3>已理解：${kind}</h3>
      <p>${lines[0]}</p>
      <p>${lines[1]}</p>
    `;
  });
}

function answerQuestion(question) {
  const normalized = question.trim();
  if (!normalized) return "可以問我菜單、飲品、輕食、桌遊、包廂、會員權益或 LINE 加入方式。";

  if (/私人|二樓|麻將|德州|撲克|網咖/.test(normalized)) {
    return "店內另有較私密的安排可依會員關係與活動需求討論，實際開放方式以現場人員評估為準。我可以先幫你整理需求卡，轉由店內專員確認。";
  }

  if (/慶生|生日|壽星/.test(normalized)) {
    return `${venueInfo.birthdayBenefit}若需要店內協助規劃慶生流程、餐點、座位或活動，建議至少提前 2 天聯繫；我可以先幫你整理需求卡。`;
  }

  if (/包場|特殊規劃|活動規劃|團康|社團/.test(normalized)) {
    return "有活動需求建議先預約；一般活動至少提前 1 天，如果需要 JO CLUB 協助特殊規劃，建議至少提前 2 天。你可以留下人數、日期、時間與需求，我會整理成需求卡轉專員確認。";
  }

  if (/活動|今晚|今天|社交|桌遊|K歌|唱歌|團康/.test(normalized)) {
    return `目前店內重點是「${state.staff.focus}」。${state.staff.feature}桌遊派對、K 歌歡唱、包場聚會與團康活動都可以先告訴店員人數與希望的氛圍。`;
  }

  if (/包廂|座位|安靜|商務/.test(normalized)) {
    return `如果是商務交流或想安靜聊天，建議安排靠內側座位或四人包廂感桌位。${venueInfo.seats}投影與桌遊都可以配合使用。`;
  }

  if (/咖啡|飲料|甜點|蛋糕|厚片|喝/.test(normalized)) {
    return `${menuData.coffee.join("、")}。甜點可看巴斯克蛋糕 90 元、玫瑰檸檬塔 90 元或精選蛋糕 80 元；飲料單點一律 25 元。`;
  }

  if (/吃|輕食|義大利麵|水餃|炸物|套餐|四個人|4個人|四人/.test(normalized)) {
    return `餐點可選${menuData.meals.join("、")}。聚會建議：${menuData.sets.join("；")}。`;
  }

  if (/會員|權益|加入|生日|LINE|line|優惠|折/.test(normalized)) {
    return `${venueInfo.lineBenefit}目前尚未啟用點數累積制度，之後可規劃。${venueInfo.birthdayBenefit}入店可掃官方 QR CODE 加入，也可追蹤 IG：${venueInfo.instagram}。`;
  }

  if (/地址|電話|營業|時間|在哪|怎麼去/.test(normalized)) {
    return `JO SOCIAL CLUB 位於${venueInfo.address}，電話 ${venueInfo.phone}，營業時間每日 ${venueInfo.hours}，鄰近中原大學與中原生活圈。會員活動或特殊需求可先與店內討論安排。`;
  }

  return "我會把你的需求轉成現場可執行建議：先確認人數、預算、想吃或想玩的內容，再推薦餐點、飲品、座位、桌遊或會員優惠。";
}

function appendBubble(text, role) {
  const log = $("#chatLog");
  const bubble = document.createElement("div");
  bubble.className = `bubble ${role}`;
  bubble.textContent = text;
  log.appendChild(bubble);
  log.scrollIntoView({ behavior: "smooth", block: "end" });
}

function attachAskFlow() {
  $("#sendQuestion").addEventListener("click", () => {
    const input = $("#questionInput");
    const question = input.value.trim();
    if (!question) return;
    state.lastQuestion = question;
    saveState();
    appendBubble(question, "user");
    appendBubble(answerQuestion(question), "assistant");
    if (shouldHandoff(question)) {
      showHandoffCard(question);
    }
    input.value = "";
  });

  $("#voiceDemo").addEventListener("click", () => {
    $("#questionInput").value = "四個朋友想聊天、吃點輕食，也想玩桌遊，推薦怎麼安排？";
  });

  $$("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      $("#questionInput").value = button.dataset.prompt;
      $("#sendQuestion").click();
    });
  });
}

function showHandoffCard(question = "") {
  const card = $("#handoffCard");
  card.hidden = false;
  if (/包場/.test(question)) $("#handoffType").value = "包場活動";
  if (/慶生|生日/.test(question)) $("#handoffType").value = "慶生活動";
  if (/團康|社團/.test(question)) $("#handoffType").value = "團康/社團活動";
  if (/座位|包廂/.test(question)) $("#handoffType").value = "座位與包廂安排";
  if (/私人|二樓|麻將|德州|撲克|網咖/.test(question)) $("#handoffType").value = "熟客私人安排";
  $("#handoffDetail").value = question;
  card.scrollIntoView({ behavior: "smooth", block: "start" });
}

function attachHandoffFlow() {
  $("#handoffForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const memberName = state.member?.name || getMemberNickname();
    const memberPhone = state.member?.phone || "由官方 LINE 接洽";
    const message = [
      "JO CLUB 會員需求卡",
      `會員：${memberName}`,
      `手機：${memberPhone}`,
      `類型：${$("#handoffType").value}`,
      `日期時間：${$("#handoffTime").value.trim() || "待確認"}`,
      `人數：${$("#handoffPeople").value.trim() || "待確認"}`,
      `需求：${$("#handoffDetail").value.trim() || state.lastQuestion || "待確認"}`,
      "請店內專員協助回覆。"
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

function buildRecommendations() {
  const needs = state.needs;
  const has = (value) =>
    needs.includes(value) ||
    state.preferences.includes(value) ||
    state.preferences.includes(`喜歡${value}`) ||
    state.preferences.some((item) => item.includes(value));

  const cards = [
    {
      title: has("咖啡") ? "精品咖啡與甜點組合" : "今日主打套餐",
      tag: has("咖啡") ? "飲品" : "餐點",
      body: has("咖啡")
        ? "可從精品美式 55 元、精品拿鐵 65 元開始，搭配巴斯克蛋糕或玫瑰檸檬塔。"
        : state.staff.feature
    },
    {
      title: has("安靜包廂") ? "安靜四人桌或包廂感座位" : "四人分享餐與主桌聚會",
      tag: "座位",
      body: has("安靜包廂")
        ? "適合商務交流、生日聚會或想避開主空間活動聲量的客人。"
        : "四人分享餐 800 元適合朋友聚會，也可搭配飲料、桌遊或 K 歌需求。"
    },
    {
      title: has("桌遊") || has("K歌歡唱") ? "桌遊娛樂與 K 歌歡唱" : "官方 LINE 會員 8 折",
      tag: has("桌遊") || has("K歌歡唱") ? "娛樂" : "會員",
      body: has("桌遊") || has("K歌歡唱")
        ? "適合課後放鬆、社團聚會與認識新朋友；可先詢問可用桌遊、投影與音樂設備。"
        : "6 月開幕期間，完成官方 LINE 入會程序後，當天消費 8 折；點數制度目前規劃中。"
    }
  ];

  $("#recommendList").innerHTML = cards
    .map((card) => `
      <article class="recommend-card">
        <header>
          <strong>${card.title}</strong>
          <span>${card.tag}</span>
        </header>
        <p>${card.body}</p>
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
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    }).catch(() => {});
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
