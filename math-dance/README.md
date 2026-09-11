# Math Dance / Funktionsgympa

A short group movement break with precomputed high-school function graphs,
original synthesized rhythm music and an optional device-local English voice.
Prepared for Wanmin Liu. No accounts, installation, server, API key, npm or build
step are needed to use the website.

## 最快使用方法

1. 解压 `math-dance.zip`。
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
  switches. Quadratics have a higher selection weight; advanced functions are rarer.
- The derivative switch can be used independently of the level. The full sequence is:
  `f(x)=x⁴/24−x²/2`, `f′(x)=x³/6−x`, `f″(x)=x²/2−1`, `f‴(x)=x`, `f⁽⁴⁾(x)=1`, `f⁽⁵⁾(x)=0`.
  Derivative notation remains visible even with the formula switch off.
- The graph axes always cover −6 to 6 with equal x/y scales. Trigonometric arguments
  use radians. Tangent branches are disconnected at their asymptotes; logarithms
  are only drawn on their valid domains. Screen clipping does not redefine domains.
- Low-to-high sequences include `y=−4 → y=4 → y=0`. Rise quickly or use a small jump;
  seated or smaller movements are equally valid. Graph units are not physical metres.
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
- `graphs.js`: 535 precomputed graph paths; no runtime curve calculation.
- `sequence.js`: weighted selection, complete phrases, timing and fixed ending.
- `music.js`: fully procedural 120 BPM music.
- `scripts/generate_graphs.py`: regenerate graph paths using Python's standard library.
- `tests/verify.cjs`: mathematical, timeline and audio checks; optional Node.js command.
- `LICENSE`, `ASSET-LICENSES.md`: MIT and detailed source/asset provenance.

Normal visitors do not need Python or Node.js. Developers can run:

```sh
python3 scripts/generate_graphs.py
node tests/verify.cjs
node tests/session.cjs
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
