(function () {
  "use strict";

  // ---------- formatPrice ----------
  window.formatPrice = function formatPrice(val) {
    const num = parseFloat(val) || 0;
    if (num >= 1000) return num.toLocaleString('fr-FR') + " FCFA";
    return "$" + num.toFixed(2);
  };

  // ---------- Toast ----------
  let toastContainer = null;

  function ensureToastContainer() {
    if (toastContainer) return toastContainer;
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
    return toastContainer;
  }

  function showToast(message, type) {
    type = type || "info";
    const container = ensureToastContainer();
    const toast = document.createElement("div");
    toast.className = "toast toast-" + type;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("toast-visible"));

    setTimeout(() => {
      toast.classList.remove("toast-visible");
      toast.classList.add("toast-hiding");
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  window.Toast = { show: showToast };

  // ---------- Confirm Modal ----------
  function openConfirm(options) {
    options = options || {};
    const title = options.title || "Confirmer";
    const message = options.message || "";
    const confirmLabel = options.confirmLabel || "Confirmer";
    const danger = !!options.danger;

    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "confirm-overlay";
      overlay.innerHTML =
        '<div class="confirm-modal">' +
          '<h3></h3><p></p>' +
          '<div class="confirm-modal-actions">' +
            '<button class="btn-secondary" data-action="cancel">Annuler</button>' +
            '<button class="' + (danger ? "btn-danger" : "btn-primary") + '" data-action="confirm"></button>' +
          '</div>' +
        '</div>';
      overlay.querySelector("h3").textContent = title;
      overlay.querySelector("p").textContent = message;
      overlay.querySelector('[data-action="confirm"]').textContent = confirmLabel;
      document.body.appendChild(overlay);

      function close(result) {
        overlay.remove();
        document.removeEventListener("keydown", onKeydown);
        resolve(result);
      }
      function onKeydown(e) { if (e.key === "Escape") close(false); }

      overlay.addEventListener("click", (e) => { if (e.target === overlay) close(false); });
      overlay.querySelector('[data-action="cancel"]').addEventListener("click", () => close(false));
      overlay.querySelector('[data-action="confirm"]').addEventListener("click", () => close(true));
      document.addEventListener("keydown", onKeydown);
    });
  }

  window.ConfirmModal = { open: openConfirm };

  // ---------- Theme ----------
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  function initTheme() {
    const saved = localStorage.getItem("shammah_admin_theme");
    const theme = saved || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    applyTheme(theme);

    const btn = document.getElementById("theme-toggle-btn");
    if (btn) {
      btn.addEventListener("click", () => {
        const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(next);
        localStorage.setItem("shammah_admin_theme", next);
      });
    }
  }

  // ---------- Sidebar collapse ----------
  function initSidebarCollapse() {
    const appContainer = document.querySelector(".app-container");
    const btn = document.getElementById("sidebar-toggle-btn");
    if (!appContainer || !btn) return;

    if (localStorage.getItem("shammah_admin_sidebar_collapsed") === "true") {
      appContainer.classList.add("sidebar-collapsed");
    }

    btn.addEventListener("click", () => {
      appContainer.classList.toggle("sidebar-collapsed");
      localStorage.setItem("shammah_admin_sidebar_collapsed", appContainer.classList.contains("sidebar-collapsed"));
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initSidebarCollapse();
  });
})();
