<?php
function _fuwariSocialIcon($url) {
    $host = parse_url($url, PHP_URL_HOST);
    $host = strtolower(ltrim((string)$host, 'www.'));
    $map = [
        'github.com'    => 'fa7-brands--github',
        'twitter.com'   => 'fa7-brands--x-twitter',
        'x.com'         => 'fa7-brands--x-twitter',
        'weibo.com'     => 'fa7-brands--weibo',
        'zhihu.com'     => 'fa7-brands--zhihu',
        'bilibili.com'  => 'fa7-brands--bilibili',
        'douban.com'    => 'fa7-brands--douban',
        'tiktok.com'    => 'fa7-brands--tiktok',
        'douyin.com'    => 'fa7-brands--tiktok',
        'telegram.org'  => 'fa7-brands--telegram',
        't.me'          => 'fa7-brands--telegram',
        'facebook.com'  => 'fa7-brands--facebook',
        'instagram.com' => 'fa7-brands--instagram',
        'linkedin.com'  => 'fa7-brands--linkedin',
        'youtube.com'   => 'fa7-brands--youtube',
        'steamcommunity.com' => 'fa7-brands--steam',
        'gitlab.com'    => 'fa7-brands--gitlab',
        'slack.com'     => 'fa7-brands--slack',
        'discord.com'   => 'fa7-brands--discord',
        'discord.gg'    => 'fa7-brands--discord',
        'qq.com'        => 'fa7-brands--qq',
        'weixin.qq.com' => 'fa7-brands--weixin',
        'gitee.com'     => 'fa7-brands--gitee',
        'codeberg.org'  => 'fa7-brands--codeberg',
    ];
    return $map[$host] ?? 'tabler--external-link';
}

function _fuwariSocialPlatformIcon($name) {
    $map = [
        'github'    => 'fa7-brands--github',
        'twitter'   => 'fa7-brands--x-twitter',
        'x'         => 'fa7-brands--x-twitter',
        'weibo'     => 'fa7-brands--weibo',
        'zhihu'     => 'fa7-brands--zhihu',
        'bilibili'  => 'fa7-brands--bilibili',
        'douban'    => 'fa7-brands--douban',
        'tiktok'    => 'fa7-brands--tiktok',
        'douyin'    => 'fa7-brands--tiktok',
        'telegram'  => 'fa7-brands--telegram',
        'facebook'  => 'fa7-brands--facebook',
        'instagram' => 'fa7-brands--instagram',
        'linkedin'  => 'fa7-brands--linkedin',
        'youtube'   => 'fa7-brands--youtube',
        'steam'     => 'fa7-brands--steam',
        'gitlab'    => 'fa7-brands--gitlab',
        'slack'     => 'fa7-brands--slack',
        'discord'   => 'fa7-brands--discord',
        'qq'        => 'fa7-brands--qq',
        'weixin'    => 'fa7-brands--weixin',
        'gitee'     => 'fa7-brands--gitee',
        'codeberg'  => 'fa7-brands--codeberg',
        'rss'       => 'streamline-plump--rss-square-solid',
    ];
    return $map[$name] ?? null;
}
?>
<div class="card-base p-3">
  <a aria-label="Go to About Page" href="<?php echo $this->options->authorUrl; ?>" class="group relative mx-auto mb-3 mt-1 block aspect-square max-w-[12rem] overflow-hidden rounded-xl active:scale-95 lg:mx-0 lg:mt-0 lg:max-w-none">
    <div class="pointer-events-none absolute z-50 flex h-full w-full items-center justify-center transition group-hover:bg-black/30 group-active:bg-black/50">
      <span class="icon-[fa6-regular--address-card] scale-90 text-5xl text-white opacity-0 transition group-hover:scale-100 group-hover:opacity-100"></span>
    </div>
    <?php $_avatar = $this->options->authorAvatar; ?>
    <img src="<?php echo $_avatar && $_avatar[0] !== '/' && strpos($_avatar, 'http') !== 0 ? $this->options->themeUrl($_avatar, $this->options->theme) : $_avatar; ?>" alt="Profile Image of the Author" class="mx-auto h-full w-full object-cover lg:mt-0">
  </a>
  <div class="px-2">
    <div class="mb-1 text-center text-xl font-bold transition dark:text-neutral-50"><?php echo $this->options->authorName; ?></div>
    <div class="mx-auto mb-2 h-1 w-5 rounded-full bg-[var(--primary)] transition"></div>
    <div class="mb-2.5 text-center text-neutral-400 transition"><?php echo $this->options->authorBio; ?></div>
    <?php if ($this->options->socialLinks): ?>
    <?php $_links = array_filter(explode("\n", str_replace("\r", '', $this->options->socialLinks))); ?>
    <?php if ($_links): ?>
    <div class="mt-3 flex flex-wrap justify-center gap-2">
      <?php foreach ($_links as $_line): ?>
      <?php $_line = trim($_line); if (!$_line) continue; ?>
      <?php $_firstColon = strpos($_line, ':'); ?>
      <?php $_protoPos = strpos($_line, '://'); ?>
      <?php if ($_firstColon !== false && ($_protoPos === false || $_firstColon < $_protoPos)): ?>
      <?php $_parts = explode(':', $_line, 2); $_icon = trim($_parts[0]); $_url = trim($_parts[1]); ?>
      <?php if (strpos($_icon, '-') === false && strpos($_icon, ':') === false): ?>
      <?php $_icon = _fuwariSocialPlatformIcon(strtolower($_icon)) ?? 'tabler--external-link'; ?>
      <?php endif; ?>
      <?php else: ?>
      <?php $_icon = _fuwariSocialIcon($_line); $_url = $_line; ?>
      <?php endif; ?>
      <?php if (!$_url) continue; ?>
      <a href="<?php echo $_url; ?>" target="_blank" rel="me noopener" aria-label="Social link"
         class="btn-regular h-10 w-10 rounded-lg active:scale-90">
        <span class="icon-[<?php echo $_icon; ?>] text-[1.5rem]"></span>
      </a>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>
    <?php endif; ?>
  </div>
</div>
