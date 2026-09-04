# AI Voice App 🤖🎤

نسخه آماده‌ی یک دستیار صوتی فارسی برای اجرا روی GitHub Pages.

## امکانات
- رابط فارسی و RTL
- تشخیص گفتار فارسی در مرورگر
- تبدیل پاسخ به صدا
- حالت آزمایشی بدون API
- اتصال امن به AI از طریق Cloudflare Worker
- نگهداری کلید API در Worker و نه در GitHub Pages

## نصب ساده

### 1) GitHub Pages
فایل `index.html` را در ریشه Repository قرار بده و GitHub Pages را فعال کن.

### 2) Cloudflare Worker
فایل `worker.js` را به عنوان Worker ایجاد/Deploy کن.

در تنظیمات Worker یک Secret با نام زیر بساز:
`OPENAI_API_KEY`

و در صورت نیاز یک متغیر:
`AI_MODEL`

### 3) اتصال
در `index.html` این خط را پیدا کن:
`const WORKER_URL = "https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev";`

و آدرس واقعی Worker خودت را جایگزین کن.

## نکته امنیتی
کلید API را هرگز داخل `index.html` عمومی GitHub قرار نده.
