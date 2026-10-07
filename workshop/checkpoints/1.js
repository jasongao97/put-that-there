// Step 1 · Input: speech recognition prints what you say.
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
