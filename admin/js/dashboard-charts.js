(function () {
  "use strict";

  function renderRevenueBarChart(container, buckets, options) {
    options = options || {};
    container.innerHTML = "";
    container.style.position = "relative";

    const maxTotal = Math.max(1, ...buckets.map(b => b.total));
    const width = 560;
    const height = 220;
    const paddingBottom = 26;
    const paddingTop = 10;
    const chartHeight = height - paddingBottom - paddingTop;
    const barGap = 14;
    const barWidth = (width - barGap * (buckets.length + 1)) / buckets.length;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 " + width + " " + height);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.overflow = "visible";

    buckets.forEach((bucket, i) => {
      const barHeight = Math.max(4, (bucket.total / maxTotal) * chartHeight);
      const x = barGap + i * (barWidth + barGap);
      const y = paddingTop + (chartHeight - barHeight);

      const rect = document.createElementNS(svgNS, "rect");
      rect.setAttribute("class", "revenue-bar");
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);
      rect.setAttribute("width", barWidth);
      rect.setAttribute("height", barHeight);
      rect.setAttribute("rx", 6);
      rect.setAttribute("fill", "var(--accent-primary)");
      svg.appendChild(rect);

      const label = document.createElementNS(svgNS, "text");
      label.setAttribute("x", x + barWidth / 2);
      label.setAttribute("y", height - 8);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("font-size", "9");
      label.setAttribute("fill", "var(--text-body)");
      label.textContent = bucket.label;
      svg.appendChild(label);

      rect.addEventListener("mouseenter", () => showTooltip(container, bucket, x + barWidth / 2, y));
      rect.addEventListener("mouseleave", () => hideTooltip(container));
    });

    container.appendChild(svg);

    if (options.trend !== undefined && options.trend !== null) {
      const badge = document.createElement("span");
      badge.className = "chart-trend-floating badge-status " + (options.trend >= 0 ? "success" : "danger");
      badge.textContent = (options.trend >= 0 ? "+" : "") + options.trend.toFixed(1) + "% vs période précédente";
      container.appendChild(badge);
    }
  }

  function showTooltip(container, bucket, x, y) {
    hideTooltip(container);
    const tooltip = document.createElement("div");
    tooltip.className = "revenue-bar-tooltip";
    tooltip.innerHTML =
      '<strong></strong><br><span class="tooltip-count"></span><br><span class="tooltip-total"></span>';
    tooltip.querySelector("strong").textContent = bucket.dateLabel;
    tooltip.querySelector(".tooltip-count").textContent = bucket.count + " commande(s)";
    tooltip.querySelector(".tooltip-total").textContent = window.formatPrice(bucket.total);
    tooltip.style.left = (x / 560 * 100) + "%";
    container.appendChild(tooltip);

    // `y` is expressed in the <svg>'s own coordinate space, whose origin sits at the
    // container's content-box top edge. `tooltip.style.top`, however, is resolved against
    // the container's padding box (the containing block established by the container's own
    // `position: relative`), which starts `paddingTop` px higher. Read that real padding
    // instead of assuming it, then lift the tooltip fully above the bar's own top edge by
    // the tooltip's *actual measured* height (not a hardcoded pixel guess) plus a small
    // fixed gap. For tall bars near the chart's max height, this can compute to a negative
    // offset (escaping above the container into the card header), so clamp the final
    // result to a small positive minimum - the tooltip then sits pinned near the top of
    // the container instead of overlapping the header, while every other bar (where there
    // is room above it) keeps its accurate, distinct position.
    const containerPaddingTop = parseFloat(getComputedStyle(container).paddingTop) || 0;
    const gap = 8;
    const computedTop = containerPaddingTop + y - tooltip.offsetHeight - gap;
    tooltip.style.top = Math.max(4, computedTop) + "px";
  }

  function hideTooltip(container) {
    const existing = container.querySelector(".revenue-bar-tooltip");
    if (existing) existing.remove();
  }

  window.DashboardCharts = { renderRevenueBarChart: renderRevenueBarChart };
})();
