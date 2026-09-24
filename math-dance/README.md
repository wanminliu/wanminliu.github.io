# Math Dance / Funktionsgympa

A short group movement break with precomputed high-school function graphs,
original synthesized rhythm music and an optional device-local English voice.
Prepared for Wanmin Liu. No accounts, installation, server, API key, npm or build
step are needed to use the website.

## 最快使用方法

1. 解压 `math-dance-github.zip`。
2. 打开 `math-dance/index.html`；也可把整个文件夹上传到网站。
3. 选择浅色／深色、2／3 分钟和内容级别。
4. 点击“开始”，允许浏览器启动音频，然后进入全屏。

默认界面为瑞典语，右上角可切换中文或英语。首次点击会在本地准备合成音乐，
可能短暂等待。某些浏览器对本地文件有限制时，使用 GitHub Pages 或本地静态服务器。

## 发布到已有个人主页

假设仓库是 `wanminliu.github.io`：把解压后的 `math-dance` 文件夹整个上传到仓库
当前用于 GitHub Pages 的发布目录，保留文件间的相对位置。网页地址将是：

`https://wanminliu.github.io/math-dance/`

不要把 ZIP 本身当作网站上传；GitHub Pages 不会自动解压。已有主页的发布设置不必改动。
如果现有主页使用自定义构建流程，确保该流程把整个文件夹原样复制到发布输出。

## 发布为独立仓库

1. 创建名为 `math-dance` 的仓库。
2. 将本文件所在文件夹的**内容**上传到仓库根目录，`index.html` 必须直接位于根目录。
3. 仓库 Settings → Pages → Build and deployment → Source：Deploy from a branch。
4. 选择实际使用的分支（通常为 `main`）和 `/(root)`，保存。
5. 等待 GitHub 显示部署网址。

源文件全部使用相对路径，支持仓库子路径。`.nojekyll` 已包含，可保留。
GitHub Pages 的可用性取决于仓库和账户设置；参见官方说明：
https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## Activity design

- Light gray is the default. The only alternative is dark blue-gray. Theme changes
  all graph, grid, text and control colors; it stays fixed during a session.
- Level 1: constant, linear and quadratic functions.
- Level 2: level 1 plus absolute value, cubic and W-shaped quartic functions.
- Level 3: level 2 plus sine, cosine, tangent, exponential and logarithmic functions.
- “Choose functions” exposes independent switches. The level presets reset these
  switches. Each selected type is visited before another selection cycle. When several types are selected, ordinary horizontal-line scenes appear only once per session (up to two frames), in addition to the fixed ending. Quadratics have a higher ordering weight; advanced types are guaranteed a turn, rather than left to rare independent random draws.
- The derivative switch can be used independently of the level. The full sequence is:
  `f(x)=x⁴/24−x²/2`, `f′(x)=x³/6−x`, `f″(x)=x²/2−1`, `f‴(x)=x`, `f⁽⁴⁾(x)=1`, `f⁽⁵⁾(x)=0`.
  Derivative notation remains visible even with the formula switch off.
- The graph axes always cover −6 to 6 with equal x/y scales. Trigonometric arguments
  use radians. Tangent branches are disconnected at their asymptotes; logarithms
  are only drawn on their valid domains. Screen clipping does not redefine domains.
- Arm movements are the default, including low-to-high transitions. Footwork is
  opt-in; small jumps require a separate, initially unchecked option.
  Graph units are not physical metres.
- A graph's prescribed pose represents its visible shape. A jump is the transition
  between poses, not the mathematical meaning of a constant function.

## Timing and music

The score is created on the visitor's device by `music.js`, using synthesized kick,
snare, hi-hat, bass and melodic tones. No recorded samples are loaded.

1. Eight-second introduction: invitation, “Are you ready?”, then three, two, one.
2. At Go, the 120- or 180-second activity begins. The introduction is extra time.
3. Music stays at 120 BPM. Easy movements begin at 8 beats per graph (4 seconds),
   move towards 6 beats (3 seconds) after halfway, then 4 beats (2 seconds) after
   three quarters. Changes occur at phrase boundaries, not in the middle of a phrase.
   W shapes, advanced functions and derivative frames retain 4 seconds per graph.
4. The last 10 seconds are fixed, even if constant functions were unchecked for the
   random section: `y=2` (10,9), `y=0` (8,7), `y=−2` (6,5), `y=0` (4,3), `y=2` (2,1).
5. At zero, movement ends, “Well done!” appears, and a short final chord resolves.

A full playlist is prepared before the session. Derivative sequences are inserted
only when all six frames fit before the final ten seconds. Musical audio and screen
state use the same AudioContext clock. Pausing suspends that clock, and switching
tabs pauses the activity. Space pauses/resumes; F opens fullscreen; Esc exits it.
Settings stay locked during a session; Restart unlocks them. Speech and music volume
can be adjusted while playing. Restart prepares a new random sequence on next Start.

### English voice: practical limitation

The app requests a local English voice and prefers common female voice names.
Availability and voice quality depend on the user's operating system/browser.
If no local English voice is present, the app explicitly reports this and continues
with the on-screen messages and synthesized musical cues. Installing an English
system voice may make one available, depending on the browser.

**Speech synthesis is not sample-accurate.** Countdown numbers on screen, graph
changes and the music share one clock, but a device's spoken numbers can start late.
The code does not promise identical voices or exact spoken alignment on every device.
It cancels stale queued speech instead of accumulating delayed numbers. For a future
release requiring identical speech everywhere, supply appropriately licensed
prerecorded words and schedule their decoded audio buffers on the same audio clock.

## Files

- `index.html`, `style.css`, `app.js`: interface and session control.
- `graphs.js`: 1087 precomputed graph paths; no runtime curve calculation.
- `scenes.js`: 13 curated transformation sequences.
- `sequence.js`: weighted selection, complete phrases, timing and fixed ending.
- `music.js`: fully procedural 120 BPM music.
- `scripts/generate_graphs.py`, `scripts/scenes.py`: regenerate graph paths and scene data using Python's standard library.
- `tests/verify.cjs`: mathematical, timeline and audio checks; optional Node.js command.
- `LICENSE`, `ASSET-LICENSES.md`: MIT and detailed source/asset provenance.

Normal visitors do not need Python or Node.js. Developers can run:

```sh
python3 scripts/generate_graphs.py
node tests/verify.cjs
node tests/session.cjs
node tests/scenes.cjs
node tests/footwork.cjs
```

To serve locally if needed, from this folder:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## Scope and evidence

This is an optional group movement break, not a scored assessment or a validated
attention treatment. It supports familiarization with graph shapes; it does not
claim that two minutes improve mathematical attainment. Review the classroom sound
level, projection visibility and available movement space in the actual setting.

## License

MIT for the supplied source and generated materials where rights exist. Speech
engine rights remain with the visitor's provider. See ASSET-LICENSES.md for details.

## Revised graph variety and mathematical typography

- 12 line slopes: ±1/4, ±1/2, ±1, ±3/2, ±2, ±3, with different intercepts.
- Quadratic, cubic and absolute-value curves include coefficients ±1/4, ±1/2, ±1, ±2.
- Shorter scenes and shuffled rounds ensure variety; each enabled type is covered in the default two- and three-minute presets.
- Formulas use precomputed native MathML for stacked fractions, exponents, logarithm bases and derivative notation. No online LaTeX renderer or third-party fonts are required. Every graph also includes its LaTeX source in the `latex` field.
- Positive x and y directions have arrowheads in both themes.
- Music and voice behavior are unchanged.

## 2026-09-24：数学变化片段

“数学变化片段”开关默认开启。片段整体随机穿插，每张保留 4 秒，便于观察；
普通图形仍按加速选项逐步加快。只有能完整播完的片段才会插入，不挤占最后 10 秒。
关闭开关后，仍播放原有的随机函数及平移、斜率变化。

- 绝对值：`|x/2| → |x| → |2x| → |3x|`，观察宽窄；
  `|-2x| → |2x|`，公式不同、图像相同；`|2x| → −|2x|`，上下翻转。
- 顶点式：`a(x−1)²−2` 改变 a，顶点和对称轴固定；
  `(x−1)²+1 → −(x−1)²+1` 保持顶点，改变开口方向。
  后者是关于水平线 y=1 的翻转，而非关于 x 轴。
- 因式分解式：`a(x+2)(x−2)` 改变 a，标出两个固定零点；
  `(x+2)(x−2) → (x+1)(x−1) → x²`，两个零点靠近并合为双重根。
- 同图异式：`(x−1)²−4 → (x+1)(x−3) → x²−2x−3`，提示保持姿势。
- 翻折：`x²−1 → |x²−1|`，只把 x 轴下方的部分翻到上方。
- 三次函数：`x³ → −x³`。
- 正弦：分别改变振幅和频率，区分波浪变高与波浪变密。
- 反函数：`2^x → log₂(x)`，显示 y=x 参照线及互换的坐标点。

这些片段按已勾选的函数类型启用。例如，翻折片段需要同时勾选二次函数和绝对值；
指数／对数镜像需要同时勾选这两种函数。连续求导仍由独立开关控制。
新增标记只在相关片段显示，普通随机图形保持简洁。屏幕上的数学提示用于认识图形；
不要求学生精确用身体表示每一个点或每一段曲线。

公式使用离线生成的 MathML 排版，并保留 LaTeX 源字段；无需在线公式服务。

## 脚步动作选项（默认关闭）

- **关闭**：所有动作提示以手臂为主，可以坐着完成。图像向下时提示放低手臂，
  不要求屈膝、站起、迈步或跳跃。函数类型和数学变化片段仍可使用。
- **开启**：更频繁插入脚步片段，先保持原位，再向屏幕左／右小迈一步，最后回到原位；
  也穿插轻屈膝后站直。每张固定 4 秒，每个片段完整播放 12 秒，后半程也不加速脚步。
- 脚步片段优先于数学变化片段抽取，因此开启后数学变化片段的频率会相应降低。
  脚步动作独立于“数学变化片段”开关，但仍遵守已选择的函数类型。
- 左右移动的图像平移 2 个坐标单位，对应身体小迈一步，不表示实际距离。
  一次函数保持斜率不变，以改变截距表示同样的水平平移。
- 只选常数函数时，脚步模式使用轻屈膝／站直片段；水平线的左右平移无法从图像中辨认，
  因而不把它用于左右迈步。
- “允许偶尔轻轻跳起”只在脚步模式下显示，默认关闭。即使勾选，也同时提示站直抬手的替代动作。
- 开关需在开始前设置。重新开始后可以更改；最后 10 秒仍采用固定的手臂动作收尾。

界面支持中文、瑞典语和英语；脚步提示也随语言切换。
