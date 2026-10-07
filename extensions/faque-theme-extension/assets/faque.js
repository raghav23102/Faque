// Faque — Interactive JS for designs that need client-side behaviour.
// Triggered by the 'faque:loaded' custom event fired from faque-block.liquid
// AFTER the proxied HTML has been injected into the page.
(function () {
  "use strict";

  function initFaque(container) {

    // ── Design 05: Category Tabs ────────────────────────────────────────────
    var d05 = container.querySelector(".faque-d05");
    if (d05) {
      var tabs  = d05.querySelectorAll(".faque-tab-btn");
      var items = d05.querySelectorAll("details.faque-item");

      function filterByCategory(cat) {
        items.forEach(function (item) {
          var matches = cat === "All" || item.dataset.category === cat;
          item.classList.toggle("visible", matches);
        });
      }

      filterByCategory("All");

      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          tabs.forEach(function (t) { t.classList.remove("active"); });
          tab.classList.add("active");
          filterByCategory(tab.dataset.category || "All");
        });
      });
    }

    // ── Design 06: Sidebar FAQ ───────────────────────────────────────────────
    var d06 = container.querySelector(".faque-d06");
    if (d06) {
      var catBtns = d06.querySelectorAll(".faque-cat-btn");
      var items   = d06.querySelectorAll("details.faque-item");

      function filterSidebar(cat) {
        items.forEach(function (item) {
          var matches = cat === "All" || item.dataset.category === cat;
          item.style.display = matches ? "" : "none";
        });
      }

      filterSidebar("All");

      catBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          catBtns.forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          filterSidebar(btn.dataset.category || "All");
        });
      });
    }

    // ── Design 07: Search FAQ ────────────────────────────────────────────────
    var d07 = container.querySelector(".faque-d07");
    if (d07) {
      var input = d07.querySelector(".faque-search");
      var items = d07.querySelectorAll("details.faque-item");
      if (input) {
        input.addEventListener("input", function () {
          var query = input.value.toLowerCase().trim();
          items.forEach(function (item) {
            var text    = item.textContent.toLowerCase();
            var hidden  = query.length > 0 && !text.includes(query);
            item.classList.toggle("hidden", hidden);
          });
        });
      }
    }

    // ── Design 13: Split FAQ ─────────────────────────────────────────────────
    var d13 = container.querySelector(".faque-d13");
    if (d13) {
      var qBtns       = d13.querySelectorAll(".faque-q-btn");
      var answerPanel = d13.querySelector(".faque-answer-panel");

      qBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          qBtns.forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          if (answerPanel) {
            var h3 = answerPanel.querySelector("h3");
            var p  = answerPanel.querySelector("p");
            if (h3) h3.textContent = btn.dataset.question || "";
            if (p)  p.textContent  = btn.dataset.answer   || "";
          }
        });
      });

      // Pre-click first button to populate the answer panel
      if (qBtns.length > 0) qBtns[0].click();
    }
  }

  // The liquid block fires this event once the fetch + innerHTML is done.
  document.addEventListener("faque:loaded", function (e) {
    var container = e.detail && e.detail.container;
    if (container) initFaque(container);
  });

})();
