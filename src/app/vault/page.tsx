"use client"

import styles from "../page.module.css";
import { Text } from "@chakra-ui/react";

export default function Page() {

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.h1}>Vault</h1>
        <Text>Vault in construction...</Text>
      </main>
    </div>
  );
}
