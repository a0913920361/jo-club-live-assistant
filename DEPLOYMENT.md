# JO CLUB 即時會員助理部署說明

## 目前部署目標

- GitHub repository：`jo-club-live-assistant`
- Cloudflare Pages 網址：`https://jo-club-live-assistant.pages.dev/`
- LINE 官方圖文選單的 `JO 助手` 按鈕連到 Cloudflare Pages 網址

## 上傳更新檔案

每次修改後，把本資料夾內容重新上傳到 GitHub repository 根目錄。

這次 AI 版一定要包含：

- `index.html`
- `styles.css`
- `app.js`
- `manifest.webmanifest`
- `sw.js`
- `assets/`
- `functions/api/ask.js`

`functions/api/ask.js` 是真正 AI 助手的後端入口，不能漏掉。

## Cloudflare Pages 設定

Cloudflare Pages 連接 GitHub 時建議設定：

- Framework preset：`None`
- Build command：留空
- Build output directory：`/`
- Production branch：`main`

## 啟用真正 AI 助手

這版已經加入 Cloudflare Pages Functions：

- 前端會呼叫：`/api/ask`
- 後端檔案：`functions/api/ask.js`
- OpenAI API key 只放在 Cloudflare，不會放在網頁裡

Cloudflare 設定方式：

1. 進入 Cloudflare Dashboard
2. 點 `Workers 和 Pages`
3. 點 `jo-club-live-assistant`
4. 進入 `Settings`
5. 找到 `Environment variables`
6. 新增變數：
   - Variable name：`OPENAI_API_KEY`
   - Value：貼上 OpenAI API key
7. 可選變數：
   - Variable name：`OPENAI_MODEL`
   - Value：`gpt-4.1-mini`
8. 儲存後重新部署一次

如果沒有設定 `OPENAI_API_KEY`，網頁仍可點選操作，但會顯示備援回覆，不是真正 AI 思考。

## LINE 圖文選單建議

- A 認識我們：文字 `認識我們`
- B 停車資訊：文字 `停車資訊`
- C 預約專區：連結官方 Google 表單
- D 菜單：文字 `MENU`
- E 最新優惠：文字 `最新優惠`
- F JO 助手：連結 `https://jo-club-live-assistant.pages.dev/`

A、B、D、E 如果設定成「文字」，還需要在 LINE 官方管理後台補「自動回應訊息」，不然客人按了只會送出文字。
