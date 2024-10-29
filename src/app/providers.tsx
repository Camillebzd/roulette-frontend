// app/providers.tsx
'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { ThirdwebProvider } from "thirdweb/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProvider>
      <ChakraProvider>
        {children}
      </ChakraProvider>
    </ThirdwebProvider>
  )
}