/* Aghil Worker — app logic (settings, tools, chat, logs). Loaded last. */
(function () {
  "use strict";
  var CFG = window.AGHIL_CONFIG || {};
  var SKEY = (CFG.storageKeys && CFG.storageKeys.settings) || "aghil-worker-v1";

  function defaults() {
    var d = CFG.defaultSettings || {};
    return {
      workerName: d.workerName || "Aghil Worker",
      mission: d.mission || "",
      personality: d.personality || "friendly",
      tools: Object.assign({ whatsapp: false, web: false, github: false, memory: true }, d.tools || {}),
      messages: 0
    };
  }

  function loadState() {
    try {
      var s = JSON.parse(localStorage.getItem(SKEY));
      if (s && typeof s === "object") {
        var d = defaults();
        d.workerName = s.workerName || d.workerName;
        d.mission = (s.mission != null ? s.mission : d.mission);
        d.personality = s.personality || d.personality;
        d.tools = Object.assign(d.tools, s.tools || {});
        d.messages = s.messages || 0;
        return d;
      }
    } catch (e) {}
    return defaults();
  }

  var state = loadState();

  function persist() {
    try { localStorage.setItem(SKEY, JSON.stringify(state)); } catch (e) {}
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function setText(id, v) {
    var e = document.getElementById(id);
    if (e) e.textContent = v;
  }
  function fieldVal(id, fb) {
    var e = document.getElementById(id);
    return e ? e.value : fb;
  }

  window.addLog = function (msg) {
    var logs = document.getElementById("logs");
    if (!logs) return;
    var t = "";
    try { t = new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }); } catch (e) {}
    var div = document.createElement("div");
    div.className = "log";
    div.innerHTML = "<span>●</span> " + esc(t ? t + " — " : "") + esc(msg);
    logs.insertBefore(div, logs.firstChild);
    var limit = CFG.logLimit || 60;
    while (logs.children.length > limit) logs.removeChild(logs.lastChild);
  };

  window.updateStats = function () {
    setText("memoryCount", window.MemoryStore ? window.MemoryStore.count() : 0);
    var on = 0, k;
    for (k in state.tools) if (state.tools[k]) on++;
    setText("toolCount", on + "/4");
    setText("messageCount", state.messages);
  };

  window.saveWorkerSettings = function () {
    state.workerName = fieldVal("workerName", state.workerName) || state.workerName;
    state.mission = fieldVal("workerMission", state.mission);
    state.personality = fieldVal("personality", state.personality);
    persist();
    window.addLog("settings saved ✅");
  };

  var TOOL_INPUTS = { whatsapp: "whatsappTool", web: "webTool", github: "githubTool", memory: "memoryTool" };

  window.toggleTool = function (name) {
    state.tools[name] = !state.tools[name];
    var e = document.getElementById(TOOL_INPUTS[name]);
    if (e) e.checked = !!state.tools[name];
    persist();
    window.updateStats();
    window.addLog("tool " + name + " → " + (state.tools[name] ? "on" : "off"));
  };

  window.handleEnter = function (e) {
    if (e && e.key === "Enter") window.sendMessage();
  };

  function pushMsg(who, text) {
    var chat = document.getElementById("chat");
    if (!chat) return;
    var row = document.createElement("div");
    row.className = "message " + who;
    row.innerHTML = '<div class="avatar">' + (who === "bot" ? "🤖" : "🧑") + "</div>" +
      '<div class="bubble">' + esc(text).replace(/\n/g, "<br>") + "</div>";
    chat.appendChild(row);
    chat.scrollTop = chat.scrollHeight;
  }

  function showTyping(done) {
    var chat = document.getElementById("chat");
    if (!chat) { done(); return; }
    var row = document.createElement("div");
    row.className = "message bot typing";
    row.innerHTML = '<div class="avatar">🤖</div><div class="bubble"><span class="tdot"></span><span class="tdot"></span><span class="tdot"></span></div>';
    chat.appendChild(row);
    chat.scrollTop = chat.scrollHeight;
    setTimeout(function () {
      if (row.parentNode) row.parentNode.removeChild(row);
      done();
    }, (CFG.typingDelay || 700));
  }

  var REMEMBER_RE = /به خاطر بسپار|یادت باشه|یادآوری کن|remember/i;

  function maybeRemember(text) {
    if (!window.MemoryStore) return false;
    if (REMEMBER_RE.test(text)) {
      var fact = text.replace(/لطفا|لطفاً|به خاطر بسپار|یادت باشه|یادآوری کن|remember/gi, "").replace(/[«»"']/g, "").trim();
      if (fact) {
        window.MemoryStore.add(fact);
        window.addLog("memory saved");
        return true;
      }
      return false;
    }
    var m = text.match(/اسم من (.+) است|نام من (.+) است|my name is (.+)/i);
    if (m) {
      var nm = String(m[1] || m[2] || m[3] || "").trim();
      if (nm) {
        window.MemoryStore.add("نام کاربر: " + nm);
        window.addLog("memory saved");
        return true;
      }
    }
    return false;
  }

  window.sendMessage = function () {
    var inp = document.getElementById("messageInput");
    if (!inp) return;
    var text = (inp.value || "").trim();
    if (!text) return;
    inp.value = "";
    pushMsg("user", text);
    state.messages++;
    persist();
    window.updateStats();
    var remembered = maybeRemember(text);
    showTyping(function () {
      pushMsg("bot", botReply(text, remembered));
      state.messages++;
      persist();
      window.updateStats();
    });
  };

  function toolsStatus() {
    var names = { whatsapp: "WhatsApp", web: "Web", github: "GitHub", memory: "Memory" };
    return Object.keys(names).map(function (k) {
      return (state.tools[k] ? "✅ " : "⬜ ") + names[k];
    }).join("\n");
  }

  function botReply(text, remembered) {
    if (/سلام|درود|^هی$/i.test(text)) return "سلام! 👋 من " + state.workerName + " هستم. چطور کمکت کنم؟ (بنویس «کمک» تا راهنماییت کنم)";
    if (/کمک|راهنما|help/i.test(text)) return "راهنما:\n• «وضعیت» → آمار Worker\n• «ابزارها» → وضعیت ابزارها\n• «حافظه» → چیزهای ذخیره‌شده\n• «به خاطر بسپار ...» → ذخیره در حافظه\n• «اسم من ... است» → معرفی";
    if (/وضعیت|آمار|status/i.test(text)) return "وضعیت " + state.workerName + ":\n🧠 حافظه: " + (window.MemoryStore ? window.MemoryStore.count() : 0) + "\n💬 پیام‌ها: " + state.messages + "\n🎭 شخصیت: " + state.personality;
    if (/ابزار|tools/i.test(text)) return "ابزارها:\n" + toolsStatus();
    if (/حافظه|memory/i.test(text)) {
      if (!window.MemoryStore || !window.MemoryStore.count()) return "حافظه‌ام خالیه. چیزی بگو تا با «به خاطر بسپار ...» ذخیره‌اش کنم.";
      return "توی حافظه‌ام این‌هاست:\n• " + window.MemoryStore.all().slice(0, 5).map(function (x) { return x.text; }).join("\n• ");
    }
    if (remembered) return "باشه، سپردمش به حافظه 🧠 (از پنل حافظه می‌تونی ببینیش)";
    if (/تشکر|مرسی|ممنون|thanks/i.test(text)) return "خواهش می‌کنم! 🌷 کار دیگه‌ای داری در خدمتم.";
    if (/خداحافظ|بای|فعلا/i.test(text)) return "فعلاً خداحافظ! 👋 هر وقت کاری داشتی من اینجام.";
    if (/واتس|whatsapp/i.test(text)) return state.tools.whatsapp ? "ماژول WhatsApp روشنه ولی اتصال API هنوز در نسخه بعدیه. وقتی وصل شد اینجا خبرت می‌کنم 📱" : "WhatsApp فعلاً خاموشه. از پنل ابزارها روشنش کن (اتصال واقعی در نسخه بعدی).";
    if (/گیت|github/i.test(text)) return state.tools.github ? "ماژول GitHub روشنه. به‌زودی می‌تونم پروژه‌هات رو مدیریت کنم 🐙" : "ماژول GitHub خاموشه. از پنل ابزارها فعالش کن.";
    if (/جستجو|اینترنت|search|web/i.test(text) && !/سایت/i.test(text)) return state.tools.web ? "جست‌وجوی وب هنوز به API وصل نیست؛ ولی به‌زودی اضافه می‌شه 🌐" : "جست‌وجوی وب خاموشه. از پنل ابزارها روشنش کن.";
    if (/^عقیل/i.test(text)) return "بله؟ گوش می‌دم 🙂 بگو چی کار کنم.";
    var p = state.personality;
    if (p === "short") return "گرفتم ✅ («" + text.slice(0, 30) + (text.length > 30 ? "…" : "") + "»). دستور بعدی؟";
    if (p === "professional") return "دریافت شد. درخواست شما ثبت شد و در صف بررسی است:\n«" + text + "»\nنتیجه را همین‌جا اعلام می‌کنم.";
    if (p === "smart") return "تحلیل اولیه: «" + text + "»\nقدم‌های پیشنهادی:\n۱. شفاف‌سازی هدف\n۲. اجرا\n۳. بازبینی\nبگو از کدوم شروع کنیم؟";
    return "فهمیدم 👍 («" + text + "»)\nاگه می‌خوای یادم بمونه بنویس: «به خاطر بسپار ...». برای راهنما بنویس «کمک».";
  }

  function init() {
    var e = document.getElementById("workerName");
    if (e) e.value = state.workerName;
    e = document.getElementById("workerMission");
    if (e) e.value = state.mission;
    e = document.getElementById("personality");
    if (e) e.value = state.personality;
    Object.keys(TOOL_INPUTS).forEach(function (k) {
      var c = document.getElementById(TOOL_INPUTS[k]);
      if (c) c.checked = !!state.tools[k];
    });
    if (window.renderMemory) window.renderMemory();
    window.updateStats();
    window.addLog("Worker initialized");
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
