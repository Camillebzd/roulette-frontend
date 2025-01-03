"use client"

import { useActiveAccount } from "thirdweb/react";
import dynamic from 'next/dynamic';
// Dynamically import Wheel without SSR
const Wheel = dynamic(() => import('react-custom-roulette').then((mod) => mod.Wheel), {
  ssr: false,
});
import { useEffect, useState } from "react";
import { Button, Flex, Heading, Text, useToast } from "@chakra-ui/react";
import { createRoulette, spin } from "@/utils/roulette";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ROULETTE_CONTRACT_ADDRESS || "";
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

const getRandomPrizeIndex = (token: string) => {
  const filteredOptions = ROULETTE_OPTIONS
    .map((option, index) => ({ ...option, index }))
    .filter(option => option.option === token);

  if (filteredOptions.length === 0) return 0; // Fallback if no match is found

  const randomIndex = Math.floor(Math.random() * filteredOptions.length);
  return filteredOptions[randomIndex].index;
};

export default function Home() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sequenceNumber, setSequenceNumber] = useState(0);
  const acc = useActiveAccount();
  const toast = useToast();

  useEffect(() => {
    if (!acc || sequenceNumber === 0 || typeof window === 'undefined') return;

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

          for (const log of logs) {
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
                  ? getRandomPrizeIndex('USDC')
                  : getRandomPrizeIndex('WETH');

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
      toast({
        title: "Error",
        description: "Failed to spin the roulette",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return;
    }
    setSequenceNumber(result);
  };

  const handleOnStopSpinning = () => {
    switch (ROULETTE_OPTIONS[prizeNumber].option) {
      case 'USDC':
        toast({
          title: "Congratulations!",
          description: "You swapped to USDC",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        break;
      case 'WETH':
        toast({
          title: "Congratulations!",
          description: "You swapped to WETH",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        break;
      case 'LOST':
        toast({
          title: "Sorry!",
          description: "You lost",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        break;
      case 'X2 XTZ':
        toast({
          title: "Congratulations!",
          description: "You won 2x XTZ",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        break;
      default:
        break;
    };
    setMustSpin(false);
    setIsLoading(false);
  };

  return (
    <Flex align="center" justify="center" direction='column' mt={8} mb={8} gap={4} className="w-full">
      <Heading size='2xl'>Roullink</Heading>
      <Wheel
        mustStartSpinning={mustSpin}
        prizeNumber={prizeNumber}
        data={ROULETTE_OPTIONS}
        onStopSpinning={handleOnStopSpinning}
      />
      <div>
        {acc ? <Button colorScheme="yellow" isDisabled={sequenceNumber != 0} isLoading={isLoading} onClick={handleSpinClick}>SPIN 1 XTZ</Button> : <Text>Connect to spin</Text>}
      </div>
    </Flex>
  );
}
