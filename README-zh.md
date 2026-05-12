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
- 支持对当前规则和第二个 Wolfram 规则进行并排比较汇总，使用当前棋盘设置计算差异。
- 使用可访问的 HTML/CSS 元胞自动机网格。
- 展示从 `111` 到 `000` 的邻域规则表。
- 提供单步、重置、运行和分享控制。
- 提供键盘快捷键：Space 切换运行/暂停，ArrowRight 或 `.` 单步，`R` 重置，数字键 `1`-`4` 按可见预设顺序选择预设。
- 提供复制文本操作，可导出便携的等宽文本图案，并包含规则、宽度、代数、种子和边界元数据。
- 提供复制 SVG 操作，用于独立的图案快照。
- 提供复制 RLE 操作，可为当前可见代数导出确定性的 Life/RLE 风格文本。
- 提供粘贴 RLE 导入操作，可将 Ruleloom RLE 导出恢复为可编辑的自定义种子设置。
- 提供下载 PNG 操作，可为当前可见代数保存本地图案快照。
- 内置 Rule 30、Rule 90、Rule 110 和 Rule 184 预设，并为学习者提供简短解释。
- 提供产品化的 Gallery examples 区域，包含四个可应用的本地精选设置，其中包括环绕边界和自定义种子案例。
- 支持按种子类型、边界模式和课堂难度筛选图库，并在没有匹配示例时显示空状态。
- 在 `src/automata.ts` 中导出纯确定性引擎。
- 在 `src/gallery.ts` 中导出纯精选图库元数据和应用辅助函数。
- 在 `src/share.ts` 中提供查询字符串导入和导出辅助函数。
- 在 `src/textExport.ts` 中提供确定性的纯文本图案导出器。
- 在 `src/svgExport.ts` 中提供确定性的 SVG 图案导出器。
- 在 `src/rleExport.ts` 中提供确定性的类 RLE 图案导出器。
- 在 `src/rleImport.ts` 中提供纯 Ruleloom RLE 导入解析器。
- 在 `src/pngExport.ts` 中提供确定性的 PNG 导出辅助函数，并通过可注入的画布编码支持单元测试。

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

使用 Compare with rule 查看两个规则首次分歧的代数，以及在当前宽度、代数、种子和边界模式下的总差异元胞数。

当焦点不在表单控件内时，可以使用键盘快捷键：Space 运行/暂停，ArrowRight 或 `.` 单步，`R` 重置，`1`-`4` 按可见顺序选择 Rule 30、Rule 90、Rule 110 和 Rule 184。

使用 Download PNG 可保存当前可见代数的本地快照。PNG 导出在浏览器内完成，不会上传。

使用 Paste Ruleloom RLE 和 Import RLE 可在本地恢复已复制的 Ruleloom RLE 导出。导入会读取 Ruleloom `W<number>` 头、宽度、可见代数、边界元数据和自定义种子元数据；如果没有自定义种子元数据，则从第一行解码结果派生自定义种子。

使用 Gallery examples 可应用一组完整的精选设置。可以按种子类型、边界模式或课堂难度筛选卡片，然后应用任意可见示例。每张卡片会更新规则、宽度、代数、种子模式、种子值、边界模式，以及在提供时更新比较规则，并把可见播放重置到第一行，便于从头观察图案展开。

## 示例

通过 URL 查询字符串恢复一个确定性的 Rule 90 探索：

```text
?rule=90&width=61&steps=80&seed=center&boundary=fixed
```

尝试 Rule 30 预设来观察类似混沌的伪随机增长，Rule 90 生成嵌套的谢尔宾斯基三角形，Rule 110 展示计算通用行为，Rule 184 展示类似交通流的移动。应用会在预设控制旁显示这些解释。

应用 Sierpinski lattice 可查看干净的 Rule 90 中心种子分形，Wrapped traffic loop 可查看带圆形边缘的 Rule 184，Rule 30 noise field 可查看可重复的确定性无序图案，Custom seed lanes 可查看手工构造的 Rule 110 起始状态。

筛选 Gallery examples，可以为课堂流程找到适合入门的中心种子活动、适合进阶的固定边界随机种子活动，或适合高阶的自定义种子活动。

在分享 URL 中改用 `boundary=wrap`，即可让左右边缘彼此作为邻居读取。

将主规则设为 `30`，并将 Compare with rule 设为 `90`，即可在同一棋盘上查看确定性的分歧汇总。

先单步到部分运行状态，再使用 Download PNG，即可只捕获当前可见行，并生成安全文件名，例如 `ruleloom-rule-90-w61-g12-center-fixed.png`。

复制 RLE 后，稍后可将其粘贴回 Import RLE，继续编辑保存的规则、宽度、可见行数、边界模式和自定义种子：

```text
# Ruleloom Lab
# rule: 90
# width: 15
# generations: 3
# seed mode: center
# boundary mode: fixed
x = 15, y = 3, rule = W90
7bo7b$6bobo6b$5bo3bo5b!
```

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

RLE 导入只接受 Ruleloom 自身的确定性文本导出。它会解码 `b`、`o`、数字游程计数、`$` 行分隔符和最终的 `!` 终止符，然后以 `seed=custom` 应用结果；除非导出元数据声明 `wrap`，否则边界使用 `fixed`。

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

Ruleloom Lab 使用 Vitest 编写面向行为的测试，覆盖规则解码、固定和环绕边界生成、确定性种子、精选图库元数据、图库筛选与应用行为、规则比较汇总、URL 查询辅助函数、预设解释、键盘快捷键、纯文本导出、SVG 导出、类 RLE 导出与导入、PNG 导出渲染与文件名、剪贴板/下载行为和渲染出的 HTML 结构。

```bash
npm test -- --run
```

## 路线图

- 添加可保存的课程路径，将图库示例串联成短课堂探究。
- 添加可打印的教师说明，用于比较规则、种子和边界模式。

## 贡献

欢迎贡献。请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)，保持改动小而清晰，并为新的自动机行为或 UI 变化加入面向行为的测试。

## 许可证

MIT。参见 [LICENSE](LICENSE)。

## AI 辅助维护

本项目在 AI 辅助下编写和维护，并通过本地测试与 CI 在发布前验证变更。
