import fs from 'fs';

async function run() {
  const envText = fs.readFileSync('.env.local', 'utf-8');
  const apiKeyLine = envText.split('\n').find(l => l.startsWith('FISH_AUDIO_API_KEY='));
  const apiKey = apiKeyLine ? apiKeyLine.split('=')[1].replace(/"/g, '') : null;

  if (!apiKey) {
    console.error("No API key found");
    return;
  }

  try {
    // Test 1: Basic TTS without reference_id
    const response = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: "Hello, this is a basic test.",
        format: "mp3",
      }),
    });
    
    console.log("Basic TTS Status:", response.status);
    if (!response.ok) {
      console.log("Basic TTS Error:", await response.text());
    } else {
      console.log("Basic TTS Success!");
    }
  } catch (e) {
    console.error("Fetch error:", e.message);
  }
}
run();
