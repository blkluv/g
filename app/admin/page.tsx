"use client"

import ConnectWallet from "@/components/ConnectWallet";
import useApp, { AppEnvironment } from "@/hooks/useApp";
import { useContext, useEffect } from "react";

export default function Admin() {
  const { account, getNearbyLandmarkData, registerLandmark, visitLandmark, getVisitedLandmarks, getTokenURIsByOwner } = useContext(AppEnvironment)

  async function test(e: FormData) {
    if (!account) return;
    const f = e.get("file")
    if (!f) return
    await registerLandmark(
      e.get("name") as string, f as File, Number.parseFloat(e.get("lat") as string), Number.parseFloat(e.get("lon") as string), Number.parseInt(e.get("path") as string)
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
      console.log("nearby landmarks", await getNearbyLandmarkData(51.5007, -0.1246))
      console.log("visited landmarks", await getVisitedLandmarks())
      console.log("owned tokens", await getTokenURIsByOwner())
    })()
  }, [account])

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <ConnectWallet />
        <p>{account}</p>

        <h1>Register landmark</h1>
        <form action={test} className="flex flex-col gap-1">
          <input name="file" type="file" />
          <input className="bg-slate-800 m-1" name="name" type="text" defaultValue="Big Ben" />
          <input className="bg-slate-800 m-1" name="lat" type="text" defaultValue="51.5007" />
          <input className="bg-slate-800 m-1" name="lon" type="text" defaultValue="-0.1246" />
          <input className="bg-slate-800 m-1" name="path" type="text" defaultValue="-1" />
          <button type="submit">
            click
          </button>
        </form>

        <h1>Register Visit</h1>
        <form action={test2} className="flex flex-col gap-1">
          <input name="file" type="file" />
          <button type="submit">
            click
          </button>
        </form>
      </main>
    </div>
  );
}
