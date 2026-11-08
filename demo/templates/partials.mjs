export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function slugify(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "");
}

export function stripHtml(html) {
  return String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(html) {
  const text = stripHtml(html);
  const cjk = (text.match(/[㐀-鿿]/g) || []).length;
  const words = (
    text.replace(/[㐀-鿿]/g, " ").match(/[A-Za-z0-9]+/g) || []
  ).length;
  return cjk + words;
}

export function readingTime(words) {
  return Math.max(1, Math.ceil(words / 200));
}

export function postPermalink(post) {
  return `/posts/${post.slug}/`;
}

export function categoryPermalink(name) {
  return `/categories/${encodeURIComponent(slugify(name))}/`;
}

export function tagPermalink(name) {
  return `/tags/${encodeURIComponent(slugify(name))}/`;
}

export function excerptOf(post) {
  if (post.excerpt) return post.excerpt;
  const text = stripHtml(post.body);
  return text.length > 120 ? `${text.slice(0, 120)}…` : text;
}

export function numericId(value) {
  let hash = 0;
  for (const char of String(value)) {
    hash = (hash * 31 + char.charCodeAt(0)) % 1000000;
  }
  return hash + 1;
}

function metaIcon(iconClass) {
  return `<div class="meta-icon"><span class="${iconClass} text-xl"></span></div>`;
}

export function postMeta(post, variant) {
  const category = post.category || "未分类";
  const tags = post.tags || [];
  const words = wordCount(post.body);
  const views = post.views ?? 100;

  const tagMarkup =
    variant === "post"
      ? tags.length > 0
        ? `<div class="flex items-center">
            ${metaIcon("icon-[material-symbols--tag-rounded]")}
            ${tags
              .map(
                (tag, index) =>
                  `${index > 0 ? '<span class="mx-1.5 text-sm text-[var(--meta-divider)]">/</span>' : ""}
                   <a href="${tagPermalink(tag)}" class="link-lg transition text-50 text-sm font-medium hover:text-[var(--primary)] dark:hover:text-[var(--primary)] whitespace-nowrap">${escapeHtml(tag)}</a>`,
              )
              .join("")}
          </div>`
        : ""
      : `<div class="flex items-center">
          ${metaIcon("icon-[material-symbols--article-outline-rounded]")}
          <span class="text-50 text-sm font-medium">${words} 字</span>
        </div>
        <div class="flex items-center">
          ${metaIcon("icon-[material-symbols--visibility-outline-rounded]")}
          <span class="text-50 text-sm font-medium">${views}</span>
        </div>`;

  return `<div class="mb-4 flex flex-wrap items-center gap-4 gap-x-4 gap-y-2 text-neutral-500 dark:text-neutral-400">
    <div class="flex items-center">
      ${metaIcon("icon-[material-symbols--calendar-today-outline-rounded]")}
      <span class="text-50 text-sm font-medium">${escapeHtml(post.date)}</span>
    </div>
    <div class="flex items-center">
      ${metaIcon("icon-[material-symbols--book-2-outline-rounded]")}
      <a href="${categoryPermalink(category)}" class="link-lg transition text-50 text-sm font-medium hover:text-[var(--primary)] dark:hover:text-[var(--primary)] whitespace-nowrap">${escapeHtml(category)}</a>
    </div>
    ${tagMarkup}
  </div>`;
}

export function postCard(post, index) {
  const cover = post.cover || "";
  const href = postPermalink(post);
  const tags = post.tags || [];
  const excerpt = excerptOf(post);

  const titleLink = `<a href="${href}" title="${escapeHtml(post.title)}" class="text-90 group mb-3 block w-full text-3xl font-bold transition before:absolute before:left-[18px] before:top-[35px] before:hidden before:h-5 before:w-1 before:rounded-md before:bg-[var(--primary)] hover:text-[var(--primary)] active:text-[var(--title-active)] dark:hover:text-[var(--primary)] dark:active:text-[var(--title-active)] md:before:block">
    ${escapeHtml(post.title)}
    <span class="icon-[material-symbols--chevron-right-rounded] absolute inline translate-y-0.5 text-[2rem] text-[var(--primary)] md:hidden"></span>
    <span class="icon-[material-symbols--chevron-right-rounded] absolute hidden -translate-x-1 translate-y-0.5 text-[2rem] text-[var(--primary)] opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100 md:inline"></span>
  </a>`;

  const tagsMarkup =
    tags.length > 0
      ? `<div class="mt-2 flex flex-wrap justify-start gap-1.5">
          ${tags
            .slice(0, 3)
            .map(
              (tag) =>
                `<a href="${tagPermalink(tag)}" class="link-lg transition text-50 text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap hover:text-[var(--primary)] dark:hover:text-[var(--primary)]"><span># ${escapeHtml(tag)}</span></a>`,
            )
            .join("")}
        </div>`
      : "";

  const coverMarkup = cover
    ? `<a href="${href}" title="${escapeHtml(post.title)}" aria-label="${escapeHtml(post.title)}" class="group relative mx-4 -mb-2 mt-4 max-h-[20vh] overflow-hidden rounded-xl active:scale-95 md:absolute md:bottom-3 md:right-3 md:top-3 md:mx-0 md:mb-0 md:mt-0 md:max-h-none md:w-[var(--coverWidth)]">
        <div class="pointer-events-none absolute z-10 h-full w-full transition group-hover:bg-black/30 group-active:bg-black/50"></div>
        <div class="pointer-events-none absolute z-20 flex h-full w-full items-center justify-center">
          <span class="icon-[material-symbols--chevron-right-rounded] scale-50 text-5xl text-white opacity-0 transition group-hover:scale-100 group-hover:opacity-100"></span>
        </div>
        <img src="${escapeHtml(cover)}" alt="${escapeHtml(post.title)}" class="h-full w-full object-cover" style="object-position: center" loading="lazy">
      </a>`
    : `<a href="${href}" title="${escapeHtml(post.title)}" aria-label="${escapeHtml(post.title)}" class="btn-regular absolute bottom-3 right-3 top-3 !hidden w-[3.25rem] rounded-xl bg-[var(--enter-btn-bg)] hover:bg-[var(--enter-btn-bg-hover)] active:scale-95 active:bg-[var(--enter-btn-bg-active)] md:!flex">
        <span class="icon-[material-symbols--chevron-right-rounded] mx-auto text-4xl text-[var(--primary)] transition"></span>
      </a>`;

  return `<div class="card-base onload-animation relative flex w-full flex-col-reverse overflow-hidden rounded-[var(--radius-large)] md:flex-col" style="animation-delay: calc(var(--content-delay) + ${index} * 50ms); --coverWidth: 28%;">
    <div class="relative pb-6 pl-6 pr-6 pt-6 md:pl-9 md:pr-2 md:pt-7 ${cover ? "w-full md:w-[calc(100%_-_var(--coverWidth)_-_12px)]" : "w-full md:w-[calc(100%_-_52px_-_12px)]"}">
      ${titleLink}
      ${postMeta(post, "card")}
      <div class="text-75 mb-3.5 pr-4 transition line-clamp-2 md:line-clamp-1">${escapeHtml(excerpt)}</div>
      ${tagsMarkup}
    </div>
    ${coverMarkup}
  </div>`;
}

function letterAvatar(name) {
  const letter = escapeHtml((String(name).charAt(0) || "?").toUpperCase());
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="oklch(0.55 0.12 250)"/><text x="32" y="43" font-family="sans-serif" font-size="28" font-weight="700" fill="#fff" text-anchor="middle">${letter}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function renderComment(comment) {
  const author = comment.authorBadge
    ? `${escapeHtml(comment.author)}<span class="comma-badge">作者</span>`
    : escapeHtml(comment.author);

  return `<li class="comma-item" data-coid="${comment.id}" id="comment-${comment.id}">
    <div class="comma-avatar"><img src="${letterAvatar(comment.author)}" alt="" loading="lazy" width="30" height="30"></div>
    <div class="comma-body">
      <div class="comma-head">
        <span class="comma-author">${author}</span>
        <div class="comma-meta"><span>${escapeHtml(comment.date)}</span><span class="dot"></span><span>演示站</span></div>
      </div>
      <div class="comma-text custom-md prose prose-base !max-w-none dark:!prose-invert"><p>${escapeHtml(comment.text)}</p></div>
      <div class="comma-actions">
        <button type="button" class="comma-action js-vote" data-coid="${comment.id}" data-vote="like" aria-label="赞">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>
          <span class="comma-count">${comment.likes}</span>
        </button>
        <button type="button" class="comma-action js-vote" data-coid="${comment.id}" data-vote="dislike" aria-label="踩">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"/></svg>
        </button>
        <button type="button" class="comma-action js-reply" data-coid="${comment.id}" data-author="${escapeHtml(comment.author)}">回复</button>
      </div>
    </div>
  </li>`;
}

export function commentsSection(post, comments) {
  const cid = numericId(post.slug);
  const html = comments.map(renderComment).join("");
  const commaJson = JSON.stringify({
    cid,
    sort: "recommend",
    login: false,
    myVotes: {},
    token: "",
  }).replace(/</g, "\\u003c");
  const commentsJson = JSON.stringify(html).replace(/</g, "\\u003c");

  return `<div class="fuwari-comments card-base relative z-10 w-full px-6 pb-6 pt-6 md:px-9 mt-4" data-cid="${cid}" data-login="0">
    <div class="comma-header">
      <div class="comma-title">
        <span>评论</span>
        <span class="comma-title-count" data-comma-total>${comments.length}</span>
      </div>
      <div class="comma-header-right">
        <button type="button" class="comma-sort comma-sort-on" data-sort="recommend">推荐</button>
        <button type="button" class="comma-sort" data-sort="latest">最新</button>
        <button type="button" class="comma-sort" data-sort="oldest">最早</button>
        <button type="button" class="comma-refresh js-comma-refresh" title="刷新评论" aria-label="刷新评论">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 5V2L7 6l5 4V7c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8Zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 8.74C4.46 9.97 4 11.43 4 13c0 4.42 3.58 8 8 8v3l5-4-5-4v3Z"/></svg>
        </button>
      </div>
    </div>

    <div class="comma-form-wrap">
      <div class="comma-replying" hidden></div>
      <form class="comma-form" id="comma-form">
        <input type="hidden" name="parent" value="0">
        <div class="comma-identity-box" data-guest hidden>
          <img class="comma-identity-avatar" src="" alt="" width="28" height="28">
          <span class="comma-identity-name"></span>
        </div>
        <textarea id="comma-text" name="text" rows="4" maxlength="3000" class="comma-textarea" placeholder="支持 Markdown 语法，最多 3000 字"></textarea>
        <div class="comma-toolbar">
          <span class="comma-hint">支持 Markdown 语法</span>
          <span class="comma-count">0/3000</span>
        </div>
        <div class="comma-fields">
          <input type="text" id="comma-author" name="author" maxlength="150" class="comma-input" placeholder="昵称">
          <input type="email" id="comma-mail" name="mail" maxlength="150" class="comma-input" placeholder="邮箱">
          <input type="url" id="comma-url" name="url" maxlength="255" class="comma-input" placeholder="网站（选填）">
        </div>
        <div class="comma-bottom">
          <span class="comma-spacer"></span>
          <button type="submit" class="comma-submit-btn" disabled>发表评论</button>
        </div>
        <p class="mt-3 text-sm text-black/50 transition dark:text-white/50">静态演示站：评论提交已禁用，以上为构建时预置的示例评论。</p>
      </form>
    </div>

    <ul class="comma-list">${html}</ul>
    <button type="button" class="comma-more js-comma-more" hidden>查看更多评论</button>
  </div>
  <script type="application/json" id="comma-json">${commaJson}</script>
  <script type="application/json" id="demo-comments-html">${commentsJson}</script>`;
}

const reactionsStyle = `
<style>
  .gh-reactions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .gh-add, .gh-badge { display: inline-flex; align-items: center; gap: 3px; height: 24px; box-sizing: border-box; padding: 2px 8px; font-size: 12px; line-height: 20px; color: var(--btn-content); background: transparent; border: 1px solid var(--line-color); border-radius: 999px; cursor: pointer; transition: border-color .15s, color .15s, background-color .15s, box-shadow .15s; }
  .gh-badge[hidden] { display: none; }
  .gh-add:hover, .gh-badge:hover { border-color: var(--primary); color: var(--primary); }
  .gh-add:active, .gh-badge:active { background: rgba(208, 215, 222, 0.24); }
  .gh-badge.selected { border-color: var(--primary); }
  .gh-emoji { font-style: normal; font-size: 14px; line-height: 1; }
  .gh-count { font-size: 12px; line-height: 20px; }
  .gh-panel { position: absolute; bottom: 100%; left: 0; margin-bottom: 6px; padding: 6px 8px; background: var(--float-panel-bg); border: 1px solid var(--line-color); border-radius: 6px; box-shadow: 0 8px 24px rgba(140, 149, 159, 0.2); opacity: 0; transform: translateY(4px); transition: opacity .15s, transform .15s; z-index: 50; }
  .gh-panel.open { opacity: 1; transform: translateY(0); }
  .gh-items { display: flex; align-items: center; gap: 4px; white-space: nowrap; }
  .gh-item { display: inline-flex; align-items: center; justify-content: center; padding: 3px 5px; background: transparent; border: 1px solid transparent; border-radius: 6px; cursor: pointer; transition: background-color .1s, border-color .1s; }
  .gh-item:hover { background: rgba(234, 238, 242, 0.5); }
  .dark .gh-item:hover { background: rgba(177, 186, 196, 0.12); }
  .gh-item.selected { border-color: var(--primary); }
</style>`;

const reactionsScript = `
<script>
(function () {
  var block = document.querySelector(".gh-reactions");
  if (!block) return;
  var addBtn = block.querySelector(".gh-add");
  var panel = block.querySelector(".gh-panel");
  var cid = block.dataset.cid, url = block.dataset.url;
  var storeKey = "fuwari_react_" + cid;
  var sel = new Set((localStorage.getItem(storeKey) || "").split(",").filter(Boolean));
  var badges = {};

  block.querySelectorAll(".gh-badge").forEach(function (b) { badges[b.dataset.key] = b; });
  block.querySelectorAll(".gh-item").forEach(function (item) {
    if (sel.has(item.dataset.key)) item.classList.add("selected");
  });

  function ensureBadge(key) {
    var badge = badges[key];
    if (badge) return badge;
    var ref = block.querySelector('.gh-item[data-key="' + key + '"]');
    if (!ref) return null;
    badge = ref.cloneNode(true);
    badge.classList.remove("gh-item");
    badge.classList.add("gh-badge");
    badge.appendChild(document.createElement("span")).className = "gh-count";
    badges[key] = badge;
    block.insertBefore(badge, block.querySelector(".relative").nextSibling);
    badge.addEventListener("click", function () { react(key); });
    return badge;
  }
  if (sel.size) {
    sel.forEach(function (k) {
      var b = ensureBadge(k);
      if (b) b.classList.add("selected");
    });
  }

  function closePanel() {
    panel.classList.remove("open");
    panel.hidden = true;
    addBtn.setAttribute("aria-expanded", "false");
  }

  addBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    if (panel.hidden) {
      panel.hidden = false;
      requestAnimationFrame(function () { panel.classList.add("open"); });
      addBtn.setAttribute("aria-expanded", "true");
    } else {
      closePanel();
    }
  });
  document.addEventListener("click", function (e) { if (!block.contains(e.target)) closePanel(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePanel(); });

  function post(key, action) {
    return fetch(url + "?reaction=1&cid=" + cid + "&emoji=" + key + "&action=" + action)
      .then(function (r) { return r.json(); })
      .then(function (data) { return data && data.ok ? data : null; });
  }

  function setBadge(key, count) {
    var badge = ensureBadge(key);
    if (!badge) return;
    var span = badge.querySelector(".gh-count");
    span.textContent = count;
    badge.hidden = count <= 0;
  }

  function persist() {
    if (sel.size) localStorage.setItem(storeKey, Array.from(sel).join(","));
    else localStorage.removeItem(storeKey);
  }

  function setSelected(key, on) {
    if (on) sel.add(key);
    else sel.delete(key);
    block.querySelectorAll(".gh-item").forEach(function (item) {
      item.classList.toggle("selected", sel.has(item.dataset.key));
    });
    Object.keys(badges).forEach(function (k) { badges[k].classList.toggle("selected", sel.has(k)); });
    persist();
  }

  function react(key) {
    if (block.dataset.busy) return;
    var on = !sel.has(key);
    block.dataset.busy = "1";
    post(key, on ? "add" : "remove").then(function (data) {
      if (data) {
        setBadge(key, data.count);
        setSelected(key, on);
      }
    }).finally(function () { delete block.dataset.busy; });
  }

  block.querySelectorAll(".gh-item").forEach(function (btn) {
    btn.addEventListener("click", function () { react(this.dataset.key); });
  });
  block.querySelectorAll(".gh-badge").forEach(function (btn) {
    btn.addEventListener("click", function () { react(btn.dataset.key); });
  });
})();
</script>`;

export function reactionsSection(post, reactionsConfig) {
  const counts = post.reactions || {};
  const cid = numericId(post.slug);
  const url = postPermalink(post);

  const items = reactionsConfig
    .map(
      (reaction) =>
        `<button type="button" class="gh-item" data-key="${reaction.key}" aria-label="React ${reaction.key}"><span class="gh-emoji">${reaction.emoji}</span></button>`,
    )
    .join("");

  const badges = reactionsConfig
    .filter((reaction) => (counts[reaction.key] ?? 0) > 0)
    .map(
      (reaction) =>
        `<button type="button" class="gh-badge" data-key="${reaction.key}" aria-label="React ${reaction.key}"><span class="gh-emoji">${reaction.emoji}</span><span class="gh-count">${counts[reaction.key]}</span></button>`,
    )
    .join("");

  return `${reactionsStyle}
<div class="gh-reactions mt-6" data-cid="${cid}" data-url="${url}">
  <div class="relative">
    <button type="button" class="gh-add" aria-expanded="false" aria-label="表态" title="表态">
      <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Zm0 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM8 4.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm-3.75 5.25a4.75 4.75 0 0 0 7.5 0 .75.75 0 0 0-1.203-.897 3.25 3.25 0 0 1-5.094 0 .75.75 0 0 0-1.203.897Z"/></svg>
    </button>
    <div class="gh-panel" hidden><div class="gh-items">${items}</div></div>
  </div>
  ${badges}
</div>
${reactionsScript}`;
}

export function timeline(title, posts) {
  const rows = posts
    .map((post) => {
      const tags = post.tags || [];
      return `<a href="${postPermalink(post)}" aria-label="${escapeHtml(post.title)}" class="btn-plain group !block h-10 w-full rounded-lg hover:text-[initial]">
        <div class="flex h-full flex-row items-center justify-start">
          <div class="text-50 w-[15%] text-right text-sm transition md:w-[10%]">${escapeHtml(post.date.slice(5))}</div>
          <div class="dash-line relative flex h-full w-[15%] items-center md:w-[10%]">
            <div class="z-50 mx-auto h-1 w-1 rounded bg-[oklch(0.5_0.05_var(--hue))] outline outline-4 outline-[var(--card-bg)] transition-all group-hover:h-5 group-hover:bg-[var(--primary)] group-hover:outline-[var(--btn-plain-bg-hover)] group-active:outline-[var(--btn-plain-bg-active)]"></div>
          </div>
          <div class="text-75 w-[70%] overflow-hidden overflow-ellipsis whitespace-nowrap pr-8 text-left font-bold transition-all group-hover:translate-x-1 group-hover:text-[var(--primary)] md:w-[65%] md:max-w-[65%]">${escapeHtml(post.title)}</div>
          <div class="text-30 hidden overflow-hidden overflow-ellipsis whitespace-nowrap text-left text-sm transition md:block md:w-[15%]">${tags.length ? `#${tags.map(escapeHtml).join(" #")}` : ""}</div>
        </div>
      </a>`;
    })
    .join("");

  return `<div class="card-base mb-5 px-8 py-6">
    <div class="my-2 px-2 text-2xl font-bold text-[var(--primary)]">${escapeHtml(title)}</div>
    <div>
      <div class="flex h-[3.75rem] w-full flex-row items-center">
        <div class="text-75 w-[15%] text-right text-lg font-bold transition md:w-[10%]">时间轴</div>
        <div class="w-[15%] md:w-[10%]"><div class="outline-3 z-50 mx-auto h-3 w-3 rounded-full bg-none outline -outline-offset-[2px] outline-[var(--primary)]"></div></div>
        <div class="text-50 w-[70%] text-left transition md:w-[80%]">共 ${posts.length} 篇文章</div>
      </div>
      ${rows}
    </div>
  </div>`;
}

export function archiveTimeline(posts) {
  const groups = new Map();
  for (const post of posts) {
    const year = post.date.slice(0, 4);
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(post);
  }
  const years = [...groups.keys()].sort((a, b) => Number(b) - Number(a));

  const content = years
    .map((year) => {
      const yearPosts = groups.get(year);
      const rows = yearPosts
        .map((post) => {
          const tags = post.tags || [];
          return `<a href="${postPermalink(post)}" aria-label="${escapeHtml(post.title)}" class="btn-plain group !block h-10 w-full rounded-lg hover:text-[initial]">
            <div class="flex h-full flex-row items-center justify-start">
              <div class="text-50 w-[15%] text-right text-sm transition md:w-[10%]">${escapeHtml(post.date.slice(5))}</div>
              <div class="dash-line relative flex h-full w-[15%] items-center md:w-[10%]">
                <div class="z-50 mx-auto h-1 w-1 rounded bg-[oklch(0.5_0.05_var(--hue))] outline outline-4 outline-[var(--card-bg)] transition-all group-hover:h-5 group-hover:bg-[var(--primary)] group-hover:outline-[var(--btn-plain-bg-hover)] group-active:outline-[var(--btn-plain-bg-active)]"></div>
              </div>
              <div class="text-75 w-[70%] overflow-hidden overflow-ellipsis whitespace-nowrap pr-8 text-left font-bold transition-all group-hover:translate-x-1 group-hover:text-[var(--primary)] md:w-[65%] md:max-w-[65%]">${escapeHtml(post.title)}</div>
              <div class="text-30 hidden overflow-hidden overflow-ellipsis whitespace-nowrap text-left text-sm transition md:block md:w-[15%]">${tags.length ? `#${tags.map(escapeHtml).join(" #")}` : ""}</div>
            </div>
          </a>`;
        })
        .join("");

      return `<div>
        <div class="flex h-[3.75rem] w-full flex-row items-center">
          <div class="text-75 w-[15%] text-right text-2xl font-bold transition md:w-[10%]">${year}</div>
          <div class="w-[15%] md:w-[10%]"><div class="outline-3 z-50 mx-auto h-3 w-3 rounded-full bg-none outline -outline-offset-[2px] outline-[var(--primary)]"></div></div>
          <div class="text-50 w-[70%] text-left transition md:w-[80%]">${yearPosts.length} 篇文章</div>
        </div>
        ${rows}
      </div>`;
    })
    .join("");

  return `<div class="card-base px-8 py-6">${content}</div>`;
}
