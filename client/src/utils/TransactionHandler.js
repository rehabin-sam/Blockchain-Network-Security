import { toast } from "react-toastify";

export const sendTransactionHandler = async (
  contractMethod,
  account,
  setStatus
) => {
  try {
    if (!contractMethod || !account) {
      toast.error("Wallet or contract not connected");
      return null;
    }

    setStatus("Waiting for wallet...");
    toast.info("Confirm transaction in MetaMask");

    const receipt = await contractMethod.send({ from: account });

    setStatus("Success ✅");
    toast.success("Transaction successful!");

    return receipt;

  } catch (error) {
    console.error(error);

    // User rejected
    if (error.code === 4001) {
      setStatus("Rejected ❌");
      toast.warn("Transaction rejected by user");
    }
    // Insufficient funds
    else if (error.message?.includes("insufficient funds")) {
      setStatus("Failed ❌");
      toast.error("Insufficient funds");
    }
    // Generic error
    else {
      setStatus("Error ❌");
      toast.error("Transaction failed");
    }

    return null;
  }
};