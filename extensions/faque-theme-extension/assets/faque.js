// Faque — Interactive JS for all 15 designs
// Runs after the liquid block fires 'faque:loaded', once the proxied HTML is in the DOM.
(function () {
  "use strict";

  function initFaque(container) {

    // ---- Design 05: Category Tabs ----
    var d05 = container.querySelector(".faque-d05");
    if (d05) {
      var tabs = d05.querySelectorAll(".faque-tab-btn");
      var items = d05.querySelectorAll(".faque-item");

      function filterByCategory(cat) {
        items.forEach(function (item) {
          if (cat === "All" || item.dataset.category === cat) {
            item.classList.add("visible");
          } else {
            item.classList.remove("visible");
          }
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

    // ---- Design 06: Sidebar FAQ ----
    var d06 = container.querySelector(".faque-d06");
    if (d06) {
      var catBtns = d06.querySelectorAll(".faque-cat-btn");
      var items = d06.querySelectorAll(".faque-item");

      function filterSidebar(cat) {
        items.forEach(function (item) {
          item.style.display =
            cat === "All" || item.dataset.category === cat ? "" : "none";
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

    // ---- Design 07: Search FAQ ----
    var d07 = container.querySelector(".faque-d07");
    if (d07) {
      var input = d07.querySelector(".faque-search");
      if (input) {
        var items = d07.querySelectorAll(".faque-item");
        input.addEventListener("input", function () {
          var query = input.value.toLowerCase().trim();
          items.forEach(function (item) {
            var text = item.textContent.toLowerCase();
            item.classList.toggle("hidden", query.length > 0 && !text.includes(query));
          });
        });
      }
    }

    // ---- Design 13: Split FAQ ----
    var d13 = container.querySelector(".faque-d13");
    if (d13) {
      var qBtns = d13.querySelectorAll(".faque-q-btn");
      var answerPanel = d13.querySelector(".faque-answer-panel");

      qBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          qBtns.forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          if (answerPanel) {
            answerPanel.querySelector("h3").textContent = btn.dataset.question || "";
            answerPanel.querySelector("p").textContent = btn.dataset.answer || "";
          }
        });
      });

      // Activate first button by default
      if (qBtns.length > 0) qBtns[0].click();
    }
  }

  // Listen for the custom event fired by the liquid block after the proxy HTML is injected.
  document.addEventListener("faque:loaded", function (e) {
    var container = e.detail && e.detail.container;
    if (container) {
      initFaque(container);
    }
  });

})();
