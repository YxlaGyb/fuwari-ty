import { renderLayout } from "./layout.mjs";
import {
  archiveTimeline,
  commentsSection,
  escapeHtml,
  postCard,
  postMeta,
  postPermalink,
  reactionsSection,
  readingTime,
  timeline,
  wordCount,
} from "./partials.mjs";

export function homePage(site, posts) {
  const cards = posts.map((post, index) => postCard(post, index + 1)).join("");
  const content = `<div class="mb-4 flex flex-col rounded-[var(--radius-large)] bg-[var(--card-bg)] py-1 transition md:gap-4 md:bg-transparent md:py-0">${cards}</div>`;

  return renderLayout({
    site,
    posts,
    pageType: "home",
    content,
  });
}

export function postPage(site, posts, post, comments) {
  const words = wordCount(post.body);
  const minutes = readingTime(words);
  const views = post.views ?? 100;
  const href = postPermalink(post);

  const license = site.license.enable
    ? `<div class="license-container onload-animation relative mb-6 overflow-hidden rounded-xl bg-[var(--license-block-bg)] px-6 py-5 transition">
        <div class="font-bold text-black/75 transition dark:text-white/75">${escapeHtml(post.title)}</div>
        <a href="${href}" class="link text-[var(--primary)]">${href}</a>
        <div class="mt-2 flex gap-6">
          <div>
            <div class="text-sm text-black/30 transition dark:text-white/30">作者</div>
            <div class="line-clamp-2 text-black/75 transition dark:text-white/75">${escapeHtml(site.author)}</div>
          </div>
          <div>
            <div class="text-sm text-black/30 transition dark:text-white/30">发布于</div>
            <div class="line-clamp-2 text-black/75 transition dark:text-white/75">${escapeHtml(post.date)}</div>
          </div>
          <div>
            <div class="text-sm text-black/30 transition dark:text-white/30">License</div>
            <a href="${escapeHtml(site.license.url)}" target="_blank" class="link line-clamp-2 text-[var(--primary)]">${escapeHtml(site.license.name)}</a>
          </div>
        </div>
        <span class="icon-[fa6-brands--creative-commons] pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-[15rem] text-black/5 transition dark:text-white/5"></span>
      </div>`
    : "";

  const content = `<div class="relative mb-4 flex w-full overflow-hidden rounded-[var(--radius-large)]">
    <div id="post-container" class="card-base relative z-10 w-full px-6 pb-4 pt-6 md:px-9">
      <div class="onload-animation mb-3 flex flex-row gap-5 text-black/30 transition dark:text-white/30">
        <div class="flex flex-row items-center">
          <div class="mr-2 flex h-6 w-6 items-center justify-center rounded-md bg-black/5 text-black/50 transition dark:bg-white/10 dark:text-white/50"><span class="icon-[material-symbols--notes-rounded]"></span></div>
          <div class="text-sm">${words} 字</div>
        </div>
        <div class="flex flex-row items-center">
          <div class="mr-2 flex h-6 w-6 items-center justify-center rounded-md bg-black/5 text-black/50 transition dark:bg-white/10 dark:text-white/50"><span class="icon-[material-symbols--schedule-outline-rounded]"></span></div>
          <div class="text-sm">${minutes} 分钟</div>
        </div>
        <div class="flex flex-row items-center">
          <div class="mr-2 flex h-6 w-6 items-center justify-center rounded-md bg-black/5 text-black/50 transition dark:bg-white/10 dark:text-white/50"><span class="icon-[material-symbols--visibility-outline-rounded]"></span></div>
          <div class="text-sm">${views} 次查看</div>
        </div>
      </div>

      <div class="onload-animation relative">
        <div data-pagefind-body data-pagefind-weight="10" data-pagefind-meta="title" class="mb-3 block w-full text-3xl font-bold text-black/90 transition before:absolute before:left-[-1.125rem] before:top-[0.75rem] before:h-5 before:rounded-md before:bg-[var(--primary)] dark:text-white/90 md:text-[2.25rem]/[2.75rem] md:before:w-1">${escapeHtml(post.title)}</div>
      </div>

      <div class="onload-animation">${postMeta(post, "post")}</div>

      <div class="custom-md markdown-content onload-animation prose prose-base mb-6 !max-w-none dark:!prose-invert" id="content">${post.body}</div>

      ${license}
      ${reactionsSection(post, site.reactions)}
    </div>
  </div>
  ${commentsSection(post, comments)}`;

  return renderLayout({
    site,
    posts,
    pageType: "post",
    title: post.title,
    description: post.excerpt,
    content,
  });
}

export function archivePage(site, posts) {
  return renderLayout({
    site,
    posts,
    pageType: "archives",
    title: "归档",
    description: `归档 - ${site.title}`,
    content: archiveTimeline(posts),
  });
}

export function categoryPage(site, posts, name, categoryPosts) {
  return renderLayout({
    site,
    posts,
    pageType: "category",
    title: `分类：${name}`,
    description: `分类: ${name} - ${site.title}`,
    content: timeline(name, categoryPosts),
  });
}

export function tagPage(site, posts, name, tagPosts) {
  return renderLayout({
    site,
    posts,
    pageType: "tag",
    title: `标签：${name}`,
    description: `标签: ${name} - ${site.title}`,
    content: timeline(`#${name}`, tagPosts),
  });
}

export function aboutPage(site, posts, aboutHtml) {
  const content = `<div class="relative mb-4 flex min-h-32 w-full overflow-hidden rounded-[var(--radius-large)]">
    <div class="card-base relative z-10 w-full px-9 py-6">
      <h1 class="text-3xl font-bold mb-6 text-black/90 dark:text-white/90">关于</h1>
      <div class="custom-md prose prose-base mt-2 !max-w-none dark:prose-invert">${aboutHtml}</div>
    </div>
  </div>`;

  return renderLayout({
    site,
    posts,
    pageType: "page",
    title: "关于",
    description: `关于 - ${site.title}`,
    content,
  });
}

export function notFoundPage(site, posts) {
  const content = `<div class="relative mb-4 flex w-full overflow-hidden rounded-[var(--radius-large)]">
    <div class="card-base relative z-10 w-full px-6 pb-4 pt-6 md:px-9">
      <div class="flex flex-col items-center justify-center py-20">
        <div class="text-8xl font-bold text-[var(--primary)]">404</div>
        <div class="mt-4 text-2xl font-bold text-neutral-700 dark:text-neutral-200">页面未找到</div>
        <p class="mt-2 text-neutral-500">你想查看的页面已被转移或删除了</p>
        <a href="/" class="btn-regular mt-6 h-10 rounded-lg px-6 font-bold">返回首页</a>
      </div>
    </div>
  </div>`;

  return renderLayout({
    site,
    posts,
    pageType: "404",
    title: "404",
    description: `404 - ${site.title}`,
    content,
  });
}
