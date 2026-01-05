(function () {
  const STORAGE_KEY = "syllabus_ws2026_state_v1";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const state = {
    theme: "dark",
    collapsed: {},
    expandAll: true
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        if (parsed.theme === "dark" || parsed.theme === "paper") state.theme = parsed.theme;
        if (parsed.collapsed && typeof parsed.collapsed === "object") state.collapsed = parsed.collapsed;
        if (typeof parsed.expandAll === "boolean") state.expandAll = parsed.expandAll;
      }
    } catch (_) {}
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {}
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    const btn = $("#btnTheme");
    if (btn) btn.textContent = `THEME: ${state.theme.toUpperCase()}`;
  }

  function setSectionCollapsed(sectionEl, collapsed) {
    const body = $("[data-body]", sectionEl);
    const caret = $(".caret", sectionEl);
    const id = sectionEl.getAttribute("id") || "";
    if (!body) return;

    body.hidden = collapsed;
    if (caret) caret.textContent = collapsed ? "[+]" : "[–]";
    if (id) state.collapsed[id] = collapsed;
  }

  function applyCollapseState() {
    $$(".section").forEach((sec) => {
      const id = sec.getAttribute("id") || "";
      const collapsed = id in state.collapsed ? !!state.collapsed[id] : false;
      setSectionCollapsed(sec, collapsed);
    });

    const btn = $("#btnExpand");
    if (btn) btn.textContent = state.expandAll ? "EXPAND: ALL" : "EXPAND: NONE";
  }

  function toggleAll(expand) {
    state.expandAll = expand;
    $$(".section").forEach((sec) => setSectionCollapsed(sec, !expand));
    const btn = $("#btnExpand");
    if (btn) btn.textContent = expand ? "EXPAND: ALL" : "EXPAND: NONE";
    saveState();
  }

  function wireSectionToggles() {
    $$("[data-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const section = btn.closest(".section");
        if (!section) return;
        const id = section.getAttribute("id") || "";
        const current = id in state.collapsed ? !!state.collapsed[id] : false;
        setSectionCollapsed(section, !current);
        saveState();
      });
    });
  }

  function wireControls() {
    const btnTheme = $("#btnTheme");
    const btnExpand = $("#btnExpand");
    const btnPrint = $("#btnPrint");

    if (btnTheme) {
      btnTheme.addEventListener("click", () => {
        state.theme = state.theme === "dark" ? "paper" : "dark";
        applyTheme();
        saveState();
      });
    }

    if (btnExpand) {
      btnExpand.addEventListener("click", () => {
        const nextExpand = !state.expandAll;
        toggleAll(nextExpand);
      });
    }

    if (btnPrint) {
      btnPrint.addEventListener("click", () => window.print());
    }
  }

  function updateLastUpdated() {
    const el = $("#lastUpdated");
    if (!el) return;
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    el.textContent = stamp;
  }

  loadState();
  applyTheme();
  wireSectionToggles();
  wireControls();
  applyCollapseState();
  updateLastUpdated();
})();
