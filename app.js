let provider = null;
let connectedWallet = null;

window.onload = () => {
  const connectBtn = document.getElementById("connectWallet");
  const walletAddressText = document.getElementById("walletAddress");

  connectBtn.addEventListener("click", async () => {
    if ("solana" in window) {
      provider = window.solana;
      if (provider.isPhantom) {
        try {
          const resp = await provider.connect();
          connectedWallet = resp.publicKey.toString();
          walletAddressText.innerText = `🟢 Connected: ${connectedWallet}`;
          connectBtn.disabled = true;
        } catch (err) {
          walletAddressText.innerText = "❌ Connection rejected";
        }
      }
    } else {
      alert("Phantom Wallet not found. Please install it first.");
      window.open("https://phantom.app", "_blank");
    }
  });
};
