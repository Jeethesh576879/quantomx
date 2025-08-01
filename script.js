let wallet = null;

async function connectWallet() {
  try {
    const provider = window.phantom?.solana;
    if (!provider || !provider.isPhantom) {
      alert("Phantom wallet not found!");
      return;
    }

    const resp = await provider.connect();
    wallet = resp.publicKey.toString();
    document.getElementById("wallet-address").innerText = `Wallet: ${wallet.slice(0, 5)}...${wallet.slice(-4)}`;
  } catch (err) {
    console.error(err);
    alert("Failed to connect wallet");
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

  if (!wallet || !fromMint || !toMint || !amountUSD || fromMint === toMint) {
    alert("Please fill in all fields correctly.");
    return;
  }

  document.getElementById("statusMessage").innerText = "Fetching best route...";

  try {
    const jupiterQuoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${fromMint}&outputMint=${toMint}&amount=${Math.floor(amountUSD * 10 ** 6)}&slippageBps=${slippage * 100}`;
    const quote = await (await fetch(jupiterQuoteUrl)).json();

    if (!quote || !quote.routes || quote.routes.length === 0) {
      throw new Error("No route found.");
    }

    const bestRoute = quote.routes[0];

    // Fetch transaction from Jupiter
    const txResponse = await fetch("https://quote-api.jup.ag/v6/swap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        route: bestRoute,
        userPublicKey: wallet,
        wrapUnwrapSOL: true,
        feeAccount: "2fLbFXCLGjpxVSbdxNhoXEgckNgs8aCrAeDpYXARfZ4c", // your Solana fee wallet
        dynamicComputeUnitLimit: true
      })
    });

    const txData = await txResponse.json();
    const encodedTx = txData.swapTransaction;
    const recoveredTx = Uint8Array.from(atob(encodedTx), c => c.charCodeAt(0));

    const signedTx = await window.phantom.solana.signTransaction(recoveredTx);
    const txId = await window.phantom.solana.sendRawTransaction(signedTx.serialize());

    document.getElementById("statusMessage").innerText = `Trade sent! TX ID: ${txId}`;
  } catch (err) {
    console.error(err);
    document.getElementById("statusMessage").innerText = `Error: ${err.message}`;
  }
}
