/*
 * 纯静态演示站的轻量前端降级：
 * - 搜索：读取构建时生成的 /search-index.json
 * - 评论：返回构建时预置的 HTML，提交被禁用
 * - 表态：按当前 badge 计数做前端增减
 * 不匹配的请求原样交给原生 fetch。
 */
(function () {
  var originalFetch = window.fetch.bind(window);
  var indexPromise = null;

  function jsonResponse(data) {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(
      /[&<>"']/g,
      function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[char];
      },
    );
  }

  function getIndex() {
    if (!indexPromise) {
      indexPromise = originalFetch("/search-index.json").then(function (res) {
        return res.json();
      });
    }
    return indexPromise;
  }

  function handleSearch(url) {
    var path = url.pathname.replace(/^\/search\//, "").replace(/\/$/, "");
    var query = decodeURIComponent(path).trim();
    if (!query) return jsonResponse({ hits: [], keyword: "" });

    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);

    return getIndex().then(function (index) {
      var hits = index
        .map(function (item) {
          var title = (item.title || "").toLowerCase();
          var description = (item.description || "").toLowerCase();
          var tags = (item.tags || []).join(" ").toLowerCase();
          var content = (item.content || "").toLowerCase();
          var score = 0;

          terms.forEach(function (term) {
            if (title.indexOf(term) >= 0) score += 5;
            if (tags.indexOf(term) >= 0) score += 3;
            if (description.indexOf(term) >= 0) score += 2;
            if (content.indexOf(term) >= 0) score += 1;
          });

          return {
            title: item.title,
            permalink: item.permalink,
            description: escapeHtml(item.description || "").slice(0, 180),
            score: score,
          };
        })
        .filter(function (item) {
          return item.score > 0;
        })
        .sort(function (a, b) {
          return b.score - a.score;
        })
        .slice(0, 20);

      return jsonResponse({ hits: hits, keyword: query });
    });
  }

  function commentsHtml() {
    var element = document.getElementById("demo-comments-html");
    if (!element || !element.textContent) return "";
    try {
      return JSON.parse(element.textContent);
    } catch {
      return "";
    }
  }

  function commentsTotal() {
    var element = document.querySelector("[data-comma-total]");
    return Number(element ? element.textContent : 0) || 0;
  }

  function handleComments(url, init) {
    var action =
      url.searchParams.get("action") ||
      (init && init.method === "POST" ? "submit" : "list");

    if (action === "list") {
      return Promise.resolve(
        jsonResponse({
          ok: true,
          sort: url.searchParams.get("sort") || "recommend",
          total: commentsTotal(),
          hasMore: false,
          html: commentsHtml(),
        }),
      );
    }

    if (action === "submit") {
      return Promise.resolve(
        jsonResponse({
          ok: false,
          msg: "演示站为纯静态站点，评论提交已禁用",
        }),
      );
    }

    if (action === "vote") {
      var coid = url.searchParams.get("coid");
      var vote = url.searchParams.get("vote");
      var countElement = document.querySelector(
        '.js-vote[data-coid="' + coid + '"][data-vote="like"] .comma-count',
      );
      var likes = countElement ? parseInt(countElement.textContent, 10) || 0 : 0;
      if (vote === "like") likes += 1;
      return Promise.resolve(jsonResponse({ ok: true, my: true, likes: likes }));
    }

    return Promise.resolve(jsonResponse({ ok: false }));
  }

  function handleReaction(url) {
    var key = url.searchParams.get("emoji");
    var action = url.searchParams.get("action");
    var countElement = document.querySelector(
      '.gh-badge[data-key="' + key + '"] .gh-count',
    );
    var current = countElement ? parseInt(countElement.textContent, 10) || 0 : 0;
    var count = Math.max(0, current + (action === "remove" ? -1 : 1));

    return Promise.resolve(
      jsonResponse({ ok: true, emoji: key, count: count }),
    );
  }

  window.fetch = function (input, init) {
    var raw = typeof input === "string" ? input : input.url;
    var url = new URL(raw, window.location.href);

    if (
      url.pathname.indexOf("/search/") === 0 &&
      url.searchParams.get("ajax") === "1"
    ) {
      return handleSearch(url);
    }

    if (url.searchParams.get("comma") === "1") {
      return handleComments(url, init);
    }

    if (url.searchParams.get("reaction") === "1") {
      return handleReaction(url);
    }

    return originalFetch(input, init);
  };
})();
