import fetch from "node-fetch";

// Replace with your address
const myAddress = "0xb3ceebf62430e7dec15f91d490db8b9e30384cb1"; // please dev, gift me monad :D

async function getBalance() {
  const response = await fetch("http://localhost:3000/balance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: myAddress }),
  });
  const data = await response.json();
  console.log("💰 Balance:", data);
}

async function getBlockNumber() {
  const response = await fetch("http://localhost:3000/block");
  const data = await response.json();
  console.log("📦 Latest Block:", data);
}

async function main() {
  await getBalance();
  await getBlockNumber();
}

main().catch(console.error);
