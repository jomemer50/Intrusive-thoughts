let unprocessed = "Hello there.\nI am an AI.";
let match = unprocessed.match(/(.*?[.!?]+[\s\n]+)(.*)/);
console.log("Match normal:", match ? match[1] : "null");

let matchS = unprocessed.match(/(.*?[.!?]+[\s\n]+)(.*)/s);
console.log("Match S flag:", matchS ? matchS[1] : "null");
