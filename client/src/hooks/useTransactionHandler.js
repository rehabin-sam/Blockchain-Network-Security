import { useEffect, useRef, useState } from "react";

const getEventKey = (event) =>
  `${event.transactionHash}-${event.logIndex ?? event.transactionIndex ?? 0}`;

export default function useTransactionHandler(contract) {
  const [transactions, setTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const seenDeniedEvents = useRef(new Set());

  useEffect(() => {
    if (!contract) return undefined;

    let active = true;

    const loadPastEvents = async () => {
      try {
        const [granted, denied] = await Promise.all([
          contract.getPastEvents("AccessGranted", {
            fromBlock: 0,
            toBlock: "latest",
          }),
          contract.getPastEvents("AccessDenied", {
            fromBlock: 0,
            toBlock: "latest",
          }),
        ]);

        if (!active) return;

        const history = [
          ...granted.map((event) => ({
            id: event.transactionHash,
            eventKey: getEventKey(event),
            user: event.returnValues.user,
            status: "success",
            gas: Math.floor(Math.random() * 50000),
            blockNumber: Number(event.blockNumber || 0),
          })),
          ...denied.map((event) => ({
            id: event.transactionHash,
            eventKey: getEventKey(event),
            user: event.returnValues.user,
            status: "failed",
            gas: Math.floor(Math.random() * 50000),
            blockNumber: Number(event.blockNumber || 0),
          })),
        ].sort((a, b) => b.blockNumber - a.blockNumber);

        const freshDenied = denied.filter(
          (event) => !seenDeniedEvents.current.has(getEventKey(event))
        );

        setTransactions(history);

        if (freshDenied.length) {
          setAlerts((prev) => [
            ...freshDenied.map((event) => ({
              msg: `Unauthorized access by ${event.returnValues.user}`,
              level: "high",
            })),
            ...prev,
          ]);
        }

        seenDeniedEvents.current = new Set(denied.map(getEventKey));
      } catch (err) {
        console.error("Failed to load contract events:", err);
      }
    };

    loadPastEvents();
    const intervalId = window.setInterval(loadPastEvents, 4000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [contract]);

  return { transactions, alerts };
}
