let wallet = null;
const ownerWallet = "2fLbFXCLGjpxVSbdxNhoXEgckNgs8aCrAeDpYXARfZ4c"; // Fee wallet

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

async function executeTrade(type) {
  const fromMint = document.getElementById("fromToken").value.trim();
  const toMint = document.getElementById("toToken").value.trim();
  const amount = parseFloat(document.getElementById("amount").value.trim());

  if (!wallet) return setStatus("❌ Connect your wallet first.");
  if (!fromMint || !toMint || isNaN(amount) || amount <= 0)
    return setStatus("❌ Invalid input.");

  setStatus(`⏳ Finding best route for ${amount}...`);

  try {
    const connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com");
    const jupiter = await Jupiter.init(connection, new solanaWeb3.PublicKey(wallet));

    const inputAmount = Math.floor(amount * 1_000_000); // assuming 6 decimals (USDC-style)

    const { routesInfos } = await jupiter.computeRoutes({
      inputMint: new solanaWeb3.PublicKey(fromMint),
      outputMint: new solanaWeb3.PublicKey(toMint),
      amount: inputAmount,
      slippage: 1,
      forceFetch: true,
    });

    const bestRoute = routesInfos[0];
    if (!bestRoute) return setStatus("❌ No route found.");

    setStatus("⚙️ Executing swap...");

    const { transactions } = await jupiter.exchange({ routeInfo: bestRoute });
    const signedTx = await window.solana.signTransaction(transactions[0].transaction);
    const txid = await connection.sendRawTransaction(signedTx.serialize());
    await connection.confirmTransaction(txid, "processed");

    setStatus(`✅ Swap done! [View Tx](https://solscan.io/tx/${txid})`);

    // Optional: tip or fee transfer to ownerWallet
    // You can implement a transfer of % of amount if needed here.
  } catch (error) {
    console.error(error);
    setStatus("❌ Swap failed.");
  }
}
