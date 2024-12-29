// app/providers.tsx
'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { ThirdwebProvider } from "thirdweb/react";
import theme from './theme';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProvider>
      <ChakraProvider theme={theme}>
        {children}
      </ChakraProvider>
    </ThirdwebProvider>
  )
}