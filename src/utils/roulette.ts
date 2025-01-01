"use client"

import { Contract, ContractTransactionResponse, ethers } from "ethers";
import rouletteABI from '@/abi/Roulette.json';
import { ethers6Adapter } from "thirdweb/adapters/ethers6";
import { Account } from "thirdweb/wallets";
import { client } from "@/lib/client";
import { etherlinkTestnet } from "@/lib/chain";
import { Dispatch, SetStateAction } from "react";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ROULETTE_CONTRACT_ADDRESS || "";

/**
 * Spin the roulette and return the sequence number emitted or undefined
 * @param signer Signer connected
 * @returns Returns the sequence number if the transaction succeed, otherwise returns undefined
 */
export const spin = async (account: Account | undefined, setIsLoading: Dispatch<SetStateAction<boolean>>): Promise<number | undefined> => {
  const roulette = createRoulette(account);
  if (!roulette) {
    console.log("Can't spin, roulette contract undefined.");
    return undefined;
  }
  console.log("Roulette:", await roulette.getAddress());

  const randomNumber = ethers.randomBytes(32);
  const fee = await roulette.getFee();
  console.log('Fees to pay:', fee);
  console.log('Spinning the roulette...');

  try {
    setIsLoading(true);
    const playingAmount = await roulette.AMOUNT();
    const tx: ContractTransactionResponse = await roulette.spin(randomNumber, { value: (fee + playingAmount).toString() });
    const receipt = await tx.wait();
  
    // Access the Spin event and get sequence number
    const spinEvent = receipt?.logs
      .map(log => roulette.interface.parseLog(log))
      .find(log => log?.name === "Spin");
  
    if (!spinEvent) {
      console.log("Spin event not found in transaction receipt");
      setIsLoading(false);
      return undefined;
    }
  
    const spinSequenceNumber = spinEvent.args.sequenceNumber;
    console.log("Spin event detected:");
    console.log("User:", spinEvent.args.user);
    console.log("Sequence Number:", spinSequenceNumber.toString());
    console.log("User's random number:", spinEvent.args.userRandomNumber);
  
    return spinSequenceNumber;      
  } catch (error) {
    console.log('Error', error);
    setIsLoading(false);
    return undefined;
  }
};

export const createRoulette = (account: Account | undefined) => {
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

  return new Contract(CONTRACT_ADDRESS, rouletteABI, signer)
}