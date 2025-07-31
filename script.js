let wallet = null;

async function connectWallet() {
  try {
    const provider = window.phantom?.solana;
    if (!provider?.isPhantom) {
      alert("Phantom Wallet not found!");
      return;
    }

    const res = await provider.connect();
    wallet = res.publicKey.toString();
    document.getElementById("wallet-address").textContent = `Wallet: ${wallet}`;
    setStatus("✅ Wallet connected.");
  } catch (err) {
    setStatus("❌ Wallet connection failed.");
    console.error(err);
  }
}

function acceptTerms() {
  document.getElementById("terms").style.display = "none";
}

function setStatus(msg) {
  document.getElementById("statusMessage").textContent = msg;
}

function executeTrade(type) {
  const from = document.getElementById("fromToken").value.trim();
  const to = document.getElementById("toToken").value.trim();
  const amount = parseFloat(document.getElementById("amount").value.trim());

  if (!wallet) return setStatus("❌ Connect wallet first.");
  if (!from || !to || !amount || amount <= 0) return setStatus("❌ Fill in all fields correctly.");

  setStatus(`⏳ ${type.toUpperCase()} ${amount}$ from ${from} to ${to}...`);

  // This will be replaced with real Jupiter swap code
  setTimeout(() => {
    setStatus(`✅ ${type.toUpperCase()} completed successfully.`);
  }, 1500);
}
