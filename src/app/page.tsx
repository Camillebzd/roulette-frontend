"use client"

import Image from "next/image";
import styles from "./page.module.css";
import { useActiveAccount } from "thirdweb/react";
import { Wheel } from 'react-custom-roulette';
import { useEffect, useRef, useState } from "react";
import { Box, Button, Text } from "@chakra-ui/react";
import { spin } from "@/utils/roulette";
import { ethers } from "ethers";

const ROULETTE_OPTIONS = [
  { option: 'USDC', style: { backgroundColor: '#2588e6' } },
  { option: 'WETH', style: { backgroundColor: '#6f25e6' } },
  { option: 'USDC', style: { backgroundColor: '#2588e6' } },
  { option: 'WETH', style: { backgroundColor: '#6f25e6' } },
  { option: 'USDC', style: { backgroundColor: '#2588e6' } },
  { option: 'WETH', style: { backgroundColor: '#6f25e6' } },
  { option: 'USDC', style: { backgroundColor: '#2588e6' } },
  { option: 'WETH', style: { backgroundColor: '#6f25e6' } },
  { option: 'USDC', style: { backgroundColor: '#2588e6' } },
  { option: 'WETH', style: { backgroundColor: '#6f25e6' } },
];

export default function Home() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  // let sequenceNumber = useRef(0);
  const [sequenceNumber, setSequenceNumber] = useState(0);
  const acc = useActiveAccount();

  useEffect(() => {
    // Check if there's a valid account or sequenceNumber
    if (!acc || sequenceNumber === 0) return;

    const provider = new ethers.JsonRpcProvider('https://node.ghostnet.etherlink.com'); // Replace with your HTTP provider URL
    let intervalId: NodeJS.Timeout | null = null; // Declare intervalId outside the interval function to use it in cleanup

    const startPolling = () => {
      // Set up the interval
      intervalId = setInterval(async () => {
        const currentBlock = await provider.getBlockNumber();

        // Set up the filter for the contract address and event topics
        const filter = {
          address: "0xcbC35A809dd7215eb6D0b4Ad6E5E4701Bb371f29", // Contract address
          fromBlock: currentBlock - 900,
          toBlock: currentBlock,
          topics: [
            "0xfac2ee0f215447f9da7602bda1129253ebf6332a264972931c6f9dd71c3c3c81", // Swap
            "0x000000000000000000000000" + acc?.address.slice(2) // User address
          ] // Event topics
        };

        try {
          const newLogs = await provider.getLogs(filter);  // Get logs matching the filter
          console.log(newLogs);

          for (let log of newLogs) {
            const data = ethers.AbiCoder.defaultAbiCoder().decode(
              ['uint64', 'int256', 'address', 'uint256'], // Types of the non-indexed parameters
              log.data
            );

            console.log("Number(data[1]):", Number(data[1]));
            console.log("sequenceNumber", sequenceNumber);

            if (data[0] === sequenceNumber) {
              setSequenceNumber(0); // Reset sequence number
              const number = Number(data[1]) <= 50
                ? ROULETTE_OPTIONS.findIndex(option => option.option === 'USDC')
                : ROULETTE_OPTIONS.findIndex(option => option.option === 'WETH');
              setPrizeNumber(number);
              setMustSpin(true);
              break; // Exit the loop if the condition is met
            }
          }
        } catch (error) {
          console.error('Error fetching logs:', error);
        }
      }, 5000); // Poll every 5 seconds
    };

    // Start polling
    startPolling();

    // Cleanup function to clear the interval when component unmounts or dependencies change
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId); // Clear the previous interval
      }
    };
  }, [acc, sequenceNumber]);

  const handleSpinClick = async () => {
    const result = await spin(acc); // sequence number from the spin
    if (result == undefined)
      return;
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
          }}
        />
        <div>
          {acc ? <Button isDisabled={sequenceNumber != 0} onClick={handleSpinClick}>SPIN 10 XTZ</Button> : <Text>Connect to spin</Text>}
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
