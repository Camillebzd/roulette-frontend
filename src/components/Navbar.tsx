'use client'

import {
  Box,
  Flex,
  HStack,
  IconButton,
  Menu,
  useDisclosure,
  useColorModeValue,
  Stack,
} from '@chakra-ui/react'
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import Image from "next/image";
import styles from "@/app/page.module.css";
import { ConnectButton, darkTheme } from "thirdweb/react";
import { client } from "@/lib/client";
import { etherlinkTestnet } from "@/lib/chain";
import { createWallet } from 'thirdweb/wallets';
import Link from 'next/link';

const wallets = [
  createWallet("io.metamask"),
  createWallet("io.rabby"),
  createWallet("walletConnect"),
];

interface Props {
  children: React.ReactNode,
  page: string
}

const Links = ['CAPY', 'Roullink', 'Coinflink', 'Vault'];

const NavLink = (props: Props) => {
  const { children, page } = props;

  const handleHref = () => {
    switch (page) {
      case 'CAPY':
        return '/';
      case 'Roullink':
      case 'Coinflink':
      case 'Vault':
        return `/${page.toLowerCase()}`;
      default:
        return '/';
    }
  };

  return (
    <Link href={handleHref()} passHref>
      <Box
        px={2}
        py={1}
        rounded={'md'}
        _hover={{
          textDecoration: 'none',
          bg: useColorModeValue('gray.200', 'gray.700'),
        }}>
        {children}
      </Box>
    </Link>
  );
};

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={'center'}>
            <Image
              className={styles.logo}
              src="/Capybara_icon.svg"
              alt="Capybara logo"
              width={50}
              height={50}
              priority
            />

            <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
              {Links.map((link) => (
                <NavLink key={link} page={link}>{link}</NavLink>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={'center'}>
            <Menu>
              <div className={styles.buttonWrapper}>
                <ConnectButton
                  client={client}
                  chain={etherlinkTestnet}
                  wallets={wallets}
                  connectModal={{
                    size: "compact",
                    showThirdwebBranding: false,
                  }}
                  theme={darkTheme({
                    colors: {
                      primaryButtonBg: "hsl(55, 92%, 76%)",
                      primaryButtonText: "hsl(228, 12%, 8%)",
                    },
                  })}
                />
              </div>
            </Menu>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
              {Links.map((link) => (
                <NavLink key={link} page={link}>{link}</NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  )
}