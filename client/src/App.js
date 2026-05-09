import React, { useEffect, useState } from "react";
import Web3 from "web3";
import AccessControl from "./contracts/AccessControl.json";
import Dashboard from "./Dashboard";

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const init = async () => {
      console.log("INIT STARTED");

      if (!window.ethereum) {
        console.log("MetaMask NOT found");
        alert("Install MetaMask");
        return;
      }

      try {
        console.log("Requesting accounts...");

        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        console.log("Accounts received:", accounts);

        const web3 = new Web3(window.ethereum);

        const contractAddress =
          "0xb29396f086bb240BA75D1Ba3BC043fB5311A70ec";

        const instance = new web3.eth.Contract(
          AccessControl.abi,
          contractAddress
        );

        console.log("Contract created:", instance);

        setAccount(accounts[0]);
        setContract(instance);
      } catch (err) {
        console.error("INIT ERROR:", err);
      }
    };

    init();
  }, []);

  console.log("App render", { account, contract });

  if (!account || !contract) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  return <Dashboard contract={contract} account={account} />;
}

export default App;
