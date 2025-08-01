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

    // Calculate fee (0.3%)
    const feePercentage = 0.003;
    const feeAmount = amount * feePercentage;
    const adjustedAmount = Math.floor((amount - feeAmount) * 1_000_000); // amount in base units

    // Send fee
    const feeTx = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: new solanaWeb3.PublicKey(wallet),
        toPubkey: new solanaWeb3.PublicKey(ownerWallet),
        lamports: Math.floor(feeAmount * solanaWeb3.LAMPORTS_PER_SOL),
      })
    );
    feeTx.feePayer = new solanaWeb3.PublicKey(wallet);
    feeTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    const signedFeeTx = await window.solana.signTransaction(feeTx);
    await connection.sendRawTransaction(signedFeeTx.serialize());

    // Swap route
    const { routesInfos } = await jupiter.computeRoutes({
      inputMint: new solanaWeb3.PublicKey(fromMint),
      outputMint: new solanaWeb3.PublicKey(toMint),
      amount: adjustedAmount,
      slippage: 1,
      forceFetch: true,
    });

    const bestRoute = routesInfos?.[0];
    if (!bestRoute) return setStatus("❌ No route found.");

    setStatus("⚙️ Executing swap...");

    const { transactions } = await jupiter.exchange({ routeInfo: bestRoute });
    const signedTx = await window.solana.signTransaction(transactions[0].transaction);
    const txid = await connection.sendRawTransaction(signedTx.serialize());
    await connection.confirmTransaction(txid, "processed");

    setStatus(`✅ Swap done! [View Tx](https://solscan.io/tx/${txid})`);
  } catch (error) {
    console.error(error);
    setStatus("❌ Swap failed.");
  }
}
