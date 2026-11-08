import { access, cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { aboutHtml, comments, posts, site } from "./data.mjs";
import {
  excerptOf,
  postPermalink,
  slugify,
  stripHtml,
} from "./templates/partials.mjs";
import {
  aboutPage,
  archivePage,
  categoryPage,
  homePage,
  notFoundPage,
  postPage,
  tagPage,
} from "./templates/pages.mjs";

const demoDir = dirname(fileURLToPath(import.meta.url));
const repoDir = resolve(demoDir, "..");
const distDir = resolve(demoDir, "dist");

try {
  await access(resolve(repoDir, "assets/dist/main.js"));
  await access(resolve(repoDir, "assets/dist/main.css"));
} catch {
  console.error("assets/dist/main.js 或 main.css 不存在，请先运行 pnpm build");
  process.exit(1);
}

const sortedPosts = [...posts].sort((a, b) => b.date.localeCompare(a.date));
let pageCount = 0;

async function writePage(relativePath, html) {
  const filePath = resolve(distDir, relativePath);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, html, "utf8");
  pageCount += 1;
}

function groupByCategory(items) {
  const map = new Map();
  for (const post of items) {
    const name = post.category || "未分类";
    if (!map.has(name)) map.set(name, []);
    map.get(name).push(post);
  }
  return map;
}

function groupByTag(items) {
  const map = new Map();
  for (const post of items) {
    for (const tag of post.tags || []) {
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag).push(post);
    }
  }
  return map;
}

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

await cp(resolve(repoDir, "assets/dist"), resolve(distDir, "assets/dist"), {
  recursive: true,
});
await cp(resolve(repoDir, "assets/images"), resolve(distDir, "assets/images"), {
  recursive: true,
});
await cp(
  resolve(demoDir, "static/demo-shim.js"),
  resolve(distDir, "demo-shim.js"),
);

try {
  await cp(resolve(demoDir, "images"), resolve(distDir, "images"), {
    recursive: true,
  });
} catch {
  // demo/images 是可选的
}

await writePage("index.html", homePage(site, sortedPosts));

for (const post of sortedPosts) {
  await writePage(
    `posts/${post.slug}/index.html`,
    postPage(site, sortedPosts, post, comments),
  );
}

await writePage("archive/index.html", archivePage(site, sortedPosts));
await writePage("about/index.html", aboutPage(site, sortedPosts, aboutHtml));
await writePage("404.html", notFoundPage(site, sortedPosts));

for (const [name, categoryPosts] of groupByCategory(sortedPosts)) {
  await writePage(
    `categories/${slugify(name)}/index.html`,
    categoryPage(site, sortedPosts, name, categoryPosts),
  );
}

for (const [name, tagPosts] of groupByTag(sortedPosts)) {
  await writePage(
    `tags/${slugify(name)}/index.html`,
    tagPage(site, sortedPosts, name, tagPosts),
  );
}

const searchIndex = sortedPosts.map((post) => ({
  title: post.title,
  permalink: postPermalink(post),
  description: excerptOf(post),
  tags: post.tags || [],
  content: stripHtml(post.body).slice(0, 2000),
}));

await writeFile(
  resolve(distDir, "search-index.json"),
  JSON.stringify(searchIndex),
  "utf8",
);

console.log(`demo built: ${sortedPosts.length} posts, ${pageCount} pages`);
console.log(`output: ${distDir}`);
