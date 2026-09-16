<?php

/* 评论系统纯函数库（themeConfig 也要用其中的函数） */
require_once __DIR__ . '/modules/comment-util.php';

/* ---- 注册路由 ---- */
try {
    if (!\Typecho\Router::get('archives_list')) {
        \Utils\Helper::addRoute('archives_list', '/archives/', 'Widget_Archive', 'render', 'index');
    }
    // RSS/Atom 订阅路由：/rss.xml /atom.xml feed 端点 + /rss /atom 订阅说明页
    foreach ([
        'feed_xml_rss'    => '/rss.xml',
        'feed_xml_atom'   => '/atom.xml',
        'feed_info_rss'   => '/rss/',
        'feed_info_atom'  => '/atom/',
    ] as $_route => $_path) {
        if (!\Typecho\Router::get($_route)) {
            \Utils\Helper::addRoute($_route, $_path, 'Widget_Archive', 'render', 'index');
        }
    }
    if (!\Typecho\Router::get('oauth_github')) {
        \Utils\Helper::addRoute('oauth_github', '/oauth/github/', 'Widget_Archive', 'render', 'index');
    }
} catch (\Throwable $e) {
    // ignore
}

/* ---- /archives/ 渲染: 指定模板文件 ---- */
if (!function_exists('themeInit')) {
    function themeInit($archive)
    {
        if ('archives_list' === $archive->parameter->type) {
            $archive->setThemeFile('archives.php');
        }
        if ('oauth_github' === $archive->parameter->type) {
            // GitHub OAuth 回调：处理 code → 登录 → 跳回
            require_once __DIR__ . '/modules/comment-util.php';
            fuwari_comments_oauth($archive);
            exit;
        }

        /* ---- RSS/Atom 订阅路由: 按路线 type 分派 modules 模板 ---- */
        $rt = $archive->parameter->type;
        if (in_array($rt, ['feed_xml_rss', 'feed_xml_atom'], true)) {
            $archive->setThemeFile('modules/feeds.php');
        } elseif (in_array($rt, ['feed_info_rss', 'feed_info_atom'], true)) {
            $archive->setThemeFile('modules/feed-info.php');
        }

        /* ---- 评论系统 AJAX / OAuth 端点 ---- */
        require_once __DIR__ . '/modules/comment-util.php';
        fuwari_comments_dispatch($archive);

        /* ---- AJAX 搜索: /search/[keyword]/?ajax=1 返回 JSON ---- */
        if ($archive->is('search') && $archive->request->get('ajax') === '1') {
            header('Content-Type: application/json; charset=utf-8');
            // themeInit 在查询执行前被调用，此处手动触发查询（过滤对齐 searchHandle：仅文章与页面）
            $q = $archive->request->get('keywords', '');
            $like = '%' . str_replace(' ', '%', $q) . '%';
            $select = $archive->select()
                ->where('table.contents.type IN (?, ?)', 'post', 'page')
                ->where('table.contents.status = ?', 'publish')
                ->where("table.contents.password IS NULL OR table.contents.password = ''")
                ->where("table.contents.title LIKE ? OR table.contents.text LIKE ?", $like, $like);
            $archive->query($select);
            $terms = preg_split('/\s+/u', trim($q), -1, PREG_SPLIT_NO_EMPTY) ?: [];
            $results = [];
            while ($archive->next()) {
                $title = $archive->title;
                $plain = preg_replace('/\s+/u', ' ', html_entity_decode(strip_tags($archive->excerpt)));
                $titleHits = $bodyHits = 0;
                $firstPos = false;
                foreach ($terms as $term) {
                    if (mb_strpos($title, $term) !== false) $titleHits++;
                    if (($p = mb_strpos($plain, $term)) !== false) {
                        $bodyHits++;
                        if ($firstPos === false) $firstPos = $p;
                    }
                }
                // 命中率 = 标题命中优先，其次正文命中次数，仅正文命中置后
                $score = $titleHits * 1000 + $bodyHits;
                if ($score === 0) continue;
                // 以首个命中词为中心截取摘要（标题命中且无正文命中则取开头）
                if ($firstPos === false) $firstPos = 0;
                $start = max(0, $firstPos - 45);
                $desc = mb_substr($plain, $start, 90);
                if ($start > 0) $desc = '…' . $desc;
                if ($start + 90 < mb_strlen($plain)) $desc .= '…';
                $results[] = [
                    'title'       => $title,
                    'permalink'   => $archive->permalink,
                    'description' => $desc,
                    'score'       => $score,
                ];
            }
            usort($results, fn($a, $b) => $b['score'] <=> $a['score']);
            $results = array_slice($results, 0, 13);
            echo json_encode(['hits' => $results, 'keyword' => $q], JSON_UNESCAPED_UNICODE);
            exit;
        }

        /* ---- AJAX Reactions: ?reaction=1&cid=X&emoji=Y&action=add|remove 返回 JSON ---- */
        if ($archive->request->get('reaction') === '1') {
            header('Content-Type: application/json; charset=utf-8');
            $cid = (int)$archive->request->get('cid', 0);
            $emoji = (string)$archive->request->get('emoji', '');
            $action = $archive->request->get('action', 'add') === 'remove' ? 'remove' : 'add';
            if ($cid <= 0 || $emoji === '') {
                echo json_encode(['ok' => false]);
                exit;
            }
            $select = $archive->select()
                ->where('table.contents.type IN (?, ?)', 'post', 'page')
                ->where('table.contents.status = ?', 'publish')
                ->where('table.contents.cid = ?', $cid);
            $archive->query($select);
            if (!$archive->have()) {
                echo json_encode(['ok' => false]);
                exit;
            }
            $config = getReactionsConfig();
            if (!isset($config[$emoji])) {
                echo json_encode(['ok' => false]);
                exit;
            }
            $data = normalizeReactionCounts(@$archive->fields->reactions);
            $data[$emoji] = max(0, (int)($data[$emoji] ?? 0) + ($action === 'add' ? 1 : -1));
            // Widget_Archive 没有 setField（只在后台 EditTrait 里），直接写库。
            // 存为 str 类型：Typecho 保存文章时对 str 原样透传，不会再叠加 json_encode 转义。
            $json = str_replace("'", "''", json_encode($data, JSON_UNESCAPED_UNICODE));
            $db = \Typecho\Db::get();
            $db->query("INSERT INTO " . $db->getPrefix() . "fields (cid, name, type, str_value, int_value, float_value)
                VALUES ($cid, 'reactions', 'str', '$json', 0, 0)
                ON CONFLICT (cid, name)
                DO UPDATE SET type = 'str', str_value = EXCLUDED.str_value");
            echo json_encode(['ok' => true, 'emoji' => $emoji, 'count' => $data[$emoji]]);
            exit;
        }
    }
}

/* ---- 国际化: .properties 翻译函数 ---- */if (!function_exists('__t')) {
    function __t(string $key, ...$args): string {
        static $strings = [];
        static $loaded = false;
        if (!$loaded) {
            $loaded = true;
            $lang = 'default';
            if (class_exists('Typecho\\Widget')) {
                try {
                    $opt = \Typecho\Widget::widget('Widget_Options');
                    if (!empty($opt->lang)) $lang = $opt->lang;
                } catch (\Exception $e) {}
            }
            $file = __DIR__ . '/i18n/' . $lang . '.properties';
            if (!file_exists($file)) {
                $file = __DIR__ . '/i18n/default.properties';
            }
            if (file_exists($file)) {
                $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                foreach ($lines as $line) {
                    $line = trim($line);
                    if ($line === '' || $line[0] === '#') continue;
                    $pos = strpos($line, '=');
                    if ($pos === false) continue;
                    $strings[trim(substr($line, 0, $pos))] = trim(substr($line, $pos + 1));
                }
            }
        }
        $text = $strings[$key] ?? $key;
        return empty($args) ? $text : vsprintf($text, $args);
    }
}

/* ---- 工具函数 ---- */
if (!function_exists('calcWordCount')) {
    function calcWordCount($content) {
        $text = strip_tags($content);
        $text = preg_replace('/\s+/', ' ', $text);
        $text = trim($text);
        $chineseChars = preg_match_all('/[\x{4e00}-\x{9fff}]/u', $text, $matches);
        $englishText = preg_replace('/[\x{4e00}-\x{9fff}]/u', '', $text);
        $englishWords = count(preg_split('/\s+/', trim($englishText))) - 1;
        if ($englishWords < 0) $englishWords = 0;
        return $chineseChars + $englishWords;
    }
}
if (!function_exists('calcReadingTime')) {
    function calcReadingTime($wordCount, $wpm = 200) {
        return max(1, (int)ceil($wordCount / $wpm));
    }
}
if (!function_exists('getTagsString')) {
    function getTagsString($tags) {
        if (empty($tags) || !is_array($tags)) return '';
        $names = array();
        foreach ($tags as $t) {
            if (is_array($t) && isset($t['name'])) $names[] = $t['name'];
            elseif (is_object($t) && isset($t->name)) $names[] = $t->name;
        }
        return implode(',', $names);
    }
}
/* Typecho 编辑器粘贴外链时常丢一个斜杠，如 https:/xxx */
if (!function_exists('getCoverUrl')) {
    function getCoverUrl($archive) {
        $cover = @$archive->fields->cover;
        if (!$cover) {
            $content = @$archive->content;
            if ($content && preg_match('/<img[^>]+src=["\']([^"\']+)["\']/i', $content, $m)) {
                $cover = $m[1];
            }
            if (!$cover) return '';
        }
        if (preg_match('#^https?:/#i', $cover) && !preg_match('#^https?://#i', $cover)) {
            $cover = preg_replace('#^https?:/#i', '$0/', $cover);
        }
        if (preg_match('#^https?://#i', $cover) || $cover[0] === '/') return $cover;
        $options = @$archive->options;
        if (!$options) return $cover;
        return \Typecho\Common::url($cover, $options->themeUrl);
    }
}
/* 站点级分享卡片图：banner；og:image 需要绝对 URL */
if (!function_exists('getOgImageUrl')) {
    function getOgImageUrl($options) {
        $src = @$options->bannerSrc;
        if (!$src) return '';
        if (preg_match('#^https?://#i', $src) || $src[0] === '/') return $src;
        return \Typecho\Common::url($src, $options->themeUrl);
    }
}

/* ---- 浏览量 ---- */
// 存储于 typecho_fields 表（custom field），type=int，后台"自定义字段"面板可直接改数值；
// 每篇正文页渲染时 countViews 原子 +1（post.php 调用，post-meta 只读不增）。
// 注意：前台是 Widget_Archive，既没有后台 EditTrait 的 incrIntField/setField，
// 也不对外暴露 protected 的 db 属性（$archive->db 取到 null 曾导致自增静默失败），
// 这里用 \Typecho\Db::get() 直连，原生 SQL 原子自增：字段不存在则建 int 类型并置 1，存在则 +1。
// 防重复：前端 swup 会预取页面内所有站内链接（打开一篇文章时其它文章也被请求），
// 用 cookie 记录同一浏览器 1 小时内已计数的文章，命中则不再 +1。
if (!function_exists('getPostViews')) {
    function getPostViews($archive) {
        $v = @$archive->fields->views;
        return is_numeric($v) ? (int)$v : 0;
    }
}
if (!function_exists('fuwari_views_should_count')) {
    function fuwari_views_should_count($cid) {
        $now = time();
        $seen = json_decode((string)($_COOKIE['fuwari_views'] ?? '{}'), true);
        if (!is_array($seen)) $seen = [];
        foreach ($seen as $k => $t) {
            if ($now - (int)$t > 3600) unset($seen[$k]);
        }
        if (isset($seen[$cid])) return false;
        if (count($seen) >= 100) {
            asort($seen);
            $seen = array_slice($seen, -50, null, true);
        }
        $seen[$cid] = $now;
        @setcookie('fuwari_views', json_encode($seen), $now + 86400 * 30, '/', '', false, true);
        return true;
    }
}
if (!function_exists('countViews')) {
    function countViews($archive) {
        if (!defined('_fuwari_counted_')) {
            define('_fuwari_counted_', true);
            try {
                $cid = (int)$archive->cid;
                if (!fuwari_views_should_count($cid)) return;
                $db = \Typecho\Db::get();
                $db->query("INSERT INTO " . $db->getPrefix() . "fields (cid, name, type, str_value, int_value, float_value)
                    VALUES ($cid, 'views', 'int', NULL, 1, 0)
                    ON CONFLICT (cid, name)
                    DO UPDATE SET int_value = " . $db->getPrefix() . "fields.int_value + 1");
            } catch (\Throwable $e) {
                // ignore
            }
        }
    }
}

/* ---- Reactions ---- */
if (!function_exists('getReactionsConfig')) {
    // 解析后台配置：每行一个表态；emoji 原样 / < 开头视为 SVG / http(s):// 或 / 开头视为图片 URL
    function getReactionsConfig($options = null) {
        if ($options === null) {
            $options = \Typecho\Widget::widget('Widget_Options');
        }
        $raw = trim((string)($options->reactionsList ?? ''));
        if ($raw === '') $raw = "👍\n❤️\n🚀\n👀\n👾\n🎉"; // 未保存配置时回退默认
        $config = [];
        foreach (preg_split('/\r\n|\r|\n/', $raw) as $line) {
            $line = trim($line);
            if ($line === '') continue;
            $config['r' . count($config)] = getReactionDisplay($line);
        }
        return $config;
    }
}
if (!function_exists('getReactionDisplay')) {
    function getReactionDisplay($line) {
        if ($line[0] === '<') return ['type' => 'svg', 'value' => $line];
        if (preg_match('#^https?://#i', $line) || $line[0] === '/') {
            return ['type' => 'img', 'value' => $line];
        }
        // 含 . 或 / 视为相对路径图片（如 assets/images/x.png），否则按 emoji 文本
        if (preg_match('#[./]#', $line)) {
            $options = \Typecho\Widget::widget('Widget_Options');
            return ['type' => 'img', 'value' => \Typecho\Common::url($line, $options->themeUrl)];
        }
        return ['type' => 'text', 'value' => $line];
    }
}
/* 读取端统一归一化：兼容 str 存储的 JSON 文本、面板手改的历史脏数据（多层转义逐层解码） */
if (!function_exists('normalizeReactionCounts')) {
    function normalizeReactionCounts($v) {
        if (is_array($v)) return $v;
        $v = (string)$v;
        while (is_string($v)) {
            $d = json_decode($v, true);
            if (is_array($d)) return $d;
            if (json_last_error() !== JSON_ERROR_NONE || !is_string($d)) return [];
            $v = $d;
        }
        return [];
    }
}
if (!function_exists('getReactionCounts')) {
    function getReactionCounts($archive) {
        return normalizeReactionCounts(@$archive->fields->reactions);
    }
}

/* ---- 后台文章编辑页：封面图字段（保存为 fields[cover]，getCoverUrl 读取） ---- */
if (!function_exists('themePostFields')) {
    function themePostFields($layout) {
        $Text = 'Typecho\Widget\Helper\Form\Element\Text';
        $cover = new $Text('cover', null, '', '封面图 URL', '留空则自动使用正文第一张图片，支持外链或相对路径');
        $layout->addItem($cover);
        $Checkbox = 'Typecho\Widget\Helper\Form\Element\Checkbox';
        $disable = new $Checkbox('reactionsDisable', ['1' => '在本页禁用表态'], [],
            'Reactions 表态', '勾选后此文章/页面不显示表态区');
        // Checkbox 默认 name 是 fields[reactionsDisable][]（数组），保存时会被按 json 类型写入；
        // 改成字符串 name，与手写字段 str 语义一致，读取端 !empty() 判断不受影响。
        foreach ($disable->inputs as $_inp) {
            $_inp->setAttribute('name', 'fields[reactionsDisable]');
        }
        $layout->addItem($disable);
        /* reactions 存于 str 自定义字段，后台面板可见可直接编辑 JSON；写库在 themeInit 的表态 AJAX 里 */
    }
}
/* 页面编辑页：同上，防止保存时面板删除 reactions 字段 */
if (!function_exists('themePageFields')) {
    function themePageFields($layout) {
        themePostFields($layout);
    }
}
/* ---- 后台主题配置面板 ---- */
if (!function_exists('themeConfig')) {
    function themeConfig($form) {
        $Text = 'Typecho\Widget\Helper\Form\Element\Text';
        $Textarea = 'Typecho\Widget\Helper\Form\Element\Textarea';
        $Select = 'Typecho\Widget\Helper\Form\Element\Select';
        $Checkbox = 'Typecho\Widget\Helper\Form\Element\Checkbox';
        $Layout = 'Typecho\Widget\Helper\Layout';

        $form->addItem((new $Layout('h3', ['style' => 'margin:1.5em 0 0.5em;color:var(--primary)']))
            ->html(__t('settings.group.general')));

        $form->addInput(new $Select('lang', [
            ''       => '简体中文',
            'en'     => 'English',
            'zh_TW'  => '繁體中文',
            'es'     => 'Español',
        ], '', __t('settings.siteLanguage'), __t('settings.siteLanguage.desc')));

        $form->addInput(new $Text('faviconSrc', null, 'assets/images/favicon-light-192.png',
            __t('settings.faviconSrc'), __t('settings.faviconSrc.desc')));

        $form->addInput(new $Text('themeColorHue', null, '250',
            __t('settings.themeColorHue'), __t('settings.themeColorHue.desc')));
        $form->addInput(new $Checkbox('themeColorFixed', ['1' => __t('settings.themeColorFixed.label')], [],
            __t('settings.themeColorFixed'), __t('settings.themeColorFixed.desc')));

        $form->addInput(new $Select('bannerMode', [
            'banner'     => __t('settings.bannerMode.banner'),
            'fullscreen' => __t('settings.bannerMode.fullscreen'),
            'hidden'     => __t('settings.bannerMode.hidden'),
        ], 'banner', __t('settings.bannerMode'), __t('settings.bannerMode.desc')));
        $form->addInput(new $Text('bannerSrc', null, 'assets/images/demo-banner.png',
            __t('settings.bannerSrc'), __t('settings.bannerSrc.desc')));
        $form->addInput(new $Select('bannerPosition', [
            'center' => __t('settings.bannerPosition.center'),
            'top'    => __t('settings.bannerPosition.top'),
            'bottom' => __t('settings.bannerPosition.bottom'),
        ], 'center', __t('settings.bannerPosition'), __t('settings.bannerPosition.desc')));
        $form->addInput(new $Checkbox('bannerCreditEnable', ['1' => __t('settings.bannerCreditEnable.label')], [],
            __t('settings.bannerCreditEnable'), __t('settings.bannerCreditEnable.desc')));
        $form->addInput(new $Text('bannerCreditText', null, '',
            __t('settings.bannerCreditText'), __t('settings.bannerCreditText.desc')));
        $form->addInput(new $Text('bannerCreditUrl', null, '',
            __t('settings.bannerCreditUrl'), __t('settings.bannerCreditUrl.desc')));
        $form->addInput(new $Checkbox('tocEnable', ['1' => __t('settings.tocEnable.label')], ['1'],
            __t('settings.tocEnable'), __t('settings.tocEnable.desc')));

        $form->addItem((new $Layout('h3', ['style' => 'margin:1.5em 0 0.5em;color:var(--primary)']))
            ->html(__t('settings.group.style')));

        $form->addInput(new $Select('colorScheme', [
            'auto'  => __t('settings.colorScheme.auto'),
            'dark'  => __t('settings.colorScheme.dark'),
            'light' => __t('settings.colorScheme.light'),
        ], 'auto', __t('settings.colorScheme'), __t('settings.colorScheme.desc')));
        $form->addInput(new $Checkbox('enableChangeColorScheme', ['1' => __t('settings.enableChangeColorScheme.label')], ['1'],
            __t('settings.enableChangeColorScheme'), __t('settings.enableChangeColorScheme.desc')));

        $form->addItem((new $Layout('h3', ['style' => 'margin:1.5em 0 0.5em;color:var(--primary)']))
            ->html(__t('settings.group.sidebar')));

        $form->addInput(new $Checkbox('widgetCategories', ['1' => __t('settings.widgetCategories.label')], ['1'],
            __t('settings.widgetCategories'), __t('settings.widgetCategories.desc')));
        $form->addInput(new $Checkbox('widgetTags', ['1' => __t('settings.widgetTags.label')], ['1'],
            __t('settings.widgetTags'), __t('settings.widgetTags.desc')));
        $form->addInput(new $Checkbox('widgetCustomHtml', ['1' => __t('settings.widgetCustomHtml.label')], [],
            __t('settings.widgetCustomHtml'), __t('settings.widgetCustomHtml.desc')));
        $form->addInput(new $Textarea('widgetCustomContent', null, '',
            __t('settings.widgetCustomContent'), __t('settings.widgetCustomContent.desc')));

        $form->addItem((new $Layout('h3', ['style' => 'margin:1.5em 0 0.5em;color:var(--primary)']))
            ->html(__t('settings.group.profile')));

        $form->addInput(new $Text('authorName', null, 'Lorem Ipsum',
            __t('settings.authorName'), __t('settings.authorName.desc')));
        $form->addInput(new $Textarea('authorBio', null, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            __t('settings.authorBio'), __t('settings.authorBio.desc')));
        $form->addInput(new $Text('authorAvatar', null, 'assets/images/demo-avatar.png',
            __t('settings.authorAvatar'), __t('settings.authorAvatar.desc')));
        $form->addInput(new $Text('authorUrl', null, '/',
            __t('settings.authorUrl'), __t('settings.authorUrl.desc')));
        $form->addInput(new $Textarea('socialLinks', null, '',
            __t('settings.socialLinks'), __t('settings.socialLinks.desc')));

        $form->addItem((new $Layout('h3', ['style' => 'margin:1.5em 0 0.5em;color:var(--primary)']))
            ->html(__t('settings.group.post')));

        $form->addInput(new $Checkbox('postLicenseEnable', ['1' => __t('settings.postLicenseEnable.label')], ['1'],
            __t('settings.postLicenseEnable'), __t('settings.postLicenseEnable.desc')));
        $form->addInput(new $Text('postLicenseName', null, 'CC BY-NC-SA 4.0',
            __t('settings.postLicenseName'), __t('settings.postLicenseName.desc')));
        $form->addInput(new $Text('postLicenseUrl', null, 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
            __t('settings.postLicenseUrl'), __t('settings.postLicenseUrl.desc')));
        $form->addInput(new $Select('contentSize', [
            'prose-base' => __t('settings.contentSize.default'),
            'prose-sm'   => __t('settings.contentSize.small'),
            'prose-lg'   => __t('settings.contentSize.large'),
        ], 'prose-base', __t('settings.contentSize'), __t('settings.contentSize.desc')));
        $form->addInput(new $Select('contentTheme', [
            ''       => __t('settings.contentTheme.default'),
            'boring' => __t('settings.contentTheme.boring'),
        ], '', __t('settings.contentTheme'), __t('settings.contentTheme.desc')));
        $form->addInput(new $Textarea('reactionsList', null,
            "👍\n❤️\n🚀\n👀\n😂\n🎉",
            __t('settings.reactionsList'), __t('settings.reactionsList.desc')));
        $form->addInput(new $Text('commentPerPage', null, '8',
            __t('settings.commentPerPage'), __t('settings.commentPerPage.desc')));

        $form->addItem((new $Layout('h3', ['style' => 'margin:1.5em 0 0.5em;color:var(--primary)']))
            ->html(__t('settings.group.comments')));

        $form->addInput(new $Text('githubClientId', null, '',
            __t('settings.githubClientId'), __t('settings.githubClientId.desc')));
        $form->addInput(new $Text('githubClientSecret', null, '',
            __t('settings.githubClientSecret'), __t('settings.githubClientSecret.desc')));
        $form->addInput(new $Text('githubRedirectUrl', null, '',
            __t('settings.githubRedirectUrl'), __t('settings.githubRedirectUrl.desc')));
        $form->addItem((new $Layout('p', ['style' => 'margin:0.5em 0 1em;padding:8px 12px;background:var(--btn-regular-bg);border-radius:8px;color:var(--btn-content);font-size:0.9em']))
            ->html(__t('settings.githubCallbackInfo') . ' <code>' . htmlspecialchars(fuwari_gh_redirect(\Typecho\Widget::widget('Widget_Options'))) . '</code>'));

        $form->addItem((new $Layout('h3', ['style' => 'margin:1.5em 0 0.5em;color:var(--primary)']))
            ->html(__t('settings.group.icp')));

        $form->addInput(new $Text('icpText', null, '',
            __t('settings.icpText'), __t('settings.icpText.desc')));
        $form->addInput(new $Text('icpLink', null, '',
            __t('settings.icpLink'), __t('settings.icpLink.desc')));
        $form->addInput(new $Text('gonganText', null, '',
            __t('settings.gonganText'), __t('settings.gonganText.desc')));
        $form->addInput(new $Text('gonganLink', null, '',
            __t('settings.gonganLink'), __t('settings.gonganLink.desc')));
    }
}
