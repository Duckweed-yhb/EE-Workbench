# 参与贡献

感谢你有兴趣为 EE Workbench 贡献代码或想法！无论是修 bug、加小工具、改进猫娘桌宠的台词，还是只是提个建议，都欢迎。

## 报告 Bug

遇到 bug 时，请用 [Bug Report 模板](.github/ISSUE_TEMPLATE/bug_report.yml) 提 Issue，并尽量包含：

- 嘉立创 EDA 专业版的版本号
- 操作系统（Windows / macOS / Linux）
- 复现步骤
- 期望行为 vs 实际行为
- 截图或录屏（如有）

## 提功能建议

用 [Feature Request 模板](.github/ISSUE_TEMPLATE/feature_request.yml) 提 Issue，说明：

- 你想解决什么场景
- 期望的交互大概是什么样
- 是否有类似插件/工具可以参考

## 提交代码（Pull Request）

1. Fork 本仓库到你自己的账号
2. 从 `main` 切出分支：`git checkout -b feat/your-feature`
3. 安装依赖并启动开发：
   ```bash
   npm install
   npm run debug
   ```
4. 在嘉立创 EDA 专业版的扩展管理器中导入本地插件调试
5. 提交前跑一次检查：
   ```bash
   npm run lint
   ```
6. Commit message 遵循 [Conventional Commits](https://www.conventionalcommits.org/)：
   - `feat: 新增单位换算小工具`
   - `fix: 修复番茄钟结束后玩偶状态未复位`
   - `docs: 更新 README 截图`
   - `style: 调整桌宠气泡圆角`
7. 推送分支并提 Pull Request 到 `main`，描述清楚改动动机和测试方式

## 开发约定

- 插件主入口为 `iframe/workbench.html`（单文件内嵌全部 UI / CSS / JS）
- 新增图片资源请放在 `images/` 下，控制单张体积（桌宠立绘建议 ≤ 300KB）
- 不要提交 `build/dist/` 下的 `.eext` 产物（已在 `.edaignore` / `.gitignore` 排除）
- 保持深色 / 浅色两套主题都能正常显示
- 改动桌宠时，记得五个状态（idle / working / resting / celebrate / sleep）都要照顾到

## 行为准则

对人友善、对事不对人。欢迎一切真诚的反馈和贡献。
