// SHAMMAH - Dashboard Administration Operations

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  setupNavigation();
}

// 1. SPA Tab switching
function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  const panels = document.querySelectorAll(".workspace-panel");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      navItems.forEach(n => n.classList.remove("active"));
      item.classList.add("active");

      const targetPanel = item.getAttribute("data-target");
      panels.forEach(p => {
        if (p.id === targetPanel) {
          p.classList.add("active");
        } else {
          p.classList.remove("active");
        }
      });
    });
  });
}
