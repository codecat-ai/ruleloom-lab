# Ruleloom Lab

[English](README.md) | [中文](README-zh.md) | [日本語](README-jp.md)


Ruleloom Lab 是一个本地优先的浏览器初等元胞自动机游乐场：输入 Wolfram 规则编号，选择种子，然后观察微小的邻域规则如何编织出令人惊讶的视觉图案。

## 问题与动机

初等元胞自动机很容易定义，但仅凭规则编号很难理解。Ruleloom Lab 为教师、学习者、创意编程者和好奇的开发者提供一种私密、低安装成本的方式，探索三元二进制邻域如何随时间产生复杂行为。

## 功能

- 支持输入 0 到 255 的规则编号。
- 支持宽度、代数和种子控制，并对无效值进行可预测的限制。
- 支持中心种子、确定性随机种子和自定义位字符串种子。
- 使用可访问的 HTML/CSS 元胞自动机网格。
- 展示从 `111` 到 `000` 的邻域规则表。
- 提供单步、重置、运行和分享控制。
- 内置 Rule 30、Rule 90、Rule 110 和 Rule 184 预设。
- 在 `src/automata.ts` 中导出纯确定性引擎。
- 在 `src/share.ts` 中提供查询字符串导入和导出辅助函数。

## 安装

Ruleloom Lab 目前只发布在 GitHub 上。它尚未发布到 npm 或其他包注册表，因此请使用仓库工作流：

```bash
git clone https://github.com/codecat-ai/ruleloom-lab.git
cd ruleloom-lab
npm ci
```

## 快速开始

```bash
npm run dev
```

在浏览器中打开终端输出的本地地址。

## 示例

通过 URL 查询字符串恢复一个确定性的 Rule 90 探索：

```text
?rule=90&width=61&steps=80&seed=center
```

尝试 Rule 30 预设来观察类似混沌的增长，Rule 90 生成类似谢尔宾斯基三角形的图案，Rule 110 展示复杂行为，Rule 184 展示类似交通流的移动。

## 配置

应用可以通过浏览器界面或 URL 查询参数配置：

- `rule`：0 到 255 的整数。
- `width`：网格宽度，会被限制在 15 到 121 个元胞之间。
- `steps`：显示代数，会被限制在 1 到 160 行之间。
- `seed`：`center`、`random` 或 `custom`。
- `randomSeed`：确定性的数字随机种子。
- `customSeed`：在 `seed=custom` 时使用的位字符串。

无效数字会被限制到支持范围内。

## 开发

```bash
npm ci
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

该应用刻意保持本地优先：正常使用不需要服务器、账户、分析、上传或外部 API 调用。

## 测试

Ruleloom Lab 使用 Vitest 编写面向行为的测试，覆盖规则解码、生成过程、确定性种子、URL 查询辅助函数和渲染出的 HTML 结构。

```bash
npm test -- --run
```

## 路线图

- 导出 SVG 或 PNG 图案快照。
- 为每个预设添加解释性注释。
- 添加规则并排比较。
- 添加用于单步和选择预设的键盘快捷键。
- 在文档中添加可分享的示例图库。

## 贡献

欢迎贡献。请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)，保持改动小而清晰，并为新的自动机行为或 UI 变化加入面向行为的测试。

## 许可证

MIT。参见 [LICENSE](LICENSE)。

## AI 辅助维护

本项目在 AI 辅助下编写和维护，并通过本地测试与 CI 在发布前验证变更。
