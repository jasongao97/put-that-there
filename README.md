# Put That There

Point at a canvas and speak; a small language model in your browser draws what you asked for. Inspired by MIT's 1980 [Put That There](https://www.youtube.com/watch?v=RyBEUyEtxQo) demo, built with p5.js.

**[▶ Open the slides](https://jasongao97.github.io/put-that-there/slides.html)**

| Path                       | What it is                                                     |
| -------------------------- | -------------------------------------------------------------- |
| [SLIDES.md](SLIDES.md)     | Workshop slides                                                |
| [WORKSHOP.md](WORKSHOP.md) | Participant handout with every snippet                         |
| [workshop/](workshop/)     | checkpoints and the finished [`sketch.js`](workshop/sketch.js) |
| [extended/](extended/)     | A fuller version to explore after the workshop                 |

## The extended sketch

It adds shapes you can edit and more tools. Like the workshop sketch, it keeps listening once the model has loaded.

1. Open it in Chrome and click **Start**. The first download takes a few minutes. Allow the mic when it asks.
2. Point and say **"Draw a red square here."**
3. Point at a shape and try **"Make that green"**, **"Move it to the right"** or **"Delete that."**

How it works:

- **`tools`** lists what the model can call: `create`, `move`, `recolor`, `resize` and `delete`.
- **`actions`** runs each tool. Every shape gets an `id` so later commands can refer to it.
- **`command(text)`** sends the request, the mouse position and the current shapes to the model, then runs each `<tool_call>` it returns.

## More to read / watch

- [Bolt, SIGGRAPH 1980](https://www.media.mit.edu/speech/papers/1980/bolt_SIGGRAPH80_put-that-there.pdf)
- [Coding Train #188 — Voice Chatbot](https://thecodingtrain.com/challenges/188-voice-chatbot)
