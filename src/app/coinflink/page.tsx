"use client"

import { useActiveAccount } from "thirdweb/react";
import { useEffect, useState } from "react";
import { Button, Flex, Heading, Input, Text, useToast } from "@chakra-ui/react";
import { ethers } from "ethers";
import styles from '../page.module.css'
import { createCoinflip, flip } from "@/utils/coinflip";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_COINFLIP_CONTRACT_ADDRESS || "";
const RPC_PROVIDER = process.env.NEXT_PUBLIC_RPC_PROVIDER || "https://node.ghostnet.etherlink.com";

export default function Home() {
  const [coinFace, setCoinFace] = useState<'HEADS' | 'TAILS'>('HEADS');
  const [amountToBet, setAmountToBet] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const [sequenceNumber, setSequenceNumber] = useState(0);
  const acc = useActiveAccount();
  const toast = useToast();

  useEffect(() => {
    if (!acc || sequenceNumber === 0 || typeof window === 'undefined') return;

    const provider = new ethers.JsonRpcProvider(RPC_PROVIDER);
    const coinflip = createCoinflip(acc);

    if (!coinflip) {
      console.log("Failed to create coinflip contract.")
      return;
    }

    let intervalId: NodeJS.Timeout | null = null;

    const startPolling = () => {
      intervalId = setInterval(async () => {
        const currentBlock = await provider.getBlockNumber();
        console.log("currentBlock", currentBlock);
        // Listen to Won and Lost events
        const filter = {
          address: CONTRACT_ADDRESS,
          fromBlock: currentBlock - 90,
          toBlock: 'latest',
          topics: [
            [
              ethers.id("Won(address,uint64,uint256,uint256)"),
              ethers.id("Lost(address,uint64,uint256,uint256)"),
            ],
            "0x000000000000000000000000" + acc?.address.slice(2)  // User address
          ]
        };

        try {
          const logs = await provider.getLogs(filter);
          console.log("Logs:", logs);

          for (const log of logs) {
            const parsedLog = coinflip.interface.parseLog(log);
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

              if (parsedLog.name === 'Lost') {
                toast({
                  title: "Lost!",
                  description: `You bet on ${finalNumber > 50 ? 'TAILS' : 'HEADS'} but the result was ${finalNumber > 50 ? 'HEADS' : 'TAILS'}`,
                  status: "warning",
                  duration: 9000,
                  isClosable: true,
                });
              } else if (parsedLog.name === 'Won') {
                toast({
                  title: "Won!",
                  description: `You bet on ${finalNumber > 50 ? 'HEADS' : 'TAILS'} and the result was ${finalNumber > 50 ? 'HEADS' : 'TAILS'}`,
                  status: "success",
                  duration: 9000,
                  isClosable: true,
                });
              } else {
                console.log("Unknown event:", parsedLog.name);
              }
              setIsLoading(false);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acc, sequenceNumber]); // Only run the effect if account or sequence number changes

  const handleFlipClick = async () => {
    if (amountToBet === '') {
      return;
    }
    const result = await flip(acc, setIsLoading, coinFace == 'HEADS', amountToBet); // sequence number from the spin
    if (result == undefined) {
      // print error message
      toast({
        title: "Error",
        description: "Failed to flip the coin",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return;
    }
    setSequenceNumber(result);
  };

  const coinAnimation = () => {
    return (
      <div className={styles.coinContainer}>
        <div className={styles.coin}></div>
      </div>
    );
  };

  const buttons = () => {
    if (acc) {
      return (
        <Flex direction={'column'} gap={5} alignItems={'center'}>
          <Flex direction={'row'} gap={4}>
            <Button border={coinFace == 'HEADS' ? '4px' : ''} borderColor={coinFace == 'HEADS' ? 'white' : ''} colorScheme="yellow" onClick={() => setCoinFace('HEADS')}>HEADS</Button>
            <Button border={coinFace == 'TAILS' ? '4px' : ''} borderColor={coinFace == 'TAILS' ? 'white' : ''} colorScheme="yellow" onClick={() => setCoinFace('TAILS')}>TAILS</Button>
          </Flex>
          <Input 
            placeholder="Amount to bet" 
            type="number"
            onChange={(e) => setAmountToBet(e.target.value)}
          />
          <Button colorScheme="yellow" onClick={handleFlipClick} isLoading={isLoading}>FLIP A COIN</Button>
        </Flex>
      );
    } else {
      return <Text>Connect to spin</Text>
    }
  };

  return (
    <Flex align="center" justify="center" direction='column' mt={8} mb={8} gap={4} className="w-full">
      <Heading size='2xl'>Coinflink</Heading>
      {coinAnimation()}
      {buttons()}
    </Flex>
  );
}
