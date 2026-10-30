// Point and speak. SpeechRecognition turns speech into text; Qwen3 calls a tool; p5 draws the scene.
let scene = []; // shapes on the canvas: { id, shape, color, size, x, y }
let nextId = 1;
let llm;

// Built into Chrome. `continuous` keeps it listening after each sentence.
const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.continuous = true;

recognition.onresult = ({ results, resultIndex }) => {
  const transcript = results[resultIndex][0].transcript;
  runCommand(transcript);
};

// The tools the model may call, described as JSON Schema.
// Workshop TODO: add a tool (clear, duplicate…) here AND its code in `actions` below.
const tools = [
  {
    type: "function",
    function: {
      name: "create",
      description:
        "Draw a new shape on the canvas. Never use it to change an existing shape.",
      parameters: {
        type: "object",
        properties: {
          shape: { type: "string", enum: ["circle", "square", "triangle"] },
          color: {
            type: "string",
            description: "CSS color name, e.g. red, skyblue, gold.",
          },
          size: {
            type: "number",
            description: "Width in pixels, 20 to 200. Default 80.",
          },
          x: {
            type: "number",
            description: "Center x in pixels, 0 is the left edge.",
          },
          y: {
            type: "number",
            description: "Center y in pixels, 0 is the top edge.",
          },
        },
        // Required, or the model often leaves out x or y for "here".
        required: ["shape", "color", "x", "y"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "move",
      description: "Move an existing shape.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "number", description: "Shape id, e.g. 2 for #2." },
          x: { type: "number", description: "New center x in pixels." },
          y: { type: "number", description: "New center y in pixels." },
        },
        required: ["id", "x", "y"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "recolor",
      description: "Change the color of an existing shape.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "number", description: "Shape id, e.g. 2 for #2." },
          color: { type: "string", description: "CSS color name." },
        },
        required: ["id", "color"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "resize",
      description: "Change the size of an existing shape.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "number", description: "Shape id, e.g. 2 for #2." },
          size: {
            type: "number",
            description: "New width in pixels, 20 to 200.",
          },
        },
        required: ["id", "size"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete",
      description: "Remove an existing shape.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "number", description: "Shape id, e.g. 2 for #2." },
        },
        required: ["id"],
      },
    },
  },
];

// What each tool actually does to the scene.
const actions = {
  create({ shape, color, x, y, size = 80 }) {
    scene.push({ id: nextId++, shape, color, size, x, y });
  },
  move({ id, x, y }) {
    Object.assign(byId(id), { x, y });
  },
  recolor({ id, color }) {
    byId(id).color = color;
  },
  resize({ id, size }) {
    byId(id).size = size;
  },
  delete({ id }) {
    scene = scene.filter((s) => s !== byId(id));
  },
};

// The model sometimes writes ids as strings ("1"), so compare as numbers.
function byId(id) {
  return scene.find((s) => s.id === Number(id));
}

function setup() {
  createCanvas(720, 360).parent("canvas");
  rectMode(CENTER);
  select("#start").mousePressed(loadBrain);
}

function draw() {
  background(245);
  for (const item of scene) {
    drawShape(item);
  }
}

function drawShape({ shape, color, size, x, y }) {
  fill(color);
  if (shape === "circle") {
    circle(x, y, size);
  } else if (shape === "square") {
    square(x, y, size);
  } else {
    const r = size / 2;
    triangle(x, y - r, x - r, y + r, x + r, y + r);
  }
}

function setStatus(text) {
  select("#status").html(text);
}

function setAnswer(text) {
  select("#answer").elt.textContent = text;
}

async function loadBrain() {
  select("#start").attribute("disabled", "");
  const { pipeline } =
    await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0");
  const progress_callback = (p) => {
    if (p.status === "progress")
      setStatus(`Downloading ${p.file}… ${round(p.progress)}%`);
  };
  llm = await pipeline("text-generation", "onnx-community/Qwen3-0.6B-ONNX", {
    device: "webgpu",
    dtype: "q4f16",
    progress_callback,
  });
  setStatus('Model loaded. Point and say something like "draw a red square here".');
  recognition.start();
}

// Text + scene + mouse position in, tool calls out. Try it without the mic: runCommand('draw a blue triangle here')
async function runCommand(text) {
  setStatus("Thinking…");
  // The model can only edit shapes it can see, so list them with their ids.
  // They go in the system message: in the user message the model re-creates them.
  const list = scene
    .map(
      (s) =>
        `#${s.id} ${s.color} ${s.shape} size ${s.size} at (${round(s.x)}, ${round(s.y)})`,
    )
    .join("\n");
  // The topmost shape under the mouse is what "that" or "it" points at.
  const hit = scene.findLast(
    (s) => dist(mouseX, mouseY, s.x, s.y) < s.size / 2,
  );
  const pointing = hit ? `, pointing at #${hit.id}` : "";
  const messages = [
    {
      role: "system",
      content: `You draw shapes on a ${width}x${height} canvas. Shapes already on it:\n${list || "(none)"}`,
    },
    {
      role: "user",
      content: `Mouse at (${round(mouseX)}, ${round(mouseY)})${pointing}. ${text}`,
    },
  ];
  const response = await llm(messages, {
    tools,
    max_new_tokens: 200,
    do_sample: false,
    tokenizer_encode_kwargs: { enable_thinking: false },
  });
  const reply = response[0].generated_text.at(-1).content;
  setAnswer(`${text}\n${reply}`);

  // Qwen3 wraps each call as <tool_call>{"name": ..., "arguments": {...}}</tool_call>
  const matches = reply.matchAll(/<tool_call>(.*?)<\/tool_call>/gs);
  for (const match of matches) {
    const call = JSON.parse(match[1]);
    actions[call.name](call.arguments);
  }
  setStatus("Listening…");
}
