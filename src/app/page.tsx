"use client"

import Image from "next/image";
import styles from "./page.module.css";
import { useActiveAccount } from "thirdweb/react";
import { Wheel } from 'react-custom-roulette';
import { useState } from "react";
import { Box, Button } from "@chakra-ui/react";

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

  const handleSpinClick = () => {
    const newPrizeNumber = Math.floor(Math.random() * data.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
  };
  const acc = useActiveAccount();
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.h1}>Spin the roulette!</h1>
        {/* <p className={styles.p}>{acc?.address}</p> */}
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={data}
          onStopSpinning={() => {
            setMustSpin(false);
          }}
        />
        <div>
          <Button onClick={handleSpinClick}>SPIN</Button>
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
