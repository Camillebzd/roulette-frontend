"use client"

import styles from "./page.module.css";
import { useActiveAccount } from "thirdweb/react";
import { Wheel } from 'react-custom-roulette';
import { useEffect, useState } from "react";
import { Button, Text } from "@chakra-ui/react";
import { createRoulette, spin } from "@/utils/roulette";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
const RPC_PROVIDER = process.env.NEXT_PUBLIC_RPC_PROVIDER || "https://node.ghostnet.etherlink.com";

const ROULETTE_OPTIONS = [
  { option: 'USDC', style: { backgroundColor: '#2588e6' } },
  { option: 'WETH', style: { backgroundColor: '#6f25e6' } },
  { option: 'USDC', style: { backgroundColor: '#2588e6' } },
  { option: 'LOST', style: { backgroundColor: '#a1a1a1' } },
  { option: 'USDC', style: { backgroundColor: '#2588e6' } },
  { option: 'WETH', style: { backgroundColor: '#6f25e6' } },
  { option: 'USDC', style: { backgroundColor: '#2588e6' } },
  { option: 'WETH', style: { backgroundColor: '#6f25e6' } },
  { option: 'USDC', style: { backgroundColor: '#2588e6' } },
  { option: 'WETH', style: { backgroundColor: '#6f25e6' } },
  { option: 'X2 XTZ', style: { backgroundColor: '#FFD700' } },
];

export default function Home() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sequenceNumber, setSequenceNumber] = useState(0);
  const acc = useActiveAccount();

  useEffect(() => {
    if (!acc || sequenceNumber === 0) return;

    const provider = new ethers.JsonRpcProvider(RPC_PROVIDER);
    const roulette = createRoulette(acc);

    if (!roulette) {
      console.log("Failed to create roulette contract.")
      return;
    }

    let intervalId: NodeJS.Timeout | null = null;

    const startPolling = () => {
      intervalId = setInterval(async () => {
        const currentBlock = await provider.getBlockNumber();
        console.log("currentBlock", currentBlock);
        // Listen to Swap, Lost, and DoubleWin events
        const filter = {
          address: CONTRACT_ADDRESS,
          fromBlock: currentBlock - 900,
          toBlock: 'latest',
          topics: [
            [
              ethers.id("Swap(address,uint64,uint256,address,uint256)"),
              ethers.id("Lost(address,uint64,uint256)"),
              ethers.id("DoubleWin(address,uint64,uint256,uint256)")
            ],
            "0x000000000000000000000000" + acc?.address.slice(2)  // User address
          ]
        };

        try {
          const logs = await provider.getLogs(filter);
          console.log("Logs:", logs);

          for (let log of logs) {
            const parsedLog = roulette.interface.parseLog(log);
            if (!parsedLog) {
              console.log("NULL log:", log);
              continue;
            }
            const { sequenceNumber: logSequence, finalNumber } = parsedLog.args;
            if (logSequence === sequenceNumber) {
              console.log("Analyse:");
              console.log("logSequence:", logSequence);
              console.log("finalNumber:", finalNumber);
              console.log("log name:", parsedLog.name);
  
              setSequenceNumber(0);
              clearInterval(intervalId!);  // Stop polling once event is found

              let prizeIndex = 0;

              if (parsedLog.name === 'Lost') {
                prizeIndex = ROULETTE_OPTIONS.findIndex(option => option.option === 'LOST');
              } else if (parsedLog.name === 'DoubleWin') {
                prizeIndex = ROULETTE_OPTIONS.findIndex(option => option.option === 'X2 XTZ');
              } else if (parsedLog.name === 'Swap') {
                prizeIndex = Number(finalNumber) <= 50
                  ? ROULETTE_OPTIONS.findIndex(option => option.option === 'USDC')
                  : ROULETTE_OPTIONS.findIndex(option => option.option === 'WETH');
              }

              setPrizeNumber(prizeIndex);
              setMustSpin(true);
              break;
            }
          }
        } catch (error) {
          console.error("Error fetching logs:", error);
        }
      }, 1000);  // Poll every second for responsiveness
    };

    startPolling();

    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [acc, sequenceNumber]);

  const handleSpinClick = async () => {
    const result = await spin(acc, setIsLoading); // sequence number from the spin
    if (result == undefined) {
      // print error message
      return;
    }
    setSequenceNumber(result);
  };
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.h1}>Spin the roulette!</h1>
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={ROULETTE_OPTIONS}
          onStopSpinning={() => {
            setMustSpin(false);
            setIsLoading(false);
          }}
        />
        <div>
          {acc ? <Button isDisabled={sequenceNumber != 0} isLoading={isLoading} onClick={handleSpinClick}>SPIN 1 XTZ</Button> : <Text>Connect to spin</Text>}
        </div>
      </main>
      {/* <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer> */}
    </div>
  );
}
