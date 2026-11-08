import {
  categoryPermalink,
  escapeHtml,
  tagPermalink,
} from "./partials.mjs";

function themeConfigJson(site) {
  return JSON.stringify({
    siteUrl: "",
    base: {
      themeColor: {
        hue: site.themeColor.hue,
        fixed: site.themeColor.fixed,
      },
      banner: {
        enable: site.banner.mode !== "hidden",
        mode: site.banner.mode,
        src: site.banner.src,
        position: site.banner.position,
      },
    },
    style: {
      color_scheme: site.colorScheme,
      enable_change_color_scheme: site.enableChangeColorScheme,
    },
  }).replace(/</g, "\\u003c");
}

function headerScript(site) {
  const fullscreen = site.banner.mode === "fullscreen";
  const bannerHeight = fullscreen ? 100 : 35;
  const bannerHeightHome = fullscreen ? 100 : 65;
  const bannerExtend = fullscreen ? 0 : 30;

  return `
(function () {
  const DEFAULT_THEME = ${JSON.stringify(site.colorScheme)};
  const LIGHT_MODE = "light";
  const DARK_MODE = "dark";
  const AUTO_MODE = "auto";
  const BANNER_HEIGHT = ${bannerHeight};
  const BANNER_HEIGHT_EXTEND = ${bannerExtend};
  const BANNER_HEIGHT_HOME = ${bannerHeightHome};
  const PAGE_WIDTH = 75;
  const configHue = ${Number(site.themeColor.hue) || 250};
  const banner_position = ${JSON.stringify(site.banner.position)};
  const bannerOffsetByPosition = {
    top: BANNER_HEIGHT_EXTEND + "vh",
    center: (BANNER_HEIGHT_EXTEND / 2) + "vh",
    bottom: "0",
  };
  const bannerOffset = bannerOffsetByPosition[banner_position || "center"];
  const theme = localStorage.getItem("color-scheme-fuwari") || DEFAULT_THEME;
  switch (theme) {
    case LIGHT_MODE:
      document.documentElement.classList.remove("dark");
      break;
    case DARK_MODE:
      document.documentElement.classList.add("dark");
      break;
    case AUTO_MODE:
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
  }

  const storedHue = localStorage.getItem("hue");
  const hue = (storedHue && parseInt(storedHue) === configHue) ? storedHue : String(configHue);
  if (!storedHue || parseInt(storedHue) !== configHue) {
    localStorage.setItem("hue", String(configHue));
  }
  document.documentElement.style.setProperty("--hue", hue);

  let offset = Math.floor(window.innerHeight * (BANNER_HEIGHT_EXTEND / 100));
  offset = offset - (offset % 4);
  document.documentElement.style.setProperty("--banner-height-extend", offset + "px");
  document.documentElement.style.setProperty("--page-width", PAGE_WIDTH + "rem");
  document.documentElement.style.setProperty("--configHue", String(configHue));
  document.documentElement.style.setProperty("--banner-height", BANNER_HEIGHT + "vh");
  document.documentElement.style.setProperty("--banner-height-home", BANNER_HEIGHT_HOME + "vh");
  document.documentElement.style.setProperty("--bannerOffset", bannerOffset);
})();
`;
}

function bannerMarkup(site) {
  if (site.banner.mode === "hidden") return "";

  if (site.banner.mode === "fullscreen") {
    return `<div id="banner-wrapper" class="fixed inset-0 z-[40] overflow-hidden pointer-events-none">
      <img src="${escapeHtml(site.banner.src)}" alt="Fullscreen wallpaper" style="object-position: ${escapeHtml(site.banner.position)} center;" class="h-full w-full object-cover" decoding="async" fetchpriority="high">
      <div class="absolute inset-0 bg-black/30 dark:bg-black/50"></div>
    </div>`;
  }

  return `<div id="banner-wrapper" class="absolute z-10 w-full overflow-hidden transition duration-700" style="top: -30vh">
    <div id="banner" class="relative h-full overflow-hidden object-cover transition duration-700">
      <div class="pointer-events-none absolute inset-0 bg-opacity-50 transition dark:bg-black/10"></div>
      <img src="${escapeHtml(site.banner.src)}" alt="Banner image of the blog" style="object-position: ${escapeHtml(site.banner.position)};" width="1344" height="896" loading="lazy" decoding="async" class="h-full w-full object-cover">
    </div>
  </div>`;
}

function bannerCredit(site) {
  if (site.banner.mode !== "banner" || !site.banner.credit.enable) return "";
  const credit = site.banner.credit;
  const inner = `<span class="icon-[material-symbols--copyright-outline-rounded] mr-1 text-[1.25rem] text-white/75"></span>
    <div class="text-xs text-white/75">${escapeHtml(credit.text)}</div>`;

  if (credit.url) {
    return `<a href="${escapeHtml(credit.url)}" id="banner-credit" target="_blank" rel="noopener" aria-label="Visit image source" class="onload-animation group absolute -top-[3.25rem] right-4 flex h-9 items-center justify-center rounded-full bg-black/60 px-3 transition-all hover:bg-black/70 hover:pr-9 active:bg-black/80">
      ${inner}
      <span class="icon-[material-symbols--share-outline] absolute right-4 text-[0.75rem] text-[oklch(0.75_0.14_var(--hue))] opacity-0 transition group-hover:opacity-100"></span>
    </a>`;
  }

  return `<div id="banner-credit" class="onload-animation group absolute -top-[3.25rem] right-4 flex h-9 items-center justify-center rounded-full bg-black/60 px-3 transition-all hover:bg-black/70">
    ${inner}
  </div>`;
}

function navLinks(site, mobile) {
  return site.nav
    .map((item) => {
      if (mobile) {
        return `<a href="${escapeHtml(item.href)}" class="group flex items-center justify-between gap-8 rounded-lg py-2 pl-3 pr-1 transition hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)]">
          <div class="font-bold text-black/75 transition group-hover:text-[var(--primary)] group-active:text-[var(--primary)] dark:text-white/75">${escapeHtml(item.label)}</div>
          <span class="icon-[material-symbols--chevron-right-rounded] ml-1 -translate-y-[1px] text-[1.3rem] text-black/[0.2] transition dark:text-white/[0.2]"></span>
        </a>`;
      }
      return `<a href="${escapeHtml(item.href)}" class="btn-plain scale-animation h-11 rounded-lg px-5 font-bold active:scale-95">
        <div class="flex items-center">${escapeHtml(item.label)}</div>
      </a>`;
    })
    .join("");
}

function topRow(site) {
  return `<div id="top-row" class="pointer-events-none relative z-50 mx-auto max-w-[var(--page-width)] px-0 transition-all duration-700 md:px-4">
    <div id="navbar-wrapper" class="pointer-events-auto sticky top-0 transition-all">
      <div id="navbar" class="onload-animation z-50">
        <div class="absolute -top-8 left-0 right-0 h-8 bg-[var(--card-bg)] transition"></div>
        <div class="card-base relative mx-auto flex h-[4.5rem] max-w-[var(--page-width)] items-center justify-between !overflow-visible !rounded-t-none px-4">
          <a href="/" class="btn-plain scale-animation h-[3.25rem] rounded-lg px-5 font-bold active:scale-95">
            <div class="text-md flex flex-row items-center text-[var(--primary)]">
              <span class="icon-[tabler--smart-home] mb-1 mr-2 text-[1.75rem]"></span> ${escapeHtml(site.title)}
            </div>
          </a>
          <div class="absolute left-1/2 hidden -translate-x-1/2 md:flex">${navLinks(site, false)}</div>
          <div class="flex items-center">
            <div id="search"></div>
            ${
              site.themeColor.fixed
                ? ""
                : `<button aria-label="Display Settings" class="btn-plain scale-animation h-11 w-11 rounded-lg active:scale-90" id="display-settings-switch"><span class="icon-[material-symbols--palette-outline] text-[1.25rem]"></span></button>`
            }
            ${
              site.enableChangeColorScheme
                ? `<button aria-label="Light/Dark Mode" class="btn-plain scale-animation relative h-11 w-11 rounded-lg active:scale-90" id="scheme-switch"><span class="icon-[material-symbols--dark-mode-outline] text-[1.25rem]"></span></button>`
                : ""
            }
            <button aria-label="Menu" name="Nav Menu" class="btn-plain scale-animation h-11 w-11 rounded-lg active:scale-90 md:!hidden" id="nav-menu-switch"><span class="icon-[material-symbols--menu-rounded] text-[1.25rem]"></span></button>
          </div>
          <div id="nav-menu-panel" class="float-panel float-panel-closed absolute right-4 px-2 py-2">${navLinks(site, true)}</div>
          <div id="display-setting" class="float-panel float-panel-closed absolute right-4 w-80 px-4 py-4 transition-all"></div>
        </div>
      </div>
    </div>
  </div>`;
}

function profileCard(site) {
  const profile = site.profile;
  const socials = profile.socialLinks
    .map(
      (link) =>
        `<a href="${escapeHtml(link.url)}" target="_blank" rel="me noopener" aria-label="Social link" class="btn-regular h-10 w-10 rounded-lg active:scale-90"><span class="${escapeHtml(link.icon)} text-[1.5rem]"></span></a>`,
    )
    .join("");

  return `<div class="card-base p-3">
    <a aria-label="Go to About Page" href="${escapeHtml(profile.url)}" class="group relative mx-auto mb-3 mt-1 block aspect-square max-w-[12rem] overflow-hidden rounded-xl active:scale-95 lg:mx-0 lg:mt-0 lg:max-w-none">
      <div class="pointer-events-none absolute z-50 flex h-full w-full items-center justify-center transition group-hover:bg-black/30 group-active:bg-black/50">
        <span class="icon-[fa6-regular--address-card] scale-90 text-5xl text-white opacity-0 transition group-hover:scale-100 group-hover:opacity-100"></span>
      </div>
      <img src="${escapeHtml(profile.avatar)}" alt="Profile Image of the Author" class="mx-auto h-full w-full object-cover lg:mt-0">
    </a>
    <div class="px-2">
      <div class="mb-1 text-center text-xl font-bold transition dark:text-neutral-50">${escapeHtml(profile.name)}</div>
      <div class="mx-auto mb-2 h-1 w-5 rounded-full bg-[var(--primary)] transition"></div>
      <div class="mb-2.5 text-center text-neutral-400 transition">${escapeHtml(profile.bio)}</div>
      <div class="mt-3 flex flex-wrap justify-center gap-2">${socials}</div>
    </div>
  </div>`;
}

function categoriesCard(posts) {
  const map = new Map();
  for (const post of posts) {
    const name = post.category || "未分类";
    map.set(name, (map.get(name) || 0) + 1);
  }
  const categories = [...map.entries()].sort((a, b) =>
    a[0].localeCompare(b[0], "zh-CN"),
  );
  const collapsed = categories.length >= 5;

  const links = categories
    .map(
      ([name, count]) =>
        `<a href="${categoryPermalink(name)}" class="flex w-full items-center justify-between rounded-lg px-3 py-1.5 font-medium text-neutral-700 transition hover:bg-[var(--btn-plain-bg-hover)] hover:pl-3 hover:text-[var(--primary)] active:bg-[var(--btn-plain-bg-active)] dark:text-neutral-300 dark:hover:text-[var(--primary)]">
          <span class="overflow-hidden text-ellipsis whitespace-nowrap">${escapeHtml(name)}</span>
          <span class="ml-4 flex h-7 min-w-[2rem] items-center justify-center rounded-lg bg-[var(--btn-regular-bg)] px-2 text-sm font-bold text-[var(--btn-content)] transition dark:bg-[var(--primary)] dark:text-white">${count}</span>
        </a>`,
    )
    .join("");

  return `<div data-id="categories" x-data="{ isCollapsed: true }" x-init="isCollapsed = ${collapsed}" class="card-base onload-animation pb-4" style="animation-delay: 150ms; --collapsedHeight: 7.5rem">
    <div class="relative mb-2 ml-8 mt-4 text-lg font-bold text-neutral-900 transition before:absolute before:left-[-16px] before:top-[5.5px] before:h-4 before:w-1 before:rounded-md before:bg-[var(--primary)] dark:text-neutral-100" style="--collapsedHeight: 7.5rem">分类</div>
    <div id="categories" class="collapse-wrapper overflow-hidden px-4" x-bind:class="isCollapsed ? 'collapsed' : ''" style="--collapsedHeight: 7.5rem">${links}</div>
    ${
      collapsed
        ? `<div class="expand-btn -mb-2 px-4"><button class="btn-plain h-9 w-full rounded-lg" x-on:click="isCollapsed = ! isCollapsed"><div class="flex -translate-x-2 items-center justify-center gap-2 text-[var(--primary)]"><span class="icon-[material-symbols--more-horiz] text-[1.75rem]"></span><span x-text="isCollapsed ? '更多' : '收起'"></span></div></button></div>`
        : ""
    }
  </div>`;
}

function tagsCard(posts) {
  const map = new Map();
  for (const post of posts) {
    for (const tag of post.tags || []) {
      map.set(tag, (map.get(tag) || 0) + 1);
    }
  }
  const tags = [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN"))
    .slice(0, 15);
  const links = tags
    .map(
      ([name]) =>
        `<a href="${tagPermalink(name)}" aria-label="View all posts with the ${escapeHtml(name)} tag" class="btn-regular h-8 rounded-lg px-3 text-sm">${escapeHtml(name)}</a>`,
    )
    .join("");

  return `<div data-id="tags" class="card-base onload-animation pb-4" style="animation-delay: 200ms">
    <div class="relative mb-2 ml-8 mt-4 text-lg font-bold text-neutral-900 transition before:absolute before:left-[-16px] before:top-[5.5px] before:h-4 before:w-1 before:rounded-md before:bg-[var(--primary)] dark:text-neutral-100" style="--collapsedHeight: 7.5rem">标签</div>
    <div class="flex flex-wrap gap-2 px-4">${links}</div>
  </div>`;
}

function sideBar(site, posts) {
  return `<div id="sidebar" class="onload-animation col-span-2 row-start-2 row-end-3 mb-4 w-full lg:col-span-1 lg:row-start-1 lg:row-end-2 lg:max-w-[17.5rem]">
    <div class="mb-4 flex w-full flex-col gap-4">${profileCard(site)}</div>
    <div id="sidebar-sticky" class="sticky top-4 flex w-full flex-col gap-4 transition-all duration-700">
      ${categoriesCard(posts)}
      ${tagsCard(posts)}
    </div>
  </div>`;
}

function footer(site) {
  return `<div class="flex w-full flex-col items-center justify-center">
    <div class="my-10 w-2/3 border-t border-dashed border-black/10 transition dark:border-white/15"></div>
    <div class="mb-12 flex flex-col items-center justify-center rounded-2xl border-dashed border-[oklch(85%_0.01_var(--hue))] px-6 transition dark:border-white/15">
      <div class="text-50 text-center text-sm transition !delay-0">
        &copy; <span id="copyright-year">${new Date().getFullYear()}</span> ${escapeHtml(site.title)}. All Rights Reserved.
        <br>
        Powered by <a class="link font-medium text-[var(--primary)]" target="_blank" href="https://typecho.org">Typecho</a>
        &amp;
        <a class="link font-medium text-[var(--primary)]" target="_blank" href="https://github.com/YxlaGyb/fuwari-ty">fuwari-ty</a>
        <div class="mt-2 text-xs text-black/40 dark:text-white/40">静态演示站：搜索、评论、表态为前端模拟数据，不会写入数据库。</div>
      </div>
    </div>
  </div>`;
}

function tocShell(site, bannerOn) {
  if (!site.tocEnable) return `<div id="toc"></div>`;

  return `<div class="absolute z-0 hidden w-full 2xl:block">
    <div class="relative mx-auto max-w-[var(--page-width)]">
      <div id="toc-wrapper" class="absolute -right-[var(--toc-width)] top-0 hidden w-[var(--toc-width)] items-center transition lg:block${bannerOn ? " toc-hide" : ""}">
        <div id="toc-inner-wrapper" class="hide-scrollbar fixed top-14 h-[calc(100vh_-_20rem)] w-[var(--toc-width)] overflow-x-hidden overflow-y-scroll">
          <div id="toc" class="transition-swup-fade h-full w-full">
            <div class="h-8 w-full"></div>
            <div class="toc"></div>
            <div class="h-8 w-full"></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

export function renderLayout({
  site,
  posts,
  pageType,
  title,
  description = site.description,
  content,
}) {
  const bannerOn = site.banner.mode !== "hidden";
  const fullscreen = site.banner.mode === "fullscreen";
  const contentTop = bannerOn
    ? fullscreen
      ? "5.5rem"
      : "calc(35vh - 3.5rem)"
    : "5.5rem";
  const documentTitle = title ? `${title} - ${site.title}` : site.title;
  const bodyClass = [
    "min-h-screen transition",
    pageType === "home" ? "is-home" : "",
    bannerOn ? "enable-banner" : "",
    fullscreen ? "banner-fullscreen wallpaper-transparent" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `<!DOCTYPE html>
<html lang="${escapeHtml(site.lang)}" class="bg-[var(--page-bg)] text-[14px] transition md:text-[16px]" data-overlayscrollbars-initialize>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(documentTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="stylesheet" href="/assets/dist/main.css">
  <link rel="icon" type="image/png" href="/assets/images/favicon-light-192.png">
  <meta property="og:site_name" content="${escapeHtml(site.title)}">
  <meta property="og:type" content="${pageType === "post" ? "article" : "website"}">
  <meta property="og:title" content="${escapeHtml(documentTitle)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(site.banner.src)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${escapeHtml(site.banner.src)}">
  <link rel="apple-touch-icon" href="${escapeHtml(site.banner.src)}">
  <script>${headerScript(site)}</script>
</head>
<body class="${bodyClass}" data-page-type="${escapeHtml(pageType)}" data-overlayscrollbars-initialize>
  <script id="theme-config" type="application/json">${themeConfigJson(site)}</script>
  ${topRow(site)}
  ${bannerMarkup(site)}

  <div id="content-area-wrapper" class="pointer-events-none absolute z-30 w-full" style="top: ${contentTop}">
    <div class="pointer-events-auto relative mx-auto max-w-[var(--page-width)]">
      <div id="main-grid" class="left-0 right-0 mx-auto grid w-full grid-cols-[17.5rem_auto] grid-rows-[auto_1fr_auto] gap-4 px-0 transition duration-700 md:px-4 lg:grid-rows-[auto]">
        ${bannerCredit(site)}
        ${sideBar(site, posts)}
        <main id="swup-container" class="transition-swup-fade col-span-2 overflow-hidden lg:col-span-1">
          <div id="content-wrapper" class="onload-animation">
            ${content}
            <div class="footer onload-animation col-span-2 hidden lg:block">${footer(site)}</div>
          </div>
        </main>
        <div class="footer onload-animation col-span-2 block lg:hidden">${footer(site)}</div>
      </div>
      <div class="back-to-top-wrapper hidden lg:block">
        <div id="back-to-top-btn" class="back-to-top-btn hide flex items-center overflow-hidden rounded-2xl transition">
          <button aria-label="Back to Top" class="btn-card h-[3.75rem] w-[3.75rem]"><span class="icon-[material-symbols--keyboard-arrow-up-rounded] mx-auto"></span></button>
        </div>
      </div>
    </div>
  </div>

  ${tocShell(site, bannerOn)}

  <div id="page-height-extend" class="hidden h-[300vh]"></div>
  <script src="/demo-shim.js"></script>
  <script type="module" src="/assets/dist/main.js"></script>
</body>
</html>`;
}
