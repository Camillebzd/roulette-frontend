"use client"

import Image from "next/image";
import styles from "./page.module.css";
import { useActiveAccount } from "thirdweb/react";
import { Wheel } from 'react-custom-roulette';
import { useState } from "react";
import { Box, Button } from "@chakra-ui/react";
import { spin } from "@/utils/roulette";
// import { useSigner } from "@thirdweb-dev/react";

const data = [
  { option: 'USDC', style: {backgroundColor: '#2588e6'} },
  { option: 'WETH', style: {backgroundColor: '#6f25e6'}  },
  { option: 'USDC', style: {backgroundColor: '#2588e6'}  },
  { option: 'WETH', style: {backgroundColor: '#6f25e6'}  },
  { option: 'USDC', style: {backgroundColor: '#2588e6'}  },
  { option: 'WETH', style: {backgroundColor: '#6f25e6'}  },
  { option: 'USDC', style: {backgroundColor: '#2588e6'}  },
  { option: 'WETH', style: {backgroundColor: '#6f25e6'}  },
  { option: 'USDC', style: {backgroundColor: '#2588e6'}  },
  { option: 'WETH', style: {backgroundColor: '#6f25e6'}  },
];

export default function Home() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  // const signer = useSigner();
  const acc = useActiveAccount();

  const handleSpinClick = async () => {
    const result = await spin(acc); // number betweem 1 - 100, 1 - 50 USDC | 51 - 100 WETH
    if (result == undefined)
      return;
    let number = result <= 50 ? data.indexOf({option: 'USDC', style: {backgroundColor: '#2588e6'}}) : data.indexOf({option: 'WETH', style: {backgroundColor: '#6f25e6'}})
    setPrizeNumber(number);
    setMustSpin(true);
  };
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.h1}>Spin the roulette!</h1>
        <p className={styles.p}>{acc?.address}</p>
        {/* <p className={styles.p}>{signer?.getAddress()}</p> */}
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={data}
          onStopSpinning={() => {
            setMustSpin(false);
          }}
        />
        <div>
          <Button onClick={handleSpinClick}>SPIN 10 XTZ</Button>
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
