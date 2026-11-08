export const site = {
  title: "Fuwari Typecho Demo",
  description: "Fuwari Typecho 主题的纯静态演示站，无需 PHP。",
  lang: "zh-CN",
  author: "Fuwari Demo",
  banner: {
    mode: "banner",
    src: "/assets/images/demo-banner.png",
    position: "center",
    credit: {
      enable: true,
      text: "Fuwari Demo Banner",
      url: "",
    },
  },
  themeColor: {
    hue: 250,
    fixed: false,
  },
  colorScheme: "auto",
  enableChangeColorScheme: true,
  tocEnable: true,
  profile: {
    name: "Fuwari Demo",
    bio: "这是一个不使用 PHP、由 Node 脚本在构建时自动生成的静态演示站。",
    avatar: "/assets/images/demo-avatar.png",
    url: "/about/",
    socialLinks: [
      {
        icon: "icon-[fa7-brands--github]",
        url: "https://github.com/YxlaGyb/fuwari-ty",
      },
      {
        icon: "icon-[fa7-brands--bilibili]",
        url: "https://space.bilibili.com/1",
      },
    ],
  },
  nav: [
    { label: "首页", href: "/" },
    { label: "归档", href: "/archive/" },
    { label: "关于", href: "/about/" },
  ],
  license: {
    enable: true,
    name: "CC BY-NC-SA 4.0",
    url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
  },
  reactions: [
    { key: "r0", emoji: "👍" },
    { key: "r1", emoji: "❤️" },
    { key: "r2", emoji: "🚀" },
    { key: "r3", emoji: "👀" },
    { key: "r4", emoji: "😂" },
    { key: "r5", emoji: "🎉" },
  ],
};

export const posts = [
  {
    slug: "hello-fuwari-ty",
    title: "欢迎来到 Fuwari Typecho 静态演示站",
    date: "2026-01-15",
    category: "公告",
    tags: ["Fuwari", "Typecho", "Demo"],
    excerpt: "这是一个完全静态的演示站，用来快速预览 fuwari-ty 主题的视觉效果和前端交互。",
    cover: "/assets/images/demo-banner.png",
    views: 428,
    reactions: { r0: 3, r1: 2, r3: 1 },
    body: `
<h2>关于这个演示站</h2>
<p>这是一个<strong>纯静态</strong>的演示站，不运行 PHP，也不依赖 Typecho 运行时。页面由仓库里的 Node 脚本在构建时生成，主题现有的 CSS/JS 产物被直接复用。</p>
<p>你可以在这里预览到：</p>
<ul>
  <li>顶部导航、搜索、主题切换与显示设置</li>
  <li>Banner、作者卡片、分类和标签侧栏</li>
  <li>文章卡片、目录、代码高亮、Mermaid 图表</li>
  <li>评论与表态区块的界面样式</li>
</ul>
<h2>静态站的边界</h2>
<p>搜索、评论提交、表态和浏览量原本依赖 Typecho 后端。在演示站里，它们由一段很小的 <code>demo-shim.js</code> 前端脚本模拟：搜索使用构建时生成的索引，评论展示预置数据，提交会被明确禁用。</p>
<blockquote><p>这是一个展示用途的站点，数据不会写入数据库。</p></blockquote>
<h2>如何查看其他页面</h2>
<p>顶部导航可以进入归档和关于页；文章卡片可以进入文章详情页。分类和标签链接也会生成对应的静态列表页。</p>
`,
  },
  {
    slug: "markdown-showcase",
    title: "Markdown 样式展示",
    date: "2026-01-12",
    category: "示例",
    tags: ["Markdown", "Demo"],
    excerpt: "标题、列表、引用、表格、行内代码等常见 Markdown 元素在主题里的呈现效果。",
    cover: "",
    views: 316,
    reactions: { r0: 1, r2: 1 },
    body: `
<h2>标题与段落</h2>
<p>这是一段普通段落。主题的排版基于 Tailwind Typography，正文宽度、行距和颜色都会跟随明暗模式变化。</p>
<p>段落里可以有 <em>斜体</em>、<strong>粗体</strong>、<code>行内代码</code>，以及 <a href="https://typecho.org">链接</a>。</p>
<h2>列表</h2>
<ul>
  <li>无序列表第一项</li>
  <li>无序列表第二项</li>
  <li>无序列表第三项</li>
</ul>
<ol>
  <li>有序列表第一项</li>
  <li>有序列表第二项</li>
  <li>有序列表第三项</li>
</ol>
<h2>引用</h2>
<blockquote>
  <p>引用块适合放置需要强调的段落。</p>
  <p>它也可以包含多个段落。</p>
</blockquote>
<h2>表格</h2>
<table>
  <thead>
    <tr><th>元素</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td>标题</td><td>h1–h6 会进入右侧目录</td></tr>
    <tr><td>代码</td><td>由 highlight.js 在浏览器里高亮</td></tr>
    <tr><td>图片</td><td>点击后由 PhotoSwipe 打开灯箱</td></tr>
  </tbody>
</table>
<h2>水平线</h2>
<hr />
<p>分割线之后的段落。</p>
`,
  },
  {
    slug: "code-and-mermaid",
    title: "代码高亮与 Mermaid",
    date: "2026-01-10",
    category: "示例",
    tags: ["代码", "Mermaid", "Demo"],
    excerpt: "展示 highlight.js 代码高亮、复制按钮和 Mermaid 流程图在静态站里的效果。",
    cover: "",
    views: 502,
    reactions: { r0: 2, r1: 1, r2: 3, r5: 1 },
    body: `
<h2>代码块</h2>
<p>代码块会由主题的 <code>main.js</code> 在浏览器里使用 highlight.js 高亮，并自动加上语言徽标和复制按钮。</p>
<pre><code class="language-js">function greet(name) {
  const message = "Hello, " + name + "!";
  console.log(message);
  return message;
}

greet("Fuwari");
</code></pre>
<h2>Shell 示例</h2>
<pre><code class="language-bash">pnpm build
node demo/build.mjs
</code></pre>
<h2>Mermaid 图表</h2>
<p>带有 <code>language-mermaid</code> 类名的代码块会被 Mermaid 渲染成 SVG：</p>
<pre><code class="language-mermaid">graph TD
  A[Typecho 主题] --> B[Vite 构建]
  B --> C[assets/dist]
  C --> D[Node 生成脚本]
  D --> E[静态 HTML]
  E --> F[Vercel]
</code></pre>
<h2>目录</h2>
<p>本页的 h2 标题会自动出现在右侧目录中，滚动时高亮当前章节。</p>
`,
  },
  {
    slug: "static-demo-notes",
    title: "静态演示站的功能降级说明",
    date: "2026-01-08",
    category: "公告",
    tags: ["Vercel", "静态站点", "Demo"],
    excerpt: "搜索、评论、表态、浏览量在纯静态环境下的处理方式。",
    cover: "/images/guide-cover.jpeg",
    views: 245,
    reactions: { r3: 2, r4: 1 },
    body: `
<h2>为什么需要降级</h2>
<p>fuwari-ty 是 Typecho 主题，搜索、评论、表态和浏览量都依赖 PHP 接口。静态演示站没有后端，所以这些功能需要在前端做轻量模拟。</p>
<h2>具体处理</h2>
<ul>
  <li><strong>搜索</strong>：构建时生成 <code>search-index.json</code>，前端脚本在本地过滤。</li>
  <li><strong>评论列表</strong>：构建时写入示例评论，页面加载后由脚本返回同一份 HTML。</li>
  <li><strong>评论提交</strong>：按钮禁用，接口返回明确的提示信息。</li>
  <li><strong>表态</strong>：点击后由前端更新计数，刷新页面会恢复初始值。</li>
  <li><strong>浏览量</strong>：显示构建时写入的静态数字。</li>
</ul>
<h2>没有改变的部分</h2>
<p>主题的 CSS/JS 没有为演示站做任何修改。明暗切换、显示设置、移动端菜单、目录、代码高亮、Mermaid、图片灯箱都直接使用主题现有构建产物。</p>
<blockquote><p>演示站的价值是快速预览，不是替代真实的 Typecho 站点。</p></blockquote>
`,
  },
  {
    slug: "guide",
    title: "主题使用指南",
    date: "2026-01-05",
    category: "指南",
    tags: ["Fuwari", "教程"],
    excerpt: "从安装主题到构建前端资源，快速了解 fuwari-ty 的使用方式。",
    cover: "/images/guide-cover.jpeg",
    views: 386,
    reactions: { r0: 4, r1: 2, r5: 2 },
    body: `
<blockquote><p>封面图片来自原版 fuwari 示例内容，仅用于演示。</p></blockquote>
<h2>安装主题</h2>
<p>把主题目录放到 Typecho 的 <code>usr/themes/fuwari</code>，在后台启用即可。主题依赖的前端资源需要先构建：</p>
<pre><code class="language-bash">pnpm install
pnpm build
</code></pre>
<h2>文章字段</h2>
<p>文章支持两个自定义字段：</p>
<table>
  <thead>
    <tr><th>字段</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><code>cover</code></td><td>封面图 URL；留空时自动取正文第一张图</td></tr>
    <tr><td><code>reactionsDisable</code></td><td>关闭该文章的表态区块</td></tr>
  </tbody>
</table>
<h2>主题设置</h2>
<p>后台的主题设置可以调整 Banner 模式、主题色相、侧栏组件、作者信息、社交链接、版权声明和评论选项。</p>
<h2>静态演示站</h2>
<p>本演示站通过 <code>demo/build.mjs</code> 生成，不参与主题运行时。它只读取示例数据并复用 <code>assets/dist</code>，因此不会影响 Typecho 站点的正常使用。</p>
`,
  },
];

export const comments = [
  {
    id: 1,
    author: "Fuwari Demo",
    text: "欢迎来到静态演示站！这里的评论数据是构建时预置的，提交功能已在演示模式下关闭。",
    date: "2026-01-18 09:30",
    likes: 8,
    authorBadge: true,
  },
  {
    id: 2,
    author: "Alice",
    text: "界面很清爽，目录、代码高亮和明暗切换都能正常工作。",
    date: "2026-01-19 14:12",
    likes: 3,
  },
  {
    id: 3,
    author: "Bob",
    text: "原来这个主题还支持表态和评论样式，静态站也能完整预览。",
    date: "2026-01-20 20:05",
    likes: 1,
  },
];

export const aboutHtml = `
<h2>关于 Fuwari Typecho Demo</h2>
<p>这是 <a href="https://github.com/YxlaGyb/fuwari-ty">fuwari-ty</a> 的静态演示站，用于快速预览主题的前端效果。</p>
<p>演示站完全静态：不运行 PHP，不连接数据库，也不包含 Typecho 后台。页面由仓库里的 <code>demo/build.mjs</code> 在构建时生成，样式和交互直接复用主题的 <code>assets/dist</code>。</p>
<h2>素材来源</h2>
<ul>
  <li>主题与前端资源：<a href="https://github.com/YxlaGyb/fuwari-ty">fuwari-ty</a></li>
  <li>原版设计：<a href="https://github.com/saicaca/fuwari">Fuwari</a></li>
  <li>示例封面来自原版 fuwari 示例内容，仅用于演示</li>
</ul>
<h2>说明</h2>
<p>搜索、评论、表态和浏览量在演示站中为前端模拟数据，不会写入任何数据库。</p>
`;
