// Finished workshop sketch (after Step 5): point and speak; the model calls create, and we run drawShape.
let llm;
let status;

const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.continuous = true;

recognition.onresult = ({ results, resultIndex }) => {
  const transcript = results[resultIndex][0].transcript;
  console.log(transcript);
  act(transcript);
};

function setup() {
  createCanvas(400, 400);
  background(0);
  rectMode(CENTER);
  status = createP("Loading model...");
  loadModels();
}

async function loadModels() {
  const { pipeline } = await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0");
  llm = await pipeline("text-generation", "onnx-community/Qwen3-0.6B-ONNX", {
    device: "webgpu",
    dtype: "q4f16",
    progress_callback: (p) => {
      if (p.status === "progress") status.html(`Loading ${p.file} ${round(p.progress)}%`);
    },
  });
  status.html("Model loaded. Start talking!");
  recognition.start();
}

function drawShape({ shape, color, x = width / 2, y = height / 2 }) {
  fill(color);
  if (shape === "circle") {
    circle(x, y, 50);
  } else if (shape === "square") {
    square(x, y, 50);
  }
}

const tools = [
  {
    type: "function",
    function: {
      name: "create",
      description: "draw a shape",
      parameters: {
        type: "object",
        properties: {
          shape: {
            type: "string",
            enum: ["circle", "square"],
          },
          color: {
            type: "string",
            description: "color name, e.g. red, blue, green",
          },
          x: {
            type: "number",
            description: "in pixels, 0 is left",
          },
          y: {
            type: "number",
            description: "in pixels, 0 is top",
          },
        },
        required: ["shape", "color", "x", "y"],
      },
    },
  },
];

async function act(prompt) {
  const messages = [
    { role: "system", content: "You control a 400 by 400 canvas." },
    { role: "user", content: `I am pointing at (${mouseX}, ${mouseY}), ` + prompt },
  ];

  const response = await llm(messages, {
    tools,
    tokenizer_encode_kwargs: { enable_thinking: false },
  });
  const reply = response[0].generated_text.at(-1).content;
  console.log(reply);

  const matches = reply.matchAll(/<tool_call>(.*?)<\/tool_call>/gs);
  for (const match of matches) {
    const call = JSON.parse(match[1]);
    console.log(call);
    drawShape(call.arguments);
  }
}
