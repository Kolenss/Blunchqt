"use client"

import { useEffect, useState } from "react"
import motivationalData from "@/data/motivational-notes.json"
import Image from "next/image"
import { getCoinBalance, purchaseShopItem } from "@/lib/coins"
import { shopItems, shopCategories, type ShopCategory } from "@/lib/shop-catalog"

const PLACEHOLDER = '/shop/placeholder.svg'

export default function Countdown() {
    const [coinBalance, setCoinBalance] = useState(0)
    const [shopOpen, setShopOpen] = useState(false)
    const [howToEarnOpen, setHowToEarnOpen] = useState(false)
    const [activeCategory, setActiveCategory] = useState<ShopCategory>('snacks')
    const [purchaseMsg, setPurchaseMsg] = useState<{ text: string; ok: boolean } | null>(null)
    const [purchasing, setPurchasing] = useState(false)
    const [confirmItem, setConfirmItem] = useState<{ id: string; name: string; price: number } | null>(null)
    const [confirmQty, setConfirmQty] = useState(1)

    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    })

    const [currentNote, setCurrentNote] = useState(0)

    useEffect(() => {
        getCoinBalance().then(setCoinBalance)
    }, [])

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

    const openConfirm = (itemId: string, name: string, price: number) => {
        setConfirmItem({ id: itemId, name, price })
        setConfirmQty(1)
    }

    const handlePurchase = async () => {
        if (!confirmItem) return
        const { id: itemId, name: itemName, price } = confirmItem
        const totalPrice = price * confirmQty

        setPurchasing(true)
        setPurchaseMsg(null)
        setConfirmItem(null)

        const result = await purchaseShopItem({ item_id: itemId, price: totalPrice })
        if (result.purchased) {
            setCoinBalance(result.balance)
            setPurchaseMsg({ text: `Successfully purchased ${confirmQty}x ${itemName} for ${totalPrice} coins.`, ok: true })

            // Send purchase notification email (don't block UI)
            try {
                await fetch("/api/shop-purchase", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        itemName: `${itemName} x${confirmQty}`,
                        itemId,
                        price: totalPrice,
                        balance: result.balance,
                    }),
                })
            } catch (emailErr) {
                console.error("Failed to send purchase email:", emailErr)
            }
        } else {
            setPurchaseMsg({ text: result.error || 'Not enough coins.', ok: false })
        }
        setPurchasing(false)
        setTimeout(() => setPurchaseMsg(null), 3000)
    }

    const filteredItems = shopItems.filter(i => i.category === activeCategory)

    return (
        <div className="flex flex-col lg:flex-row w-full max-w-screen lg:max-w-screen min-h-screen gap-4 md:gap-6 lg:gap-8 p-4 md:p-6 lg:p-8" style={{ backgroundImage: 'url(/lightpink.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
            {/* Left side - Notes + Coin/Shop */}
            <div className="flex-1 flex flex-col gap-4 md:gap-6 lg:gap-8">

                {/* Top - Motivational Notes */}
                <div
                    className="animate-fade-in-up flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8 rounded-lg"
                    style={{
                        backgroundImage: 'url(/note.png)',
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    <p className="font-kaushan text-2xl md:text-4xl lg:text-5xl text-[#8A3D58] text-center px-4 md:px-6 lg:px-8 animate-fade-in" key={currentNote}>
                        {motivationalData.notes[currentNote]}
                    </p>
                </div>

                {/* Coin Balance + Shop Button */}
                <div className="animate-fade-in-up stagger-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <div className="animate-float flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md animate-pulse-glow">
                        <span className="text-xl">
                            <Image src="/coin.png" alt="Coin" width={24} height={24} className="w-6 h-6 md:w-8 md:h-8" />
                        </span>
                        <span className="font-kaushan text-lg md:text-xl text-[#8A3D58]">{coinBalance} coins</span>
                    </div>
                    <button
                        onClick={() => setShopOpen(true)}
                        className="bg-[#8A3D58] text-white font-kaushan text-lg md:text-xl px-6 py-2 rounded-full shadow-md hover:bg-[#6d2f45] hover:scale-105 active:scale-95 transition-all"
                    >
                        Shop
                    </button>
                    <button
                        onClick={() => setHowToEarnOpen(true)}
                        className="bg-white/80 backdrop-blur-sm text-[#8A3D58] border-2 border-[#8A3D58] font-kaushan text-lg md:text-xl px-6 py-2 rounded-full shadow-md hover:bg-[#f9e8ef] hover:scale-105 active:scale-95 transition-all"
                    >
                        How to Earn
                    </button>
                </div>
            </div>

            {/* Right side - Timer */}
            <div
                className="animate-slide-in-right flex-1 flex flex-col items-center justify-center p-6 md:p-8 lg:p-12 rounded-lg"
                style={{
                    backgroundImage: 'url(/timerbg.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <h2 className="animate-fade-in font-kaushan text-3xl md:text-4xl lg:text-6xl text-white mb-8 md:mb-12 lg:mb-16 text-center">Countdown to August 19</h2>
                <div className="grid grid-cols-2 gap-4 md:gap-8 lg:gap-12">
                    {[
                        { value: timeLeft.days, label: 'Days' },
                        { value: timeLeft.hours, label: 'Hours' },
                        { value: timeLeft.minutes, label: 'Minutes' },
                        { value: timeLeft.seconds, label: 'Seconds' },
                    ].map((t, i) => (
                        <div key={t.label} className={`animate-count-fade stagger-${i + 1} flex flex-col items-center`}>
                            <span className="font-kaushan text-5xl md:text-7xl lg:text-9xl text-white">{t.value}</span>
                            <span className="font-kaushan text-xl md:text-2xl lg:text-4xl text-white">{t.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Shop Modal */}
            {shopOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShopOpen(false)}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
                    <div
                        className="animate-scale-in relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 md:p-6 pb-3">
                            <h3 className="font-kaushan text-2xl md:text-3xl text-[#8A3D58]">Shop</h3>
                            <div className="flex items-center gap-2 bg-[#f9e8ef] rounded-full px-3 py-1">
                                <Image src="/coin.png" alt="Coin" width={20} height={20} className="w-5 h-5 md:w-6 md:h-6" />
                                <span className="font-kaushan text-base text-[#8A3D58]">{coinBalance}</span>
                            </div>
                        </div>

                        {/* Purchase message */}
                        {purchaseMsg && (
                            <div className={`mx-5 md:mx-6 mb-2 text-center text-sm font-semibold rounded-lg py-2 animate-fade-in ${purchaseMsg.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {purchaseMsg.text}
                            </div>
                        )}

                        {/* Category Tabs */}
                        <div className="flex gap-2 px-5 md:px-6 pb-3">
                            {shopCategories.map((cat) => (
                                <button
                                    key={cat.key}
                                    onClick={() => setActiveCategory(cat.key)}
                                    className={`flex-1 py-2 text-sm md:text-base font-semibold rounded-lg transition-all ${
                                        activeCategory === cat.key
                                            ? 'bg-[#8A3D58] text-white shadow-md'
                                            : 'bg-[#f9e8ef] text-[#8A3D58] hover:bg-[#f0d0e0]'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Items Grid - scrollable */}
                        <div className="flex-1 overflow-y-auto px-5 md:px-6 pb-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {filteredItems.map((item) => {
                                    const canAfford = coinBalance >= item.price;
                                    return (
                                        <div key={item.id} className="flex flex-col items-center bg-[#fdf2f7] rounded-xl p-3 gap-2 hover:scale-[1.03] transition-transform">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                width={56}
                                                height={56}
                                                className="w-12 h-12 md:w-14 md:h-14 object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = PLACEHOLDER
                                                }}
                                            />
                                            <span className="font-semibold text-xs md:text-sm text-gray-800 text-center leading-tight min-h-[2em]">{item.name}</span>
                                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                                <Image src="/coin.png" alt="Coin" width={14} height={14} className="w-3.5 h-3.5 inline" />
                                                {item.price}
                                            </span>
                                            <button
                                                disabled={!canAfford || purchasing}
                                                onClick={() => openConfirm(item.id, item.name, item.price)}
                                                className={`w-full text-xs md:text-sm font-semibold py-1.5 rounded-lg transition-all ${
                                                    canAfford
                                                        ? 'bg-[#8A3D58] text-white hover:bg-[#6d2f45] active:scale-95'
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                {canAfford ? 'Buy' : 'Not enough'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Close */}
                        <div className="p-5 md:p-6 pt-2">
                            <button
                                onClick={() => setShopOpen(false)}
                                className="w-full py-2 text-sm font-semibold text-[#8A3D58] border border-[#8A3D58] rounded-lg hover:bg-[#f9e8ef] transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Purchase Confirmation Modal */}
            {confirmItem && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setConfirmItem(null)}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
                    <div
                        className="animate-scale-in relative bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 flex flex-col items-center gap-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h4 className="font-kaushan text-xl md:text-2xl text-[#8A3D58]">Confirm Purchase</h4>

                        <p className="text-gray-700 text-sm md:text-base text-center">
                            Buy <span className="font-bold">{confirmItem.name}</span>?
                        </p>

                        {/* Quantity selector */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setConfirmQty(q => Math.max(1, q - 1))}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f9e8ef] text-[#8A3D58] font-bold text-lg hover:bg-[#f0d0e0] transition-colors"
                            >
                                -
                            </button>
                            <span className="text-lg font-bold text-gray-800 w-8 text-center">{confirmQty}</span>
                            <button
                                onClick={() => setConfirmQty(q => {
                                    const maxQty = Math.floor(coinBalance / confirmItem.price)
                                    return Math.min(q + 1, Math.max(1, maxQty))
                                })}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f9e8ef] text-[#8A3D58] font-bold text-lg hover:bg-[#f0d0e0] transition-colors"
                            >
                                +
                            </button>
                        </div>

                        {/* Total cost */}
                        <div className="flex items-center gap-2 bg-[#f9e8ef] rounded-full px-4 py-2">
                            <Image src="/coin.png" alt="Coin" width={18} height={18} className="w-4.5 h-4.5" />
                            <span className="font-semibold text-[#8A3D58] text-sm">{confirmItem.price * confirmQty} coins</span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setConfirmItem(null)}
                                className="flex-1 py-2 text-sm font-semibold text-[#8A3D58] border border-[#8A3D58] rounded-lg hover:bg-[#f9e8ef] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePurchase}
                                disabled={purchasing}
                                className="flex-1 py-2 text-sm font-semibold bg-[#8A3D58] text-white rounded-lg hover:bg-[#6d2f45] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {purchasing ? 'Buying...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* How to Earn Modal */}
            {howToEarnOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setHowToEarnOpen(false)}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
                    <div
                        className="animate-scale-in relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-5 md:p-6 pb-2">
                            <h3 className="font-kaushan text-2xl md:text-3xl text-[#8A3D58] text-center">How to Earn Coins</h3>
                        </div>

                        {/* Content */}
                        <div className="px-5 md:px-6 pb-4 space-y-4">
                            {/* Tracker checkboxes */}
                            <div className="bg-[#f9e8ef] rounded-xl p-4">
                                <h4 className="font-bold text-[#8A3D58] text-sm md:text-base mb-1">Progress Tracker Checkboxes</h4>
                                <p className="text-gray-700 text-xs md:text-sm">Check off Read, YouTube, or Drills in the Progress Tracker.</p>
                                <div className="mt-2 bg-white/70 rounded-lg px-3 py-2">
                                    <span className="font-semibold text-[#8A3D58] text-sm">+1 coin</span>
                                    <span className="text-gray-500 text-xs ml-1">per checkbox</span>
                                </div>
                            </div>

                            {/* TOS status */}
                            <div className="bg-[#f9e8ef] rounded-xl p-4">
                                <h4 className="font-bold text-[#8A3D58] text-sm md:text-base mb-1">TOS Topic Completion</h4>
                                <p className="text-gray-700 text-xs md:text-sm">Mark a TOS topic status as &quot;Done&quot;.</p>
                                <div className="mt-2 bg-white/70 rounded-lg px-3 py-2">
                                    <span className="font-semibold text-[#8A3D58] text-sm">+1 coin</span>
                                    <span className="text-gray-500 text-xs ml-1">per topic completed</span>
                                </div>
                            </div>

                            {/* Score drills */}
                            <div className="bg-[#f9e8ef] rounded-xl p-4">
                                <h4 className="font-bold text-[#8A3D58] text-sm md:text-base mb-1">Score Drills</h4>
                                <p className="text-gray-700 text-xs md:text-sm">Add a new drill score. Points are based on your average (score &divide; total).</p>
                                <div className="mt-2 bg-white/70 rounded-lg px-3 py-2 space-y-1">
                                    <div className="flex justify-between text-xs md:text-sm">
                                        <span className="text-gray-700">100% average</span>
                                        <span className="font-semibold text-[#8A3D58]">+5 coins</span>
                                    </div>
                                    <div className="flex justify-between text-xs md:text-sm">
                                        <span className="text-gray-700">80% average</span>
                                        <span className="font-semibold text-[#8A3D58]">+4 coins</span>
                                    </div>
                                    <div className="flex justify-between text-xs md:text-sm">
                                        <span className="text-gray-700">60% average</span>
                                        <span className="font-semibold text-[#8A3D58]">+3 coins</span>
                                    </div>
                                    <div className="flex justify-between text-xs md:text-sm">
                                        <span className="text-gray-700">40% average</span>
                                        <span className="font-semibold text-[#8A3D58]">+2 coins</span>
                                    </div>
                                    <div className="flex justify-between text-xs md:text-sm">
                                        <span className="text-gray-700">20% average</span>
                                        <span className="font-semibold text-[#8A3D58]">+1 coin</span>
                                    </div>
                                </div>
                                <p className="text-gray-500 text-xs mt-2 italic">Formula: 5 &times; (score &divide; total), rounded</p>
                            </div>

                            {/* Tips */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="font-bold text-gray-700 text-sm md:text-base mb-1">Tips</h4>
                                <ul className="text-gray-600 text-xs md:text-sm space-y-1 list-disc list-inside">
                                    <li>Each action can only earn coins once (no double-dipping!)</li>
                                    <li>Spend coins in the Shop on snacks, drinks, and meals</li>
                                    <li>Keep studying consistently to stack up coins!</li>
                                </ul>
                            </div>
                        </div>

                        {/* Close */}
                        <div className="p-5 md:p-6 pt-2">
                            <button
                                onClick={() => setHowToEarnOpen(false)}
                                className="w-full py-2 text-sm font-semibold text-[#8A3D58] border border-[#8A3D58] rounded-lg hover:bg-[#f9e8ef] transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
