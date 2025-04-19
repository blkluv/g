"use client"

import { AppEnvironment } from "@/hooks/useApp";
import Image from "next/image";
import { useContext } from "react";

export default function ConnectWallet() {
  const { account, connectAccount } = useContext(AppEnvironment)
  return (
    <button disabled={account !== null} onClick={connectAccount} className="flex gap-2 py-2 px-4 items-center cursor-pointer disabled:brightness-75 bg-slate-500 rounded-3xl shadow transition-all duration-200 hover:scale-105 hover:brightness-90 active:scale-95">
      <Image src="/metamask.svg" width="36" height="36" alt="wallet" />
      <p className="text-white font-medium text-2xl">{!!account ? "connected" : "connect"}</p>
    </button>
  )
}