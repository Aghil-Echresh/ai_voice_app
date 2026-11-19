/* Aghil Worker — memory store (localStorage, loaded second) */
(function () {
  "use strict";
  var KEY = (window.AGHIL_CONFIG && window.AGHIL_CONFIG.storageKeys.memory) || "aghil-worker-memory";

  function uid() {
    return "m" + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
  }
  function load() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY));
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }
  function persist(m) {
    try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {}
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  var MemoryStore = {
    all: function () { return load(); },
    count: function () { return load().length; },
    add: function (text) {
      text = String(text || "").trim();
      if (!text) return null;
      var m = load();
      var item = { id: uid(), text: text, ts: Date.now() };
      m.unshift(item);
      persist(m);
      if (window.renderMemory) window.renderMemory();
      if (window.updateStats) window.updateStats();
      return item;
    },
    remove: function (id) {
      persist(load().filter(function (x) { return x.id !== id; }));
      if (window.renderMemory) window.renderMemory();
      if (window.updateStats) window.updateStats();
    },
    clear: function () {
      persist([]);
      if (window.renderMemory) window.renderMemory();
      if (window.updateStats) window.updateStats();
    }
  };
  window.MemoryStore = MemoryStore;

  window.renderMemory = function () {
    var list = document.getElementById("memoryList");
    if (!list) return;
    var m = load();
    if (!m.length) {
      list.innerHTML = '<div class="empty">هنوز چیزی ذخیره نشده است.</div>';
    } else {
      list.innerHTML = m.map(function (x) {
        var t = "";
        try {
          var d = new Date(x.ts);
          t = d.toLocaleDateString("fa-IR") + " " + d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
        } catch (e) {}
        return '<div class="memory-item"><span>' + esc(x.text) + '</span>' +
          '<div class="memory-meta"><small>' + esc(t) + '</small>' +
          '<button class="mini-danger" onclick="deleteMemory(\'' + x.id + '\')">حذف</button></div></div>';
      }).join("");
    }
    var c = document.getElementById("memoryCount");
    if (c) c.textContent = m.length;
  };

  window.deleteMemory = function (id) {
    MemoryStore.remove(id);
    if (window.addLog) window.addLog("memory deleted");
  };

  window.clearMemory = function () {
    if (!MemoryStore.count()) return;
    if (confirm("همه حافظه پاک شود؟")) {
      MemoryStore.clear();
      if (window.addLog) window.addLog("memory cleared");
    }
  };
})();
