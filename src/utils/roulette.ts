"use client"

import { Contract, ContractTransactionResponse, ethers } from "ethers";
import rouletteABI from '@/abi/Roulette.json';
import { ethers6Adapter } from "thirdweb/adapters/ethers6";
import { Account } from "thirdweb/wallets";
import { client } from "@/lib/client";
import { etherlinkTestnet } from "@/lib/chain";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xcbC35A809dd7215eb6D0b4Ad6E5E4701Bb371f29";

/**
 * Spin the roulette and return the sequence number emitted or undefined
 * @param signer Signer connected
 * @returns Returns the sequence number if the transaction succeed, otherwise returns undefined
 */
export const spin = async (account: Account | undefined): Promise<number | undefined> => {
  if (!account) {
    console.log("Error: account undefined.");
    return undefined;
  }
  // chain network hardcoded
  const signer = ethers6Adapter.signer.toEthers({ client, chain: etherlinkTestnet, account });
  if (signer == undefined) {
    console.log("Error: signer undefined.");
    return undefined;
  }
  const roulette = new Contract(CONTRACT_ADDRESS, rouletteABI.abi, signer);
  console.log("Roulette:", await roulette.getAddress());

  const randomNumber = ethers.randomBytes(32);
  const fee = await roulette.getFee();
  console.log('Fees to pay:', fee);
  console.log('Spinning the roulette...');

  const tx: ContractTransactionResponse = await roulette.spin(randomNumber, { value: (fee + ethers.parseEther('10')).toString() });
  const receipt = await tx.wait();

  // Access the Spin event and get sequence number
  const spinEvent = receipt?.logs
    .map(log => roulette.interface.parseLog(log))
    .find(log => log?.name === "Spin");

  if (!spinEvent) {
    console.log("Spin event not found in transaction receipt");
    return -1;
  }

  const spinSequenceNumber = spinEvent.args.sequenceNumber;
  console.log("Spin event detected:");
  console.log("User:", spinEvent.args.user);
  console.log("Sequence Number:", spinSequenceNumber.toString());
  console.log("User's random number:", spinEvent.args.userRandomNumber);

  // return spinSequenceNumber;
  // Promise to wait for Swap event with correct sequence number
  console.log("Waiting for Swap event...");

  const swapEventPromise = new Promise<{user: string, swapSequenceNumber: bigint, finalNumber: bigint, tokenOut: string, amountOut: bigint}>((resolve, reject) => {
    let swapContractEvent = roulette.getEvent("Swap");
    const timeout = setTimeout(() => {
      roulette.off(swapContractEvent); // Remove listener if timed out
      reject(new Error("Swap event not received within timeout"));
    }, 2 * 60 * 1000); // 2 minutes

    // Listen for the Swap event with the correct filter
    roulette.on(swapContractEvent, (user, swapSequenceNumber, finalNumber, tokenOut, amountOut) => {
      if (spinSequenceNumber == swapSequenceNumber) {
        clearTimeout(timeout); // Clear timeout once the event is received
        roulette.off(swapContractEvent);  // Clean up all listeners after resolving
        console.log("Swap event detected with matching sequence number:");
        console.log("User:", user);
        console.log("Swap sequence number:", swapSequenceNumber.toString());
        console.log("Final number:", finalNumber);
        console.log("Token out address:", tokenOut);
        console.log("Amount out:", amountOut);
        resolve({ user, swapSequenceNumber, finalNumber, tokenOut, amountOut });  // Resolve the promise with event args
      } else {
        console.log("Received Swap event with non-matching sequence number:", swapSequenceNumber.toString());
      }
    });
  });

  try {
    const swapEvent = await swapEventPromise;
    console.log("Swap event received:", swapEvent);
    return Number(swapEvent.swapSequenceNumber);
  } catch (error: any) {
    console.error("Error:", error.message);
    return undefined;
  }
};