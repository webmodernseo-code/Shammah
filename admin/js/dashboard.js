(function () {
  "use strict";

  function methodDisplay(method) {
    return window.PaymentIcons ? window.PaymentIcons.forMethodLabel(method) : method;
  }

  // ---------- Date range filtering ----------
  let currentRangeKey = "7d";

  function parseOrderDate(dateStr) {
    // order.date is always produced by `new Date().toLocaleDateString('fr-FR')` -> "dd/mm/yyyy"
    const parts = (dateStr || "").split("/");
    if (parts.length !== 3) return new Date(0);
    return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
  }

  function rangeDays(rangeKey) {
    return rangeKey === "30d" ? 30 : 7;
  }

  function filterByRange(orders, rangeKey) {
    if (rangeKey === "all") return orders;
    const days = rangeDays(rangeKey);
    const start = new Date();
    start.setDate(start.getDate() - days);
    return orders.filter(o => parseOrderDate(o.date) >= start);
  }

  function filterByPreviousRange(orders, rangeKey) {
    if (rangeKey === "all") return [];
    const days = rangeDays(rangeKey);
    const start = new Date();
    start.setDate(start.getDate() - days * 2);
    const end = new Date();
    end.setDate(end.getDate() - days);
    return orders.filter(o => {
      const d = parseOrderDate(o.date);
      return d >= start && d < end;
    });
  }

  function trendPercent(current, previous) {
    if (!previous) return null;
    return ((current - previous) / previous) * 100;
  }

  function renderTrend(elId, value) {
    const el = document.getElementById(elId);
    if (!el) return;
    if (value === null || value === undefined || !isFinite(value)) {
      el.style.display = "none";
      return;
    }
    el.style.display = "";
    const sign = value >= 0 ? "+" : "";
    el.textContent = sign + value.toFixed(1) + "%";
    el.className = "metric-trend " + (value >= 0 ? "up" : "down");
  }

  // ---------- Order detail overlay ----------
  let orderDetailKeydownHandler = null;

  function closeOrderDetail() {
    const overlay = document.getElementById("order-detail-overlay");
    if (overlay) overlay.remove();
    if (orderDetailKeydownHandler) {
      document.removeEventListener("keydown", orderDetailKeydownHandler);
      orderDetailKeydownHandler = null;
    }
  }

  function openOrderDetail(order) {
    // Guard against stacking a second overlay if a "Détail" button is clicked again fast,
    // same spirit as the product drawer duplicate-overlay fix in products.js.
    closeOrderDetail();

    const overlay = document.createElement("div");
    overlay.className = "order-detail-overlay";
    overlay.id = "order-detail-overlay";
    overlay.innerHTML =
      '<div class="order-detail-modal">' +
        '<div class="order-detail-header"><h3></h3><button type="button" class="order-detail-close" aria-label="Fermer">&times;</button></div>' +
        '<div class="order-detail-body">' +
          '<section class="order-detail-section"><h4>Client</h4>' +
            '<p class="order-detail-field"><strong>Email</strong><span class="order-detail-email"></span></p>' +
            '<p class="order-detail-field"><strong>Téléphone</strong><span class="order-detail-phone"></span></p>' +
            '<p class="order-detail-field"><strong>Adresse</strong><span class="order-detail-address"></span></p>' +
          '</section>' +
          '<section class="order-detail-section"><h4>Articles</h4><div class="order-detail-items"></div></section>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    // Every field below is customer-submitted checkout data (js/shammah.js), same trust
    // boundary as the order id/client/date fixed in loadOrdersPanel — always .textContent.
    overlay.querySelector("h3").textContent = "Commande " + order.id;
    overlay.querySelector(".order-detail-email").textContent = order.email || "—";
    overlay.querySelector(".order-detail-phone").textContent = order.phone || "—";
    overlay.querySelector(".order-detail-address").textContent = order.address || "—";

    const itemsContainer = overlay.querySelector(".order-detail-items");
    const items = order.items || [];
    if (items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "order-detail-empty";
      empty.textContent = "Aucun article enregistré pour cette commande.";
      itemsContainer.appendChild(empty);
    } else {
      items.forEach(item => {
        const row = document.createElement("div");
        row.className = "order-detail-item";
        row.innerHTML =
          '<span class="order-detail-item-title"></span>' +
          '<span class="order-detail-item-meta"></span>' +
          '<span class="order-detail-item-qty"></span>' +
          '<span class="order-detail-item-price"></span>';
        row.querySelector(".order-detail-item-title").textContent = item.title || "Article";
        const colorName = (item.variant && item.variant.name) ? item.variant.name : "";
        const metaParts = [];
        if (item.size) metaParts.push("Taille : " + item.size);
        if (colorName) metaParts.push(colorName);
        row.querySelector(".order-detail-item-meta").textContent = metaParts.join(" · ");
        row.querySelector(".order-detail-item-qty").textContent = "x" + (item.qty || 1);
        row.querySelector(".order-detail-item-price").textContent = (item.price !== undefined && item.price !== null) ? window.formatPrice(item.price) : "";
        itemsContainer.appendChild(row);
      });
    }

    function onKeydown(e) { if (e.key === "Escape") closeOrderDetail(); }
    orderDetailKeydownHandler = onKeydown;
    document.addEventListener("keydown", onKeydown);

    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeOrderDetail(); });
    overlay.querySelector(".order-detail-close").addEventListener("click", closeOrderDetail);
  }

  function computeKPIs(allOrders, rangeKey) {
    const current = filterByRange(allOrders, rangeKey);
    const previous = filterByPreviousRange(allOrders, rangeKey);

    const currentNonCancelled = current.filter(o => o.status !== "Annulée");
    const previousNonCancelled = previous.filter(o => o.status !== "Annulée");

    const currentRevenue = currentNonCancelled.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const previousRevenue = previousNonCancelled.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

    const currentCancelled = current.filter(o => o.status === "Annulée");
    const previousCancelled = previous.filter(o => o.status === "Annulée");

    const currentCustomers = new Set(current.map(o => o.email || o.phone).filter(Boolean)).size;
    const previousCustomers = new Set(previous.map(o => o.email || o.phone).filter(Boolean)).size;

    return {
      sales: { value: currentNonCancelled.length, trend: trendPercent(currentNonCancelled.length, previousNonCancelled.length) },
      revenue: { value: currentRevenue, trend: trendPercent(currentRevenue, previousRevenue) },
      customers: { value: currentCustomers, trend: trendPercent(currentCustomers, previousCustomers) },
      refunds: { value: currentCancelled.length, trend: trendPercent(currentCancelled.length, previousCancelled.length) }
    };
  }

  function loadOverviewMetrics() {
    const orders = window.db.getOrders();
    const kpis = computeKPIs(orders, currentRangeKey);

    const salesEl = document.getElementById("val-sales");
    if (salesEl) salesEl.textContent = kpis.sales.value;
    renderTrend("kpi-sales-trend", kpis.sales.trend);

    const revenueEl = document.getElementById("val-revenue");
    if (revenueEl) revenueEl.textContent = window.formatPrice(kpis.revenue.value);
    renderTrend("kpi-revenue-trend", kpis.revenue.trend);

    const customersEl = document.getElementById("val-customers");
    if (customersEl) customersEl.textContent = kpis.customers.value;
    renderTrend("kpi-customers-trend", kpis.customers.trend);

    const refundsEl = document.getElementById("val-refunds");
    if (refundsEl) refundsEl.textContent = kpis.refunds.value;
    renderTrend("kpi-refunds-trend", kpis.refunds.trend);
  }

  function loadOrdersPanel() {
    const tbody = document.getElementById("orders-list-tbody");
    const emptyState = document.getElementById("orders-empty-state");
    if (!tbody) return;

    const orders = window.db.getOrders().slice().reverse();
    tbody.innerHTML = "";
    if (emptyState) emptyState.style.display = orders.length ? "none" : "flex";

    orders.forEach(o => {
      const tr = document.createElement("tr");
      // o.id/o.client/o.date come straight from the customer checkout form (js/shammah.js) —
      // unlike admin-entered category/product/promo names, this is customer-submitted text, so
      // build the row skeleton via innerHTML then assign these three fields via .textContent.
      tr.innerHTML =
        "<td data-cell=\"id\"></td>" +
        "<td data-cell=\"client\"></td>" +
        "<td data-cell=\"date\"></td>" +
        "<td>" + window.formatPrice(o.total) + "</td>" +
        "<td>" + methodDisplay(o.method) + "</td>" +
        "<td><select class=\"order-status-select\" data-id=\"" + o.id + "\">" +
          ["En attente", "Payée", "Expédiée", "Annulée"].map(s =>
            "<option value=\"" + s + "\"" + (s === o.status ? " selected" : "") + ">" + s + "</option>"
          ).join("") +
        "</select></td>" +
        "<td><button type=\"button\" class=\"btn-secondary order-detail-btn\" data-id=\"" + o.id + "\">Détail</button></td>";
      tr.querySelector('[data-cell="id"]').textContent = o.id;
      tr.querySelector('[data-cell="client"]').textContent = o.client;
      tr.querySelector('[data-cell="date"]').textContent = o.date;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".order-status-select").forEach(select => {
      select.addEventListener("change", () => {
        window.db.updateOrderStatus(select.dataset.id, select.value);
        window.Toast.show("Statut de la commande " + select.dataset.id + " mis à jour.", "success");
        refresh();
      });
    });

    tbody.querySelectorAll(".order-detail-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const order = window.db.getOrders().find(o => o.id === btn.dataset.id);
        if (order) openOrderDetail(order);
      });
    });
  }

  function refresh() {
    loadOverviewMetrics();
    loadOrdersPanel();
  }

  function buildWeeklyBuckets(orders) {
    const dayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const buckets = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      buckets.push({ label: dayLabels[(day.getDay() + 6) % 7], total: 0, count: 0, dateLabel: day.toLocaleDateString("fr-FR"), dayStart: day });
    }

    orders.forEach(o => {
      if (o.status === "Annulée") return;
      const d = parseOrderDate(o.date);
      const bucket = buckets.find(b => b.dayStart.toDateString() === d.toDateString());
      if (bucket) {
        bucket.total += parseFloat(o.total) || 0;
        bucket.count += 1;
      }
    });

    return buckets;
  }

  function buildMonthlyBuckets(orders) {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 34); // 5 weeks
    start.setHours(0, 0, 0, 0);

    const buckets = [];
    for (let i = 0; i < 5; i++) {
      const weekStart = new Date(start);
      weekStart.setDate(weekStart.getDate() + i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      buckets.push({ label: "Sem " + (i + 1), total: 0, count: 0, dateLabel: "Sem " + (i + 1) + " (" + weekStart.toLocaleDateString("fr-FR") + ")", weekStart: weekStart, weekEnd: weekEnd });
    }

    orders.forEach(o => {
      if (o.status === "Annulée") return;
      const d = parseOrderDate(o.date);
      const bucket = buckets.find(b => d >= b.weekStart && d < b.weekEnd);
      if (bucket) {
        bucket.total += parseFloat(o.total) || 0;
        bucket.count += 1;
      }
    });

    return buckets;
  }

  function renderRevenueChart(mode) {
    const container = document.getElementById("revenue-chart-body");
    if (!container) return;
    const orders = window.db.getOrders();
    const buckets = mode === "month" ? buildMonthlyBuckets(orders) : buildWeeklyBuckets(orders);

    const currentTotal = buckets.reduce((s, b) => s + b.total, 0);
    // Trend vs the immediately preceding equivalent window — computed by summing orders
    // that fall in the prior window directly, rather than re-running the bucket builders.
    const now = new Date();
    const spanDays = mode === "month" ? 35 : 7;
    const prevStart = new Date(now); prevStart.setDate(prevStart.getDate() - spanDays * 2);
    const prevEnd = new Date(now); prevEnd.setDate(prevEnd.getDate() - spanDays);
    const previousTotal = orders
      .filter(o => o.status !== "Annulée")
      .filter(o => { const d = parseOrderDate(o.date); return d >= prevStart && d < prevEnd; })
      .reduce((s, o) => s + (parseFloat(o.total) || 0), 0);

    const trend = trendPercent(currentTotal, previousTotal);
    window.DashboardCharts.renderRevenueBarChart(container, buckets, { trend: trend });
  }

  function setupChartToggle() {
    const btnWeek = document.getElementById("btn-chart-week");
    const btnMonth = document.getElementById("btn-chart-month");
    if (!btnWeek || !btnMonth) return;

    renderRevenueChart("week");

    btnWeek.addEventListener("click", () => {
      btnWeek.classList.add("active");
      btnMonth.classList.remove("active");
      renderRevenueChart("week");
    });
    btnMonth.addEventListener("click", () => {
      btnMonth.classList.add("active");
      btnWeek.classList.remove("active");
      renderRevenueChart("month");
    });
  }

  function setupDateRangeSelector() {
    const select = document.getElementById("kpi-date-range");
    if (!select) return;
    select.addEventListener("change", () => {
      currentRangeKey = select.value;
      refresh();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    refresh();
    setupChartToggle();
    setupDateRangeSelector();
  });

  window.Dashboard = { refresh: refresh };
})();
