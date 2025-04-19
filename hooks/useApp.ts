"use client"

import { connect, getAccount, getEnsName, injected, watchAccount } from '@wagmi/core'
import { config } from '@/config'
import { createContext, useEffect, useState } from 'react'

// const ensName = await getEnsName(config, { address })

interface IAppEnvironment {
  account: string | null;
  connectAccount: () => Promise<string | null>;
}

export const AppEnvironment = createContext<IAppEnvironment>({
  account: null,
  connectAccount: async () => null,
})

export default function useApp(): IAppEnvironment {
  const [account, setAccount] = useState<string | null>(null)

  async function connectAccount() {
    const result = await connect(config, { connector: injected() });
    
    if (result) {
      setAccount(result.accounts[0])
      return result.accounts[0]
    }

    return null
  }

  useEffect(() => {
    console.log(getAccount(config));
  }, [])

  return {
    account,
    connectAccount
  }
}