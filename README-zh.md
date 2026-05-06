# Ruleloom Lab

[English](README.md) | [中文](README-zh.md) | [日本語](README-ja.md)


Ruleloom Lab 是一个本地优先的浏览器初等元胞自动机游乐场：输入 Wolfram 规则编号，选择种子，然后观察微小的邻域规则如何编织出令人惊讶的视觉图案。

## 问题与动机

初等元胞自动机很容易定义，但仅凭规则编号很难理解。Ruleloom Lab 为教师、学习者、创意编程者和好奇的开发者提供一种私密、低安装成本的方式，探索三元二进制邻域如何随时间产生复杂行为。

## 功能

- 支持输入 0 到 255 的规则编号。
- 支持宽度、代数和种子控制，并对无效值进行可预测的限制。
- 支持中心种子、确定性随机种子和自定义位字符串种子。
- 支持边界模式控制，可比较固定零值边缘和环绕式圆形边缘。
- 使用可访问的 HTML/CSS 元胞自动机网格。
- 展示从 `111` 到 `000` 的邻域规则表。
- 提供单步、重置、运行和分享控制。
- 提供键盘快捷键：Space 切换运行/暂停，ArrowRight 或 `.` 单步，`R` 重置，数字键 `1`-`4` 按可见预设顺序选择预设。
- 提供复制 SVG 操作，用于独立的图案快照。
- 内置 Rule 30、Rule 90、Rule 110 和 Rule 184 预设，并为学习者提供简短解释。
- 在 `src/automata.ts` 中导出纯确定性引擎。
- 在 `src/share.ts` 中提供查询字符串导入和导出辅助函数。
- 在 `src/svgExport.ts` 中提供确定性的 SVG 图案导出器。

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

使用 Boundary 控制项比较默认的固定零值边缘和环绕式圆形边缘，无需改变规则或种子。

当焦点不在表单控件内时，可以使用键盘快捷键：Space 运行/暂停，ArrowRight 或 `.` 单步，`R` 重置，`1`-`4` 按可见顺序选择 Rule 30、Rule 90、Rule 110 和 Rule 184。

## 示例

通过 URL 查询字符串恢复一个确定性的 Rule 90 探索：

```text
?rule=90&width=61&steps=80&seed=center&boundary=fixed
```

尝试 Rule 30 预设来观察类似混沌的伪随机增长，Rule 90 生成嵌套的谢尔宾斯基三角形，Rule 110 展示计算通用行为，Rule 184 展示类似交通流的移动。应用会在预设控制旁显示这些解释。

在分享 URL 中改用 `boundary=wrap`，即可让左右边缘彼此作为邻居读取。

## 配置

应用可以通过浏览器界面或 URL 查询参数配置：

- `rule`：0 到 255 的整数。
- `width`：网格宽度，会被限制在 15 到 121 个元胞之间。
- `steps`：显示代数，会被限制在 1 到 160 行之间。
- `seed`：`center`、`random` 或 `custom`。
- `boundary`：`fixed` 表示外侧邻居为零，`wrap` 表示使用圆形环绕边缘。无效值会回退到 `fixed`。
- `randomSeed`：确定性的数字随机种子。
- `customSeed`：在 `seed=custom` 时使用的位字符串。

无效数字会被限制到支持范围内。缺少边界设置时会使用 `fixed`，以保持向后兼容。

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

Ruleloom Lab 使用 Vitest 编写面向行为的测试，覆盖规则解码、固定和环绕边界生成、确定性种子、URL 查询辅助函数、预设解释、键盘快捷键、SVG 导出、剪贴板复制行为和渲染出的 HTML 结构。

```bash
npm test -- --run
```

## 路线图

- 导出 PNG 图案快照。
- 添加规则并排比较。
- 在文档中添加可分享的示例图库。

## 贡献

欢迎贡献。请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)，保持改动小而清晰，并为新的自动机行为或 UI 变化加入面向行为的测试。

## 许可证

MIT。参见 [LICENSE](LICENSE)。

## AI 辅助维护

本项目在 AI 辅助下编写和维护，并通过本地测试与 CI 在发布前验证变更。
