import { Client, handle_file } from "@gradio/client";
import fs from "fs";
import path from "path";

async function run() {
  try {
    const client = await Client.connect("myshell-ai/OpenVoiceV2");
    const info = await client.view_api();
    console.log("API:", JSON.stringify(Object.keys(info), null, 2));
    console.log("Named Endpoints:", JSON.stringify(info.named_endpoints, null, 2));
  } catch (error) {
    console.error("ERROR:", error.message);
  }
}

run();
