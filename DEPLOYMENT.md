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

## LINE 圖文選單設定

部署完成後，將 LINE 圖文選單 F 區改成：

- 類型：連結
- URL：Cloudflare Pages 產生的 HTTPS 網址

如果之後使用自訂網域，可改成：

```text
https://jo-club.com/assistant
```
