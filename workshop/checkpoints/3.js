// Step 3 · Brain: keywords are replaced by a language model that replies in the console.
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

async function act(prompt) {
  const messages = [
    { role: "system", content: "You are a helpful agent." },
    { role: "user", content: prompt },
  ];

  const response = await llm(messages, {
    tokenizer_encode_kwargs: { enable_thinking: false },
  });
  const reply = response[0].generated_text.at(-1).content;
  console.log(reply);
}
