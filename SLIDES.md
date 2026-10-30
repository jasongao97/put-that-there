<!-- .slide: class="cover" -->
# Put That There

<p class="subtitle">Talk to your sketch</p>

<p class="byline">Yifei Gao · 2026/10</p>

Note:
- 0–2 min. Welcome. Today: speak and point to draw on a p5 canvas, with a small language model running in the browser.
- Check everyone has desktop Chrome, the p5 web editor open, and the microphone allowed.
- The handout has every snippet. Short code we type together; long setup code we copy.

---

<p class="kicker">MIT, 1980</p>

## The original demo

<div class="video"><iframe width="560" height="315" src="https://www.youtube.com/embed/RyBEUyEtxQo?si=wdVK9qzzCWHWjhF5" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>

Note:
- 2–5 min. Play about 45 seconds, the part where Bolt points and says "put that there".
- "Put that there" means nothing without the pointing: speech says what, the hand says where.
- Today's scope: create circles and squares by voice, then add pointing. Moving existing shapes is on the last slide.
- Paper: https://www.media.mit.edu/speech/papers/1980/bolt_SIGGRAPH80_put-that-there.pdf

---

<p class="kicker">Overview</p>

## Three parts

<div class="diagram">
<svg viewBox="0 0 1064 250" role="img" aria-label="Speech becomes text for the brain, which picks an action that our code draws. The mouse position is a side input.">
<defs>
<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" class="head" /></marker>
<marker id="arrow-side" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" class="head side" /></marker>
</defs>
<text x="102" y="22" class="label">INPUT</text>
<text x="532" y="22" class="label">PROCESS</text>
<text x="962" y="22" class="label">OUTPUT</text>
<rect x="2" y="48" width="200" height="68" rx="10" class="box" />
<text x="102" y="89" class="name">Speech</text>
<rect x="432" y="48" width="200" height="68" rx="10" class="box" />
<text x="532" y="89" class="name">Brain</text>
<rect x="862" y="48" width="200" height="68" rx="10" class="box" />
<text x="962" y="89" class="name">Drawing</text>
<line x1="202" y1="82" x2="428" y2="82" class="edge" marker-end="url(#arrow)" />
<text x="315" y="70" class="tag">text</text>
<line x1="632" y1="82" x2="858" y2="82" class="edge" marker-end="url(#arrow)" />
<text x="745" y="70" class="tag">action</text>
<rect x="2" y="174" width="200" height="68" rx="10" class="box side" />
<text x="102" y="215" class="name side">Mouse</text>
<path d="M202 208 H330 V102 H428" class="edge side" marker-end="url(#arrow-side)" />
<text x="266" y="198" class="tag side">(x, y)</text>
</svg>
</div>

Note:
- 5–7 min. Input, process, output. Come back to this diagram as each box starts working.
- Speech becomes text. The brain turns text into an action. Our own p5 code does the drawing.
- Order of the day: input and output first with no AI, then a keyword brain, then a language model.
- The gray mouse joins in Step 5.

---

<p class="kicker">Step 1</p>

## Input: hear the words

```js
const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.continuous = true;

recognition.onresult = ({ results, resultIndex }) => {
  const transcript = results[resultIndex][0].transcript;
  console.log(transcript);
};

recognition.start(); // last line inside setup()
```

<p class="caption">Docs: <a href="https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition">MDN · SpeechRecognition</a></p>

Note:
- 7–14 min. Type along. SpeechRecognition is built into Chrome, nothing to install.
- onresult is a callback: like mousePressed(), but for sentences.
- The braces pull two named fields out of the event. We reuse that trick in drawShape.
- results[resultIndex][0].transcript is the newest sentence, best guess, as text.
- Say something; the words show up in the console. Chrome sends the audio to a server for this.
- Mic stops working? Pair up instead of debugging live. Checkpoint 1.

---

<p class="kicker">Step 2</p>

## Output: a function that draws

```js
function drawShape({ shape, color, x = width / 2, y = height / 2 }) {
  fill(color);
  if (shape === "circle") {
    circle(x, y, 50);
  } else if (shape === "square") {
    square(x, y, 50);
  }
}

// Test it in the p5 console:
drawShape({ shape: "square", color: "blue", x: 100, y: 100 })
```

Note:
- 14–19 min. Type the function, run the sketch, then type the test call into the p5 editor's console.
- drawShape takes one object with named fields: { shape, color, x, y }. Stress it: the model will hand us exactly this object later.
- Call it again without x and y: the defaults put the shape in the center.
- y grows downward. rectMode(CENTER) in setup() makes squares position like circles.
- There is no background() in draw(), so shapes stay on the canvas. Checkpoint 2.

---

<p class="kicker">Step 3</p>

## A first brain: keywords

```js
if (transcript.includes("circle")) {
  drawShape({ shape: "circle", color: "red" });
}
```

- “Draw a **blue** circle”
- “**Don't** draw a circle”
- “Create a round thing”

Note:
- 19–22 min. Type the rule inside onresult, below console.log. Say "draw a circle": it works.
- Then try the three lines and let the room find the problems: the color is ignored, "don't" still draws, and "round thing" is missed.
- Rules work for a fixed vocabulary (the 1980 system used one), but every new phrasing needs a new rule.
- Next: a brain that understands meaning, not exact words.

---

<p class="kicker">Background</p>

## A language model continues text

<div class="chat"><span class="dim">&lt;|im_start|&gt;system</span>
You are a helpful agent.<span class="dim">&lt;|im_end|&gt;</span>
<span class="dim">&lt;|im_start|&gt;user</span>
draw a red circle<span class="dim">&lt;|im_end|&gt;</span>
<span class="dim">&lt;|im_start|&gt;assistant</span>
<mark>Sure</mark><mark>!</mark><mark> Here</mark><mark>'s</mark><mark> a</mark><mark> red</mark><mark> circle</mark><span class="dim">…</span></div>

The model keeps writing, one **token** at a time.

<p class="caption">Docs: <a href="https://qwen.readthedocs.io/en/latest/getting_started/concepts.html">Qwen · Key concepts</a></p>

Note:
- 22–24 min. A language model predicts the next piece of text, adds it, and repeats. Compare it to the suggestion bar on a phone keyboard.
- Each colored piece is one token: a word, part of a word, or punctuation.
- A chat is one long text in a special format. The library builds it from our messages list, and the model continues after "assistant".
- Running late? Say one sentence here and move on.

---

<p class="kicker">Step 3</p>

## Load the brain

```js [3-6]
async function loadBrain() {
  const { pipeline } = await import("https://.../transformers@4.3.0");
  llm = await pipeline("text-generation", "onnx-community/Qwen3-0.6B-ONNX", {
    device: "webgpu",
    dtype: "q4f16",
  });
  // ...
}
```

Note:
- 24–27 min. Copy loadBrain() from the handout; the highlighted lines are the part to read together: which model, on the GPU, 4-bit.
- Also from the handout: let llm; let status; at the top. In setup(), replace recognition.start() with status = createP(...) and loadBrain().
- recognition.start() now runs at the end of loadBrain(), so we only listen once the brain is ready.
- Press play now. The first download takes a while, and even from cache it takes close to a minute.

---

<p class="kicker">Background</p>

## Qwen3-0.6B, in your browser

<div class="stats">
<div><b>0.6 B</b><span>parameters</span></div>
<div><b>q4f16</b><span>quantization</span></div>
<div><b>≈ 0.5 GB</b><span>size</span></div>
</div>

Note:
- 27–34 min. Talk through this while the model downloads.
- 0.6 B: the model has 0.6 billion learned numbers (parameters). It is distilled: trained to imitate bigger Qwen3 models.
- q4f16: most numbers stored in 4 bits (quantization), so the download is about 0.5 GB. Transformers.js runs it on the laptop's GPU with WebGPU.
- Small means fast and private, but it makes more mistakes.
- Once loaded: type runCommand() from the handout and call it from onresult instead of the keyword rule. enable_thinking: false skips the model's "thinking" so it answers fast.
- Say "draw a red circle": the model replies with text like "Sure! Here's a red circle…" and nothing is drawn. Why? It can only write text. Checkpoint 3.
- Sources: https://huggingface.co/Qwen/Qwen3-0.6B · https://huggingface.co/docs/transformers.js/guides/dtypes

---

<p class="kicker">Step 4</p>

## Tool calling

<div class="cols">
<div>

```js [2-3]
function: {
  name: "create",
  description: "draw a shape",
  parameters: {
    properties: {
      shape: { enum: ["circle", "square"] },
      color: { type: "string" },
      x: { type: "number" },
      y: { type: "number" },
    },
  },
}
```

</div>
<div>

Describe a **function** the model can call.

</div>
</div>

Note:
- 34–38 min. This is a trimmed schema; the full one is in the handout. Copy it, then add tools, to the llm(...) call.
- Read it as a form the model fills in: a name, a description, and the same four fields as drawShape. shape is limited to circle or square.
- The schema describes the function. The model can't run anything.
- The library adds the tools list to the chat as text. When a request fits, the model replies with a tool_call instead of plain text.
- Source: https://qwen.readthedocs.io/en/latest/getting_started/concepts.html#tool-calling

---

<p class="kicker">Step 4</p>

## Run the tool call

<p class="label">The model writes</p>

```text
<tool_call>
{"name": "create", "arguments": {"shape": "circle", "color": "red"}}
</tool_call>
```

<p class="label">Our code runs</p>

```js [2]
const call = JSON.parse(text);
drawShape(call.arguments);
```

Note:
- 38–46 min. Say "draw a red circle" and show the console: the reply is now a tool_call, a function name and its inputs, as text.
- Our code turns that text back into an object with JSON.parse, the same object we typed by hand in Step 2, and calls drawShape with it.
- Copy the loop from the handout into runCommand(), after console.log(reply). Skip explaining the regex: it only finds the text between the tags.
- The model often skips x and y even though they're required. The schema is a request, not a guarantee, which is why drawShape has defaults.
- Say "draw a blue square". Then point at a corner and say "draw a red circle here": it lands somewhere else. Why? Checkpoint 4.

---

<p class="kicker">Step 5</p>

## Put “here” in the context

```js [3]
const messages = [
  { role: "system", content: "You control a 400 by 400 canvas." },
  { role: "user", content: `I am pointing at (${mouseX}, ${mouseY}), ` + text },
];
```

Note:
- 46–53 min. Ask first: what does the model know about the canvas? Nothing except the text we send.
- The system message gives the canvas size, so words like "top left" mean something.
- The highlighted line turns the pointer into a sentence. The model never sees the screen.
- mouseX is read when speech finishes, so hold still until the shape appears.
- Same words, two places, two results. This is the finished sketch: workshop/sketch.js.

---

<p class="kicker">If you'd like to keep going</p>

## What's next

<div class="ideas">
<div><b>Improve the draw tool</b><span>more shapes, sizes and styles in <code>drawShape()</code></span></div>
<div><b>Add more tools</b><span>such as <code>move</code>, <code>recolor</code> and <code>resize</code></span></div>
<div><b>Close the loop</b><span>let the model check the result before it finishes</span></div>
</div>

Note:
- 53–60 min. Make sure every pair has one working shape first; these are ideas to take home.
- Draw tool: a new shape needs both a new option in the schema and a branch in drawShape(). size works the same way.
- More tools: circle() leaves pixels, which can't be edited. To move or recolor "that", keep a list of shapes, redraw it in draw(), and describe it in the system message. extended/sketch.js shows one way.
- Loop: after drawing, send the result back to the model so it can check and fix it before it finishes.
- Thank everyone. Take one final question.
