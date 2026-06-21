import { Client } from "@gradio/client";

async function run() {
  const app = await Client.connect("tonyassi/voice-clone");
  const info = await app.view_api();
  console.log(JSON.stringify(info.named_endpoints, null, 2));
}

run();
