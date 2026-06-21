import { Client, handle_file } from "@gradio/client";
import fs from "fs";
import path from "path";

async function run() {
  try {
    const client = await Client.connect("tonyassi/voice-clone");
    const referenceAudioPath = path.join(process.cwd(), "public", "voice_sample.wav");
    if (!fs.existsSync(referenceAudioPath)) {
       console.error("Missing audio file!");
       return;
    }
    console.log("Sending to XTTS...");
    const result = await client.predict("/clone", [
      "Hello, testing.", 
      handle_file(referenceAudioPath), 
    ]);
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("ERROR:", error.message);
  }
}

run();
