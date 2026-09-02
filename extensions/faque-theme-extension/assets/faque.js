// Faque — Interactive JS for all 15 designs
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    // ---- Design 05: Category Tabs ----
    document.querySelectorAll(".faque-d05").forEach(function (container) {
      const tabs = container.querySelectorAll(".faque-tab-btn");
      const items = container.querySelectorAll(".faque-item");

      function filterByCategory(cat) {
        items.forEach(function (item) {
          if (cat === "all" || item.dataset.category === cat) {
            item.classList.add("visible");
          } else {
            item.classList.remove("visible");
          }
        });
      }

      // Show all by default
      filterByCategory("all");

      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          tabs.forEach(function (t) { t.classList.remove("active"); });
          tab.classList.add("active");
          filterByCategory(tab.dataset.category || "all");
        });
      });
    });

    // ---- Design 06: Sidebar FAQ ----
    document.querySelectorAll(".faque-d06").forEach(function (container) {
      const catBtns = container.querySelectorAll(".faque-cat-btn");
      const items = container.querySelectorAll(".faque-item");

      function filterSidebar(cat) {
        items.forEach(function (item) {
          item.style.display =
            cat === "all" || item.dataset.category === cat ? "block" : "none";
        });
      }

      filterSidebar("all");

      catBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          catBtns.forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          filterSidebar(btn.dataset.category || "all");
        });
      });
    });

    // ---- Design 07: Search FAQ ----
    document.querySelectorAll(".faque-d07 .faque-search").forEach(function (input) {
      const container = input.closest(".faque-d07");
      const items = container.querySelectorAll(".faque-item");

      input.addEventListener("input", function () {
        const query = input.value.toLowerCase().trim();
        items.forEach(function (item) {
          const text = item.textContent.toLowerCase();
          item.classList.toggle("hidden", query.length > 0 && !text.includes(query));
        });
      });
    });

    // ---- Design 13: Split FAQ ----
    document.querySelectorAll(".faque-d13").forEach(function (container) {
      const qBtns = container.querySelectorAll(".faque-q-btn");
      const answerPanel = container.querySelector(".faque-answer-panel");

      qBtns.forEach(function (btn, idx) {
        btn.addEventListener("click", function () {
          qBtns.forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          if (answerPanel) {
            answerPanel.querySelector("h3").textContent = btn.dataset.question || "";
            answerPanel.querySelector("p").textContent = btn.dataset.answer || "";
          }
        });
      });

      // Activate first by default
      if (qBtns.length > 0) qBtns[0].click();
    });
  });
})();
