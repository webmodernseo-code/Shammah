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

  function setupChartToggle() {
    const btnWeek = document.getElementById("btn-chart-week");
    const btnMonth = document.getElementById("btn-chart-month");
    if (!btnWeek || !btnMonth) return;

    const curvePath = document.getElementById("chart-curve-path");
    const areaPath = document.getElementById("chart-area-path");
    const cursorLine = document.getElementById("chart-cursor-line");
    const glowDot = document.getElementById("chart-glow-dot");
    const innerDot = document.getElementById("chart-inner-dot");
    const tooltipGroup = document.getElementById("chart-tooltip-group");
    const tooltipText = document.getElementById("chart-tooltip-text");
    const trendBadge = document.getElementById("chart-trend-badge");
    const lbl1 = document.getElementById("chart-label-1");
    const lbl2 = document.getElementById("chart-label-2");
    const lbl3 = document.getElementById("chart-label-3");
    const lbl4 = document.getElementById("chart-label-4");

    const weeklyData = {
      curve: "M 20 105 C 70 105, 70 85, 120 85 C 180 85, 190 45, 240 45 C 290 45, 290 75, 330 75",
      area: "M 20 105 C 70 105, 70 85, 120 85 C 180 85, 190 45, 240 45 C 290 45, 290 75, 330 75 L 330 110 L 20 110 Z",
      cx: 240, cy: 45, tooltipTranslate: "translate(200, 7)", tooltipValue: "245 000 FCFA",
      trend: "+12.5% vs semaine dernière", labels: ["Lun", "Mer", "Ven", "Dim"]
    };
    const monthlyData = {
      curve: "M 20 95 C 70 95, 70 105, 120 105 C 180 105, 190 35, 240 35 C 290 35, 290 55, 330 55",
      area: "M 20 95 C 70 95, 70 105, 120 105 C 180 105, 190 35, 240 35 C 290 35, 290 55, 330 55 L 330 110 L 20 110 Z",
      cx: 240, cy: 35, tooltipTranslate: "translate(200, -3)", tooltipValue: "1 050 000 FCFA",
      trend: "+18.3% vs mois dernier", labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"]
    };

    function updateChart(data) {
      if (curvePath) curvePath.setAttribute("d", data.curve);
      if (areaPath) areaPath.setAttribute("d", data.area);
      if (cursorLine) { cursorLine.setAttribute("x1", data.cx); cursorLine.setAttribute("x2", data.cx); }
      if (glowDot) { glowDot.setAttribute("cx", data.cx); glowDot.setAttribute("cy", data.cy); }
      if (innerDot) { innerDot.setAttribute("cx", data.cx); innerDot.setAttribute("cy", data.cy); }
      if (tooltipGroup) tooltipGroup.setAttribute("transform", data.tooltipTranslate);
      if (tooltipText) tooltipText.textContent = data.tooltipValue;
      if (trendBadge) trendBadge.textContent = data.trend;
      if (lbl1) lbl1.textContent = data.labels[0];
      if (lbl2) lbl2.textContent = data.labels[1];
      if (lbl3) lbl3.textContent = data.labels[2];
      if (lbl4) lbl4.textContent = data.labels[3];
    }

    btnWeek.addEventListener("click", () => { btnWeek.classList.add("active"); btnMonth.classList.remove("active"); updateChart(weeklyData); });
    btnMonth.addEventListener("click", () => { btnMonth.classList.add("active"); btnWeek.classList.remove("active"); updateChart(monthlyData); });
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
