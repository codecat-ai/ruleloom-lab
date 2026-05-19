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
- 提供 Projector mode 切换，可放大当前自动机、保留演示状态文本，并在现场引导时隐藏次要控制项。
- 提供键盘快捷键：Space 切换运行/暂停，ArrowRight 或 `.` 单步，`R` 重置，数字键 `1`-`4` 按可见预设顺序选择预设。
- 提供复制文本操作，可导出便携的等宽文本图案，并包含规则、宽度、代数、种子和边界元数据。
- 提供复制 SVG 操作，用于独立的图案快照。
- 提供复制 RLE 操作，可为当前可见代数导出确定性的 Life/RLE 风格文本。
- 提供粘贴 RLE 导入操作，可将 Ruleloom RLE 导出恢复为可编辑的自定义种子设置。
- 提供下载 PNG 操作，可为当前可见代数保存本地图案快照。
- 提供打印教师说明操作，可生成确定性、已转义、便于复制的 HTML 说明页，汇总当前设置、比较结果、规则表、选中的预设/图库/课程上下文、生成行和讨论提示。
- 内置 Rule 30、Rule 90、Rule 110 和 Rule 184 预设，并为学习者提供简短解释。
- 提供产品化的 Gallery examples 区域，包含四个可应用的本地精选设置，其中包括环绕边界和自定义种子案例。
- 支持按种子类型、边界模式和课堂难度筛选图库，并在没有匹配示例时显示空状态。
- 提供 Lesson paths，可把现有图库示例串联为带名称的课堂探究，并包含预计分钟数和讨论提示。
- 为每条 Lesson path 提供本地引导计时提示，包括确定性的分钟范围、阶段标签、简洁提示，以及可复制的纯文本计时提示表。
- 支持在本地复制和粘贴课程路径包 JSON，并校验安全 id、提示、规则、种子和边界值；导入的路径只保留在当前浏览器会话中，不需要账户或同步。
- 提供本地代数标注，可在引导过程中标记值得讨论的行，支持标签、可选备注、移除控制，以及当前浏览器会话内的 JSON 复制/粘贴导入。
- 提供可保存的本地比较集合，便于重复开展工作坊；会在浏览器存储中记录标题、可选备注、两个规则、宽度、代数、种子模式和值、随机种子、边界模式和 schema 版本，并支持通过 JSON 复制/粘贴携带。
- 在 `src/automata.ts` 中导出纯确定性引擎。
- 在 `src/gallery.ts` 中导出纯精选图库元数据和应用辅助函数。
- 在 `src/lessonPaths.ts` 中导出纯课程路径元数据和安全的步骤应用辅助函数。
- 在 `src/lessonPathPacks.ts` 中导出纯确定性的课程路径包导入/导出辅助函数。
- 在 `src/timingCues.ts` 中导出纯确定性的课程计时提示排程和纯文本格式化辅助函数。
- 在 `src/generationAnnotations.ts` 中导出纯本地代数标注辅助函数。
- 在 `src/comparisonSets.ts` 中导出纯本地比较集合校验、存储、导入/导出和应用辅助函数。
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

在现场引导时使用 Projector mode，可以放大当前自动机，保留规则、宽度、代数和边界状态，并减少课堂中的次要视觉干扰。退出投影模式会恢复完整控制项，不会改变本地设置。

使用 Download PNG 可保存当前可见代数的本地快照。PNG 导出在浏览器内完成，不会上传。

使用 Paste Ruleloom RLE 和 Import RLE 可在本地恢复已复制的 Ruleloom RLE 导出。导入会读取 Ruleloom `W<number>` 头、宽度、可见代数、边界元数据和自定义种子元数据；如果没有自定义种子元数据，则从第一行解码结果派生自定义种子。

使用 Gallery examples 可应用一组完整的精选设置。可以按种子类型、边界模式或课堂难度筛选卡片，然后应用任意可见示例。每张卡片会更新规则、宽度、代数、种子模式、种子值、边界模式，以及在提供时更新比较规则，并把可见播放重置到第一行，便于从头观察图案展开。

如果需要一组简短引导流程，而不是单独挑选卡片，可以使用 Lesson paths。每个步骤都会应用一个现有图库设置，把播放重置到第一行，并提供用于观察讨论的提示。

每条 Lesson path 上显示的 Timing cues 可帮助你运行 24 分钟迷你课程，而不需要单独的计时表。每条提示包含分钟范围、阶段标签和引导师提示；Copy timing cues 会复制确定性的纯文本提示表，便于本地交接或打印。

使用 Copy built-in lesson paths 可复制确定性的课程路径包 JSON。将本地路径包粘贴到 Lesson paths 导入框后，会把这些路径添加到当前浏览器会话；格式错误的 JSON、重复 id、不安全文本字段以及无效规则/种子/边界设置都会在本地被拒绝。

使用 Generation annotations 可在引导时用短标签和可选备注标记当前可见代数。复制 annotations JSON 可把这些本地标记带到另一个会话，也可以粘贴并导入标注 JSON；错误的 schema 版本、缺失字段、无效代数和空标签都会在本地被拒绝。

使用 Saved comparison sets 可把重复使用的工作坊设置保存在当前浏览器中。每个集合都会记录当前主规则、比较规则、宽度、代数、种子模式、随机种子、自定义种子、边界模式、标题、可选备注和 schema 版本。可以应用集合来恢复比较，移除不再需要的集合，也可以复制/粘贴 sets JSON，在不使用账户、网络请求或上传的情况下迁移本地列表。

使用 Print teacher notes 可为当前设置准备本地可打印 HTML 说明页。说明页包含当前规则、种子、边界模式、比较汇总、规则表、可见生成行、可用的预设/图库/课程上下文，以及讨论提示。

## 示例

通过 URL 查询字符串恢复一个确定性的 Rule 90 探索：

```text
?rule=90&width=61&steps=80&seed=center&boundary=fixed
```

尝试 Rule 30 预设来观察类似混沌的伪随机增长，Rule 90 生成嵌套的谢尔宾斯基三角形，Rule 110 展示计算通用行为，Rule 184 展示类似交通流的移动。应用会在预设控制旁显示这些解释。

应用 Sierpinski lattice 可查看干净的 Rule 90 中心种子分形，Wrapped traffic loop 可查看带圆形边缘的 Rule 184，Rule 30 noise field 可查看可重复的确定性无序图案，Custom seed lanes 可查看手工构造的 Rule 110 起始状态。

筛选 Gallery examples，可以为课堂流程找到适合入门的中心种子活动、适合进阶的固定边界随机种子活动，或适合高阶的自定义种子活动。

运行 Patterns from one spark，可以在约 12 分钟内从 Rule 90 中心种子推进到 Rule 30 确定性噪声和 Rule 110 自定义轨道。运行 Edges change the story，可以在约 10 分钟内从固定边界比较到环绕交通流。

复制 Patterns from one spark 的 timing cues，可得到一份 24 分钟迷你课程提示表，其中 Explore、Compare 和 Reflect 的范围分别为 0-8、8-16 和 16-24 分钟。

复制内置课程路径包，在本地文件中修改 JSON 标题和提示，然后再粘贴回来，即可为一次工作坊添加仅当前会话可见的变体路径。

在分享 URL 中改用 `boundary=wrap`，即可让左右边缘彼此作为邻居读取。

将主规则设为 `30`，并将 Compare with rule 设为 `90`，即可在同一棋盘上查看确定性的分歧汇总。

先单步到部分运行状态，再使用 Download PNG，即可只捕获当前可见行，并生成安全文件名，例如 `ruleloom-rule-90-w61-g12-center-fixed.png`。

应用一个 Lesson path 步骤，调整 Compare with rule，然后使用 Print teacher notes，即可生成一份引导师讲义，记录课堂当下的精确可见行和讨论提示。

现场运行时，可以单步到值得讨论的代数，并添加 `First asymmetry` 或 `Traffic jam forms` 这样的 Generation annotation；课后复制 annotations JSON 即可保留这些标记，不需要上传任何内容。

在重复开展工作坊前，可以保存 `Traffic boundary contrast` 或 `Sierpinski warmup` 这样的 comparison set。下一次活动中应用该集合，就能一次恢复两个规则、棋盘大小、代数、种子设置和边界模式。

选择一个 Gallery example 或 Lesson path 步骤后开启 Projector mode，即可以放大的棋盘进行展示，同时保留 Step、Reset、Run 和预设控制。

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

保存的比较集合会存放在带版本号的浏览器本地键中，也可以复制为 JSON。导入时会校验 schema 版本、安全 id、有长度上限的标题和备注、规则范围、宽度和代数范围、种子模式和值、随机种子、边界模式，以及缺少可选备注或种子字段的旧记录。

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

Ruleloom Lab 使用 Vitest 编写面向行为的测试，覆盖规则解码、固定和环绕边界生成、确定性种子、精选图库元数据、图库筛选与应用行为、课程路径元数据与步骤应用、课程路径计时提示排程和纯文本提示表、课程路径包导入/导出校验、代数标注校验/导入/导出/排序、比较集合校验/存储/导入/导出/应用行为、投影模式标签/状态/类名、规则比较汇总、教师说明格式化与打印辅助函数、URL 查询辅助函数、预设解释、键盘快捷键、纯文本导出、SVG 导出、类 RLE 导出与导入、PNG 导出渲染与文件名、剪贴板/下载行为和渲染出的 HTML 结构。

```bash
npm test -- --run
```

## 路线图

- 添加本地引导会话摘要，汇总代数标注、课程上下文和选定导出。
- 添加本地工作坊检查清单，把比较集合、课程路径和引导备注组合为可复用的执行表。
- 添加可选的本地课程路径节奏预设，支持更短的课前导入和更长的工作坊。

## 贡献

欢迎贡献。请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)，保持改动小而清晰，并为新的自动机行为或 UI 变化加入面向行为的测试。

## 许可证

MIT。参见 [LICENSE](LICENSE)。

## AI 辅助维护

本项目在 AI 辅助下编写和维护，并通过本地测试与 CI 在发布前验证变更。
