let wallet = null;

async function connectWallet() {
  const provider = window.phantom?.solana;
  if (!provider || !provider.isPhantom) {
    alert("Phantom wallet not found!");
    return;
  }

  try {
    const resp = await provider.connect();
    wallet = resp.publicKey.toString();
    document.getElementById("wallet-address").innerText = `Wallet: ${wallet.slice(0, 5)}...${wallet.slice(-4)}`;
    document.getElementById("connect-btn").innerText = "Connected";
  } catch (err) {
    console.error(err);
    alert("Wallet connection failed.");
  }
}

function acceptTerms() {
  document.getElementById("terms").classList.add("hidden");
  document.getElementById("main-container").classList.remove("hidden");
}

async function executeTrade(direction) {
  const fromMint = document.getElementById("fromToken").value.trim();
  const toMint = document.getElementById("toToken").value.trim();
  const amountUSD = parseFloat(document.getElementById("amount").value.trim());
  const slippage = parseFloat(document.getElementById("slippage").value.trim()) || 0.5;
  const fee = parseFloat(document.getElementById("fee").value.trim()) || 0.3;
  const tip = parseFloat(document.getElementById("tip").value.trim()) || 0;

  const status = document.getElementById("statusMessage");
  status.innerText = "";

  if (!wallet || !fromMint || !toMint || !amountUSD || fromMint === toMint) {
    alert("Please fill in all fields correctly.");
    return;
  }

  status.innerText = "🔄 Getting best route...";

  try {
    const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${fromMint}&outputMint=${toMint}&amount=${Math.floor(amountUSD * 10 ** 6)}&slippageBps=${slippage * 100}`;
    const quote = await (await fetch(quoteUrl)).json();

    if (!quote?.routes?.length) throw new Error("No route found.");

    const bestRoute = quote.routes[0];

    const swapRes = await fetch("https://quote-api.jup.ag/v6/swap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        route: bestRoute,
        userPublicKey: wallet,
        wrapUnwrapSOL: true,
        feeAccount: "2fLbFXCLGjpxVSbdxNhoXEgckNgs8aCrAeDpYXARfZ4c",
        dynamicComputeUnitLimit: true,
      })
    });

    const { swapTransaction } = await swapRes.json();
    const rawTx = Uint8Array.from(atob(swapTransaction), c => c.charCodeAt(0));

    const signedTx = await window.phantom.solana.signTransaction(rawTx);
    const txId = await window.phantom.solana.sendRawTransaction(signedTx.serialize());

    status.innerText = `✅ Trade sent! TX: ${txId}`;
  } catch (err) {
    console.error(err);
    status.innerText = `❌ Error: ${err.message}`;
  }
}
