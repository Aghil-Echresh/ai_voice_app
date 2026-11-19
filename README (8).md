# Aghil Worker 🤖⚡

AI Worker Dashboard — یک سایت استاتیک ساده (بدون نیاز به سرور).

## فایل‌ها

| فایل | کار |
|---|---|
| `index.html` | ساختار صفحه |
| `style.css` | ظاهر تیره و راست‌چین |
| `config.js` | تنظیمات پیش‌فرض (باید اول لود شود) |
| `memory.js` | حافظه Worker با localStorage |
| `app.js` | تنظیمات، ابزارها، چت، لاگ، آمار |

ترتیب لود اسکریپت‌ها در `index.html` مهم است: `config.js` بعد `memory.js` بعد `app.js`.

## اجرا روی گیت‌هاب (GitHub Pages)

1. در گیت‌هاب یک ریپو جدید بساز (مثلاً `aghil-worker`) — Public.
2. هر ۵ فایل را با **همان اسم‌ها** آپلود کن (`Add file` → `Upload files` → `Commit`).
3. برو به `Settings` → `Pages` → قسمت `Build and deployment`:
   - Source = `Deploy from a branch`
   - Branch = `main` و پوشه `/ (root)` → `Save`
4. بعد از ۱-۲ دقیقه سایت بالا می‌آید:
   `https://USERNAME.github.io/aghil-worker/`

## نکته‌ها

- اطلاعات (تنظیمات، حافظه، پیام‌ها) فقط در مرورگر همان دستگاه ذخیره می‌شود (localStorage).
- چت فعلاً آفلاین و هوشمندِ ساده است (بدون هوش مصنوعی واقعی).
- اتصال واقعی WhatsApp / وب / GitHub به بک‌اند نیاز دارد و برای نسخه بعدی است.
