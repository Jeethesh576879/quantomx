const FEE_WALLET = "2fLbFXCLGjpxVSbdxNhoXEgckNgs8aCrAeDpYXARfZ4c";

async function executeTrade(side) {
  const provider = window?.phantom?.solana;
  if (!provider?.isPhantom) return alert("Connect Phantom wallet first.");

  const fromToken = document.getElementById("fromToken").value;
  const toToken = document.getElementById("toToken").value;
  const amount = parseFloat(document.getElementById("amount").value);

  if (!fromToken || !toToken || !amount) {
    return alert("Please enter token and amount.");
  }

  const fee = amount * 0.02;
  const netAmount = amount - fee;

  alert(
    `Swapping $${netAmount.toFixed(2)} worth of ${side === "buy" ? toToken : fromToken}. 2% fee sent to dev wallet.`
  );

  // Placeholder logic for real Jupiter swap
  // You can connect Jupiter Swap SDK here
  console.log(`Pretending to ${side} ${netAmount} from ${fromToken} to ${toToken}`);
  console.log(`Sending fee: $${fee.toFixed(2)} to ${FEE_WALLET}`);
}
