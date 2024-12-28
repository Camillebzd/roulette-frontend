"use client"

import Image from "next/image";
import { Box, Button, Card, CardBody, CardFooter, CardHeader, Flex, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const card = (title: string, text: string, buttonTitle: string, onClick: () => void) => {
    return (
      <Card display={'flex'} alignItems={'center'}>
        <CardHeader>
          <Heading size='3xl'>{title}</Heading>
        </CardHeader>
        <CardBody textAlign="center">
          <Text>{text}</Text>
        </CardBody>
        <CardFooter>
          <Button colorScheme="yellow" onClick={onClick}>{buttonTitle}</Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div>
      <Box position="relative" height="80vh" width="100vw" overflow="hidden">
        <Image
          src="/casino_background.jpg"
          alt="Casino Background"
          layout="fill"
          objectFit="cover"
          quality={100}
        />
        <Box
          position="absolute"
          top="30%"
          left="50%"
          transform="translate(-50%, -50%)"
          bg="rgba(0, 0, 0, 0.6)"
          p={1}
          rounded='md'
          textAlign="center"
          backdropFilter="blur(6px)"
        >
          <Heading size="4xl" mb={4}>CAPY Gambling</Heading>
          <Text fontSize="xl">Experience blockchain-based gambling on Etherlink with no fees for CAPY NFT holders!</Text>
          <Button colorScheme="yellow" size="lg" mt={4} rounded='full'>Start Playing</Button>
        </Box>
      </Box>
      <Flex justifyContent="center" mt={8}>
        <SimpleGrid spacing={4} columns={[1, 2, 3]} width="70%">
          {card("Roullink", "Roulette game on Etherlink using on chain random system for fair and amayzing rewards!", "Play here", () => { router.push('/roullink') })}
          {card("Coinflink", "Using on chain random system, flip coins and double your XTZ!", "Play here", () => { router.push('/coinflink') })}
          {card("Vault", "New vault system in comming...", "Discover soon", () => { router.push('/vault') })}
        </SimpleGrid>
      </Flex>
    </div>
  );
}
