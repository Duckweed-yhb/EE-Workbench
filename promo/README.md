# promo/ 宣传素材包

这个文件夹集中存放 EE Workbench 对外宣传用的文字和图片，不进插件包。

## 文件说明

- `oshwhub-intro.md` — 立创开源（oshwhub.com）项目介绍，复制正文到项目介绍区，按文中顺序上传 `shots/` 下对应图片即可；底部标当前版本号
- `releases/` — 每个版本的发布说明：
  - 大版本（新功能 / 视觉升级）单独写一篇，挑亮点发 B 站动态 / 小红书 / 扩展广场更新说明
  - 小版本（文档 / bugfix）只写进 GitHub Release，不单独宣传
  - 命名规则：`vX.Y.Z.md`，先发的版本号小
- `shots/` — 宣传用截图：
  - `猫娘五状态.png`：猫娘工程师五状态封面图
  - `番茄钟页.png`：番茄钟主界面
  - `BYOX灵感库.png`：BYOX 灵感库
  - `待办页.png`：待办清单
  - `伙伴设置页.png`：伙伴设置页

## 其他渠道

后续可以在这个文件夹继续加：

- `bilibili-column.md` — B 站专栏文章
- `xiaohongshu.md` — 小红书图文文案
- `emoji/` — 猫娘表情包源图（加字后上架微信表情开放平台）
- `cover/` — 各平台封面尺寸图

## 注意

- `images/screenshots/` 下的图是插件包内演示图（README 引用），和这里是两份，不要混
- 这个文件夹已在 `.edaignore` 中排除，不会被打进 `.eext`
