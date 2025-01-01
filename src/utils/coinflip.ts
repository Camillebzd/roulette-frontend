"use client"

import { Contract, ContractTransactionResponse, ethers } from "ethers";
import coinflipABI from '@/abi/Coinflip.json';
import { ethers6Adapter } from "thirdweb/adapters/ethers6";
import { Account } from "thirdweb/wallets";
import { client } from "@/lib/client";
import { etherlinkTestnet } from "@/lib/chain";
import { Dispatch, SetStateAction } from "react";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_COINFLIP_CONTRACT_ADDRESS || "";

/**
 * Flip a coin on the coinflip contract
 * @param account Account connected
 * @param setIsLoading Method to set loading state
 * @param isHead If true, the user is betting on HEADS, otherwise on TAILS
 * @param amountToBet Amount the user is betting
 * @returns Returns the sequence number if the transaction succeed, otherwise returns undefined
 */
export const flip = async (account: Account | undefined, setIsLoading: Dispatch<SetStateAction<boolean>>, isHeads: boolean, amountToBet: string): Promise<number | undefined> => {
  const flipcoin = createCoinflip(account);
  if (!flipcoin) {
    console.log("Can't flip, flipcoin contract undefined.");
    return undefined;
  }
  console.log("flipcoin:", await flipcoin.getAddress());

  const randomNumber = ethers.randomBytes(32);
  const fee = await flipcoin.getFee();
  console.log('Fees to pay:', fee);
  console.log('Flip...');

  try {
    setIsLoading(true);
    const playingAmount = ethers.parseEther(amountToBet);
    const tx: ContractTransactionResponse = await flipcoin.flipCoin(randomNumber, isHeads, { value: (fee + playingAmount).toString() });
    const receipt = await tx.wait();
  
    // Access the Coinflip event and get sequence number
    const flipEvent = receipt?.logs
      .map(log => flipcoin.interface.parseLog(log))
      .find(log => log?.name === "FlipCoin");
  
    if (!flipEvent) {
      console.log("Flip event not found in transaction receipt");
      setIsLoading(false);
      return undefined;
    }
  
    const flipSequenceNumber = flipEvent.args.sequenceNumber;
    console.log("flip event detected:");
    console.log("User:", flipEvent.args.user);
    console.log("Sequence Number:", flipSequenceNumber.toString());
    console.log("User's random number:", flipEvent.args.userRandomNumber);
    console.log("User's bet:", isHeads ? "HEADS" : "TAILS");
  
    return flipSequenceNumber;      
  } catch (error) {
    console.log('Error', error);
    setIsLoading(false);
    return undefined;
  }
};

export const createCoinflip = (account: Account | undefined) => {
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

  return new Contract(CONTRACT_ADDRESS, coinflipABI, signer)
}