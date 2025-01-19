const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(`Whats your name ? `, (name) => {
  console.log(`Hi ${name}!`);
  rl.close();
});
