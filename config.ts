import { http, createConfig } from '@wagmi/core'
import { mainnet, moonbaseAlpha } from '@wagmi/core/chains'

export const config = createConfig({
  chains: [moonbaseAlpha],
  transports: {
    [moonbaseAlpha.id]: http("https://moonbase-alpha.public.blastapi.io")
  }
});
