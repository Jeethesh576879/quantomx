let walletAddress = null;

// Connect Phantom wallet
async function connectWallet() {
  if (!window.solana || !window.solana.isPhantom) {
    alert("Phantom Wallet not found. Install it first.");
    return;
  }

  try {
    const resp = await window.solana.connect();
    walletAddress = resp.publicKey.toString();
    document.getElementById("wallet-address").innerText = `Wallet: ${walletAddress}`;
  } catch (err) {
    console.error("Wallet connection failed:", err);
  }
}

// Accept terms and show trading UI
function acceptTerms() {
  document.getElementById("terms").style.display = "none";
  document.getElementById("main-container").style.display = "block";
}

// Execute basic swap (placeholder until Jupiter API added)
async function executeTrade(type) {
  const fromMint = document.getElementById("fromToken").value.trim();
  const toMint = document.getElementById("toToken").value.trim();
  const amountUSD = parseFloat(document.getElementById("amount").value.trim());
  const slippage = parseFloat(document.getElementById("slippage").value.trim());
  const feePercent = parseFloat(document.getElementById("fee").value.trim());
  const tipPercent = parseFloat(document.getElementById("tip").value.trim());

  const statusMsg = document.getElementById("statusMessage");

  if (!walletAddress || !fromMint || !toMint || !amountUSD || isNaN(slippage)) {
    statusMsg.innerText = "❌ Fill all fields correctly.";
    return;
  }

  statusMsg.innerText = "⏳ Building transaction...";

  try {
    // Placeholder - Jupiter integration will come later
    await new Promise((r) => setTimeout(r, 2000)); // simulate delay

    // Calculate and show fee + tip collected
    const totalFee = (amountUSD * (feePercent + tipPercent)) / 100;
    statusMsg.innerText = `✅ ${type.toUpperCase()} success! Fee collected: $${totalFee.toFixed(2)}`;
  } catch (err) {
    console.error("Transaction error:", err);
    statusMsg.innerText = "❌ Trade failed.";
  }
}
