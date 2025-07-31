let walletAddress = null;

async function connectWallet() {
  try {
    const provider = window?.phantom?.solana;
    if (!provider?.isPhantom) {
      alert("Phantom Wallet not found. Please install it.");
      return;
    }

    const resp = await provider.connect();
    walletAddress = resp.publicKey.toString();

    document.querySelector(".btn").innerText = "✔ " + walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4);
    alert("Wallet connected: " + walletAddress);
  } catch (err) {
    alert("Wallet connect failed.");
  }
}

function acceptTerms() {
  document.getElementById("terms").style.display = "none";
  document.getElementById("app").style.display = "block";
}
