// Web3.js
import getWeb3 from "./getWeb3";

/**
 * sendTransaction
 * Handles sending Ethereum transactions via Metamask/Ganache
 * @param {Object} txParams - transaction parameters (to, value, data, etc.)
 * @param {Function} onStatusUpdate - optional callback to update UI status
 * @returns {Object|null} receipt - transaction receipt if successful, else null
 */
const sendTransaction = async (txParams, onStatusUpdate) => {
  try {
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();

    if (!accounts || accounts.length === 0) {
      const msg = "No account found. Please connect Metamask.";
      console.warn(msg);
      if (onStatusUpdate) onStatusUpdate(msg);
      return null;
    }

    if (onStatusUpdate) onStatusUpdate("Sending transaction...");

    const receipt = await web3.eth.sendTransaction({
      from: accounts[0],
      ...txParams,
    });

    console.log("✅ Transaction successful:", receipt);
    if (onStatusUpdate) onStatusUpdate("Transaction successful!");
    return receipt;

  } catch (error) {
    if (error.code === 4001) {
      console.warn("Transaction cancelled by user.");
      if (onStatusUpdate) onStatusUpdate("Transaction cancelled by user.");
      alert("Transaction cancelled by user.");
    } else if (error.message.includes("insufficient funds")) {
      console.error("Transaction failed: Insufficient funds.");
      if (onStatusUpdate) onStatusUpdate("Transaction failed: Insufficient funds.");
      alert("Transaction failed: Insufficient funds.");
    } else {
      console.error("Transaction failed:", error);
      if (onStatusUpdate) onStatusUpdate("Transaction failed. Check console for details.");
      alert("Transaction failed. See console for details.");
    }
    return null;
  }
};

export default sendTransaction;