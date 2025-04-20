"use client"

import ConnectWallet from "@/components/ConnectWallet";
import useApp, { AppEnvironment } from "@/hooks/useApp";
import { useContext, useEffect } from "react";

export default function Home() {
  const { account, getNearbyLandmarkData, registerLandmark, visitLandmark } = useContext(AppEnvironment)

  async function test(e: FormData) {
    if (!account) return;
    const f = e.get("file")
    if (!f) return
    await registerLandmark(
      "Big Ben", f as File, 51.5007, -0.1246, 0
    )
  }

  async function test2(e: FormData) {
    if (!account) return;
    const f = e.get("file")
    if (!f) return
    await visitLandmark(
      0, f as File
    )
  }

  useEffect(() => {
    (async function () {
      console.log(await getNearbyLandmarkData(51.5007, -0.1246))
    })()
    // test()
  }, [account])

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <ConnectWallet />
        <p>{account}</p>
        <form action={test2}>
          <input name="file" type="file" />
          <button type="submit">
            click
          </button>
        </form>
      </main>
    </div>
  );
}
