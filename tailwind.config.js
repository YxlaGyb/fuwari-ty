/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";
import { addDynamicIconSelectors } from "@iconify/tailwind";

export default {
    content: ["./templates/**/*.html", "./**/*.php", "./demo/**/*.mjs", "./src/main.ts", "./src/**/*.{js,jsx,svelte,ts,tsx}"],
    darkMode: "class", // allows toggling dark mode manually
    safelist: [
        // 社交媒体图标 (fa7-brands) - 由 profile.php 动态输出，需在此 safelist
        "icon-[fa7-brands--github]",
        "icon-[fa7-brands--x-twitter]",
        "icon-[fa7-brands--twitter]",
        "icon-[fa7-brands--weibo]",
        "icon-[fa7-brands--zhihu]",
        "icon-[fa7-brands--bilibili]",
        "icon-[fa7-brands--douban]",
        "icon-[fa7-brands--tiktok]",
        "icon-[fa7-brands--telegram]",
        "icon-[fa7-brands--facebook]",
        "icon-[fa7-brands--instagram]",
        "icon-[fa7-brands--linkedin]",
        "icon-[fa7-brands--youtube]",
        "icon-[fa7-brands--steam]",
        "icon-[fa7-brands--gitlab]",
        "icon-[fa7-brands--slack]",
        "icon-[fa7-brands--discord]",
        "icon-[fa7-brands--qq]",
        "icon-[fa7-brands--weixin]",
        "icon-[fa7-brands--gitee]",
        "icon-[fa7-brands--codeberg]",
        "icon-[streamline-plump--rss-square-solid]",

        // 主题切换图标
        "icon-[material-symbols--moon-stars-outline-rounded]",
        "icon-[material-symbols--sunny-outline-rounded]",
        "icon-[material-symbols--radio-button-partial-outline]",
        "icon-[material-symbols--dark-mode-outline]",

        // 界面图标 - 从模板中提取
        "icon-[tabler--smart-home]",
        "icon-[tabler--external-link]",
        "icon-[material-symbols--palette-outline]",
        "icon-[material-symbols--menu-rounded]",
        "icon-[material-symbols--chevron-right-rounded]",
        "icon-[material-symbols--chevron-left-rounded]",
        "icon-[tabler--search]",
        "icon-[material-symbols--copyright-outline-rounded]",
        "icon-[material-symbols--share-outline]",
        "icon-[material-symbols--notes-rounded]",
        "icon-[material-symbols--schedule-outline-rounded]",
        "icon-[fa6-brands--creative-commons]",
        "icon-[material-symbols--more-horiz]",
        "icon-[fa6-regular--address-card]",
        "icon-[material-symbols--keyboard-arrow-up-rounded]",
        "icon-[material-symbols--calendar-today-outline-rounded]",
        "icon-[material-symbols--edit-calendar-outline-rounded]",
        "icon-[material-symbols--book-2-outline-rounded]",
        "icon-[material-symbols--tag-rounded]",
        "icon-[material-symbols--readiness-score-outline-rounded]",
        "icon-[material-symbols--ar-stickers-outline]",
        "icon-[material-symbols--close-rounded]",
        // RSS/Atom 订阅页图标
        "icon-[material-symbols--rss-feed-rounded]",
        "icon-[material-symbols--link-rounded]",
        "icon-[material-symbols--article-outline-rounded]",
        "icon-[material-symbols--help-outline-rounded]",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Roboto", "sans-serif", ...defaultTheme.fontFamily.sans],
            },
        },
    },
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    plugins: [require("@tailwindcss/typography"), addDynamicIconSelectors()],
};