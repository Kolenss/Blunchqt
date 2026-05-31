"use client"

import { useEffect, useState } from "react"
import motivationalData from "@/data/motivational-notes.json"
import Image from "next/image"

export default function Countdown() {
    const [need, setNeed] = useState("")

    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    })

    const [currentNote, setCurrentNote] = useState(0)

    useEffect(() => {
        const targetDate = new Date('2026-08-19T00:00:00')

        const updateTimer = () => {
            const now = new Date()
            const difference = targetDate.getTime() - now.getTime()

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                })
            }
        }

        updateTimer()
        const interval = setInterval(updateTimer, 1000)

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const noteInterval = setInterval(() => {
            setCurrentNote((prev) => (prev + 1) % motivationalData.notes.length)
        }, 2000)

        return () => clearInterval(noteInterval)
    }, [])

    const handleNeed = async (need: string) => {
        setNeed(need)

        await fetch('/api/tobeng', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ need })
        })
    }


    return (
        <div className="flex w-full max-w-screen min-h-screen gap-8 p-8" style={{ backgroundImage: 'url(/lightpink.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
            {/* Left side - Split into Notes (top) and Pie Chart (bottom) */}
            <div className="flex-1 flex flex-col gap-8">

                {/* Top - Motivational Notes */}

                <div
                    className="flex-1 flex items-center justify-center p-8 rounded-lg"
                    style={{
                        backgroundImage: 'url(/note.png)',
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    <p className="font-kaushan text-5xl text-[#8A3D58] text-center px-8">
                        {motivationalData.notes[currentNote]}
                    </p>
                </div>

                {/* Images Row */}
                <div className="flex gap-4 justify-center items-center">
                    <p className="font-kaushan text-2xl text-[#8A3D58]">Need Something?</p>

                    <Image onClick={() => handleNeed('bread')} src="/bread.png" alt="Bread" width={60} height={60} className="cursor-pointer hover:scale-110 transition-transform" />
                    <Image onClick={() => handleNeed('chicken')} src="/chicken.png" alt="Chicken" width={60} height={60} className="cursor-pointer hover:scale-110 transition-transform" />
                    <Image onClick={() => handleNeed('drinks')} src="/drinks.png" alt="Drinks" width={60} height={60} className="cursor-pointer hover:scale-110 transition-transform" />
                    <Image onClick={() => handleNeed('flower')} src="/flower.png" alt="Flower" width={60} height={60} className="cursor-pointer hover:scale-110 transition-transform" />
                    <Image onClick={() => handleNeed('fries')} src="/fries.png" alt="Fries" width={60} height={60} className="cursor-pointer hover:scale-110 transition-transform" />
                    <Image onClick={() => handleNeed('sweets')} src="/sweets.png" alt="Sweets" width={60} height={60} className="cursor-pointer hover:scale-110 transition-transform" />
                </div>
            </div>

            {/* Right side - Timer (BIGGER) */}
            <div
                className="flex-1 flex flex-col items-center justify-center p-12 rounded-lg"
                style={{
                    backgroundImage: 'url(/timerbg.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <h2 className="font-kaushan text-6xl text-white mb-16">Countdown to August 19</h2>
                <div className="grid grid-cols-2 gap-12">
                    <div className="flex flex-col items-center">
                        <span className="font-kaushan text-9xl text-white">{timeLeft.days}</span>
                        <span className="font-kaushan text-4xl text-white">Days</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="font-kaushan text-9xl text-white">{timeLeft.hours}</span>
                        <span className="font-kaushan text-4xl text-white">Hours</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="font-kaushan text-9xl text-white">{timeLeft.minutes}</span>
                        <span className="font-kaushan text-4xl text-white">Minutes</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="font-kaushan text-9xl text-white">{timeLeft.seconds}</span>
                        <span className="font-kaushan text-4xl text-white">Seconds</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
