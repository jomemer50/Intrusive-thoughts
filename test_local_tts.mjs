async function run() {
  try {
    const response = await fetch('http://localhost:3000/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: "Hello there, testing fish audio." }),
    });
    console.log("Status:", response.status);
    if (!response.ok) {
      console.log("Error text:", await response.text());
    } else {
      console.log("Success! Received audio bytes.");
    }
  } catch (e) {
    console.error("Fetch error:", e.message);
  }
}
run();
