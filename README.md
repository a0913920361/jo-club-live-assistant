# JO CLUB 即時輔助工具原型

這個資料夾是第一版手機網頁 / PWA 原型，聚焦驗證「JO CLUB 場域綁定的智慧會員助理」是否有展示價值。

## 原型功能

- 拍照問 JO CLUB：模擬拍菜單、開幕海報、店內空間、外觀招牌與 LINE/IG 資訊後的理解與推薦。
- 直接問 JO CLUB：用文字或語音示範提問，回覆菜單、飲品、輕食、桌遊、包廂、會員權益與聚會安排。
- 今日推薦：依照需求與會員偏好產生餐點、飲品、娛樂活動、座位與會員建議。
- 加入會員：用輕量資料建立會員，偏好慢慢累積。
- 客人回饋評分：讓會員針對入店印象、環境、整潔、服務、餐點與再訪意願留下評分與建議。

## 已導入店內資料

- 店面與空間：外觀夜景、戶外柱燈、主空間、四人桌、牆面品牌牌。
- 菜單：咖啡、飲料、甜點、厚片、義大利麵、水餃、炸物、套餐。
- 會員誘因：2026 年 6 月開幕期間完成入會程序後，當天消費直接 8 折計算；壽星提前告知會準備精美禮品。
- 聯絡資訊：桃園市中壢區實踐路225-11號、03-456-0603、IG `jo_club22511`。
- 營運規則：活動預約、座位配置、店長小江接洽、私人場域保守回答與轉專員接洽。

## 助手知識庫

- `data/jo-club-knowledge-base.json`：給系統使用的結構化資料。
- `docs/jo-club-assistant-knowledge-base-v1.md`：給人閱讀與調整的知識庫文件。

超出菜單、座位、營業、會員優惠與常見活動範圍的問題，第一版會產生「需求卡」，引導會員複製後貼到官方 LINE，由店內人員第一時間接洽。

## 官方 LINE 會員入口

第一版流程改為：

1. 客人先加入 JO CLUB 官方 LINE。
2. 官方 LINE 圖文選單或連結提供「JO CLUB 即時助手」入口。
3. 助手預設使用者已是官方 LINE 會員，不在助手內重複建立會員。
4. 助手內只保留「我的偏好」與「需求卡」，會員資料與後續聯絡由官方 LINE 承接。

## 素材檔案

- `assets/storefront-night.jpg`：首頁主視覺。
- `assets/menu-light-meal-sets.jpg`：義大利麵、輕食與套餐菜單。
- `assets/menu-coffee-dessert-drinks.jpg`：咖啡、飲料與甜點菜單。
- `assets/main-room.jpg`：店內主空間。
- `assets/line-qr.png`：官方 QR CODE / LINE 加入會員 QR Code。
- 其他店內與招牌素材也已保留於 `assets/`，可於後續頁面繼續使用。

## 使用方式

所有網頁原型請用 HTTP 方式展示。

啟動預覽：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\start-preview.ps1
```

打開：

```text
http://127.0.0.1:4174/
```

停止預覽：

```powershell
.\stop-preview.ps1
```
