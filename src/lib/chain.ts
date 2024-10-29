import { defineChain } from "thirdweb/chains";
import { etherlinkTestnet as etherlinkTestnetViem } from 'viem/chains'

export const etherlinkTestnet = defineChain(etherlinkTestnetViem);