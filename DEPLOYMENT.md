# GitHub + Cloudflare Pages 部署

## 建議設定

- Repository name: `jo-club-live-assistant`
- Production branch: `main`
- Framework preset: `None`
- Build command: 留空
- Build output directory: `/`

## 上傳到 GitHub

如果使用 GitHub 網頁上傳：

1. 在 GitHub 建立新 repository。
2. Repository name 填 `jo-club-live-assistant`。
3. 不需要選 template。
4. 將此資料夾內的所有檔案上傳到 repository 根目錄。
5. 確認 `index.html` 位於 repository 根目錄，不要多包一層資料夾。

## 部署到 Cloudflare Pages

1. 進入 Cloudflare Dashboard。
2. 選 `Workers & Pages`。
3. 選 `Create application`。
4. 選 `Pages`。
5. 連接 GitHub repository：`jo-club-live-assistant`。
6. Framework preset 選 `None`。
7. Build command 留空。
8. Build output directory 填 `/`。
9. 部署完成後，Cloudflare 會產生 HTTPS 網址。

## 回饋後台儲存設定

客人送出「回饋」後，前端會呼叫：

```text
/api/feedback
```

正式要集中保存到後台，需要在 Cloudflare 設定 KV：

1. 進入 Cloudflare Dashboard。
2. 進入 `Workers & Pages`。
3. 建立一個 KV namespace，例如 `JO_CLUB_FEEDBACK`。
4. 回到 Pages 專案 `jo-club-live-assistant`。
5. 進入 `Settings`。
6. 找到 `Functions` 或 `Bindings`。
7. 新增 KV binding：
   - Variable name：`FEEDBACK_STORE`
   - KV namespace：選 `JO_CLUB_FEEDBACK`
8. 建議再新增環境變數：
   - Variable name：`FEEDBACK_ADMIN_PIN`
   - Value：自訂一組後台 PIN
9. 儲存後重新部署一次。

後台查看網址：

```text
https://jo-club-live-assistant.pages.dev/feedback-admin.html
```

若有設定 `FEEDBACK_ADMIN_PIN`，進後台後輸入 PIN 再讀取紀錄。

## 店內即時通知設定

客人送出「揪活動」後，前端會呼叫：

```text
/api/feedback
```

如果要讓店內人員立刻收到 LINE 通知，建議使用 LINE Messaging API 推播到店內群組或指定店員帳號。

Cloudflare Pages 需要新增環境變數：

- `LINE_CHANNEL_ACCESS_TOKEN`：LINE Developers 後台 Messaging API channel access token。
- `LINE_STAFF_TO`：接收通知的 `userId`、`groupId` 或 `roomId`。

設定方式：

1. 進入 LINE Developers，確認官方帳號已啟用 Messaging API。
2. 取得 Channel access token。
3. 如果要通知店內群組，把官方帳號邀請進店內 LINE 群組。
4. 透過 webhook 事件取得該群組的 `groupId`。
5. 進入 Cloudflare Pages 專案 `jo-club-live-assistant`。
6. 進入 `Settings`。
7. 新增環境變數 `LINE_CHANNEL_ACCESS_TOKEN` 與 `LINE_STAFF_TO`。
8. 重新部署。

若暫時不用 LINE，也可設定通用 webhook：

- `STAFF_WEBHOOK_URL`：可接收 JSON POST 的通知網址，例如 Discord、Slack 或自建通知服務。

## LINE 圖文選單設定

部署完成後，將 LINE 圖文選單 F 區改成：

- 類型：連結
- URL：Cloudflare Pages 產生的 HTTPS 網址

如果之後使用自訂網域，可改成：

```text
https://jo-club.com/assistant
```
