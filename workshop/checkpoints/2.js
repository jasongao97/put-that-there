// Step 2 · Output: a function that draws.
// Test it in the p5 console: drawShape({ shape: "square", color: "blue", x: 100, y: 100 })
const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.continuous = true;

recognition.onresult = ({ results, resultIndex }) => {
  const transcript = results[resultIndex][0].transcript;
  console.log(transcript);
};

function setup() {
  createCanvas(400, 400);
  background(0);
  rectMode(CENTER);
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
