"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { getCoinBalance, purchaseShopItem } from "@/lib/coins"
import { shopItems, shopCategories, type ShopCategory } from "@/lib/shop-catalog"

const PLACEHOLDER = '/shop/placeholder.svg'

/**
 * Standalone Shop + How-to-Earn modals, extracted from the old Countdown
 * component. Mount this once near the page root; open it from anywhere by
 * dispatching `blunch:open-shop` or `blunch:open-how-to-earn` on window.
 * Broadcasts `blunch:coins-updated` after a purchase so other components
 * (top nav, rewards) can refresh their balance.
 */
export default function ShopModal() {
    const [coinBalance, setCoinBalance] = useState(0)
    const [shopOpen, setShopOpen] = useState(false)
    const [howToEarnOpen, setHowToEarnOpen] = useState(false)
    const [activeCategory, setActiveCategory] = useState<ShopCategory>('snacks')
    const [purchaseMsg, setPurchaseMsg] = useState<{ text: string; ok: boolean } | null>(null)
    const [purchasing, setPurchasing] = useState(false)
    const [confirmItem, setConfirmItem] = useState<{ id: string; name: string; price: number } | null>(null)
    const [confirmQty, setConfirmQty] = useState(1)

    useEffect(() => {
        getCoinBalance().then(setCoinBalance)
    }, [])

    // Open triggers from other components.
    useEffect(() => {
        const openShop = () => { getCoinBalance().then(setCoinBalance); setShopOpen(true) }
        const openHowToEarn = () => setHowToEarnOpen(true)
        window.addEventListener('blunch:open-shop', openShop)
        window.addEventListener('blunch:open-how-to-earn', openHowToEarn)
        return () => {
            window.removeEventListener('blunch:open-shop', openShop)
            window.removeEventListener('blunch:open-how-to-earn', openHowToEarn)
        }
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
            window.dispatchEvent(new CustomEvent('blunch:coins-updated', { detail: result.balance }))
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
        <>
            {/* Shop Modal */}
            {shopOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShopOpen(false)}>
                    <div className="absolute inset-0 bg-[#201923]/40 backdrop-blur-sm animate-fade-in" />
                    <div
                        className="animate-scale-in relative rounded-[28px] shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col border"
                        style={{
                            backgroundColor: '#fff7fc',
                            backgroundImage: "url('/figma/paper-texture.png')",
                            backgroundSize: '410px 410px',
                            backgroundPosition: 'top left',
                            borderColor: 'rgba(217,193,194,0.4)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 md:p-6 pb-3">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-semibold text-[#934652]" style={{ fontFamily: 'var(--font-playfair), serif' }}>Sweet Shop</h3>
                                <p className="text-xs font-medium tracking-wide" style={{ color: '#534344' }}>Treat yourself, Baby</p>
                            </div>
                            <div className="flex items-center gap-2 rounded-full px-3 py-1.5" style={{ backgroundColor: '#dce5ab' }}>
                                <Image src="/coin.png" alt="Coin" width={18} height={18} className="w-4.5 h-4.5" />
                                <span className="font-bold text-sm" style={{ color: '#5e6738' }}>{coinBalance}</span>
                            </div>
                        </div>

                        {/* Purchase message */}
                        {purchaseMsg && (
                            <div
                                className="mx-5 md:mx-6 mb-2 text-center text-sm font-semibold rounded-xl py-2 animate-fade-in"
                                style={purchaseMsg.ok
                                    ? { backgroundColor: '#dce5ab', color: '#434a1f' }
                                    : { backgroundColor: '#ffdad6', color: '#93000a' }}
                            >
                                {purchaseMsg.text}
                            </div>
                        )}

                        {/* Category Tabs */}
                        <div className="flex gap-2 px-5 md:px-6 pb-3">
                            {shopCategories.map((cat) => {
                                const active = activeCategory === cat.key;
                                return (
                                    <button
                                        key={cat.key}
                                        onClick={() => setActiveCategory(cat.key)}
                                        className="flex-1 py-2 text-sm md:text-base font-semibold rounded-full transition-all border"
                                        style={active
                                            ? { backgroundColor: '#934652', color: '#ffffff', borderColor: '#934652', boxShadow: '0px 4px 6px -1px rgba(147,70,82,0.25)' }
                                            : { backgroundColor: '#ffffff', color: '#934652', borderColor: 'rgba(217,127,139,0.3)' }}
                                    >
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Items Grid - scrollable */}
                        <div className="flex-1 overflow-y-auto px-5 md:px-6 pb-4">
                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                                {filteredItems.map((item) => {
                                    const canAfford = coinBalance >= item.price;
                                    return (
                                        <div
                                            key={item.id}
                                            className="flex flex-col items-center rounded-2xl p-3 gap-2 hover:scale-[1.03] transition-transform border"
                                            style={{ backgroundColor: '#ffffff', borderColor: '#ecdeed' }}
                                        >
                                            <div className="w-full rounded-xl flex items-center justify-center py-3" style={{ backgroundColor: '#fdeffe' }}>
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
                                            </div>
                                            <span className="font-semibold text-xs md:text-sm text-center leading-tight min-h-[2em]" style={{ color: '#201923' }}>{item.name}</span>
                                            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: '#dce5ab', color: '#5e6738' }}>
                                                <Image src="/coin.png" alt="Coin" width={12} height={12} className="w-3 h-3 inline" />
                                                {item.price}
                                            </span>
                                            <button
                                                disabled={!canAfford || purchasing}
                                                onClick={() => openConfirm(item.id, item.name, item.price)}
                                                className="w-full text-xs md:text-sm font-bold py-1.5 rounded-full transition-all active:scale-95"
                                                style={canAfford
                                                    ? { backgroundColor: '#934652', color: '#ffffff' }
                                                    : { backgroundColor: '#ecdeed', color: '#867274', cursor: 'not-allowed' }}
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
                                className="w-full py-2.5 text-sm font-semibold rounded-full border transition-colors hover:bg-[#f7eaf8]"
                                style={{ color: '#934652', borderColor: '#934652' }}
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
                    <div className="absolute inset-0 bg-[#201923]/50 backdrop-blur-sm animate-fade-in" />
                    <div
                        className="animate-scale-in relative rounded-[28px] shadow-2xl w-full max-w-xs p-6 flex flex-col items-center gap-4 border"
                        style={{
                            backgroundColor: '#fff7fc',
                            backgroundImage: "url('/figma/paper-texture.png')",
                            backgroundSize: '410px 410px',
                            backgroundPosition: 'top left',
                            borderColor: 'rgba(217,193,194,0.4)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h4 className="font-semibold text-xl md:text-2xl text-[#934652]" style={{ fontFamily: 'var(--font-playfair), serif' }}>Confirm Purchase</h4>

                        <p className="text-sm md:text-base text-center" style={{ color: '#534344' }}>
                            Buy <span className="font-bold" style={{ color: '#201923' }}>{confirmItem.name}</span>?
                        </p>

                        {/* Quantity selector */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setConfirmQty(q => Math.max(1, q - 1))}
                                className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-lg transition-colors hover:brightness-95"
                                style={{ backgroundColor: '#f7eaf8', color: '#934652' }}
                            >
                                -
                            </button>
                            <span className="text-lg font-bold w-8 text-center" style={{ color: '#201923' }}>{confirmQty}</span>
                            <button
                                onClick={() => setConfirmQty(q => {
                                    const maxQty = Math.floor(coinBalance / confirmItem.price)
                                    return Math.min(q + 1, Math.max(1, maxQty))
                                })}
                                className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-lg transition-colors hover:brightness-95"
                                style={{ backgroundColor: '#f7eaf8', color: '#934652' }}
                            >
                                +
                            </button>
                        </div>

                        {/* Total cost */}
                        <div className="flex items-center gap-2 rounded-full px-4 py-2" style={{ backgroundColor: '#dce5ab' }}>
                            <Image src="/coin.png" alt="Coin" width={18} height={18} className="w-4.5 h-4.5" />
                            <span className="font-bold text-sm" style={{ color: '#5e6738' }}>{confirmItem.price * confirmQty} coins</span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setConfirmItem(null)}
                                className="flex-1 py-2.5 text-sm font-semibold rounded-full border transition-colors hover:bg-[#f7eaf8]"
                                style={{ color: '#934652', borderColor: '#934652' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePurchase}
                                disabled={purchasing}
                                className="flex-1 py-2.5 text-sm font-semibold text-white rounded-full hover:bg-[#76353f] active:scale-95 transition-all disabled:opacity-50"
                                style={{ backgroundColor: '#934652' }}
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
                    <div className="absolute inset-0 bg-[#201923]/40 backdrop-blur-sm animate-fade-in" />
                    <div
                        className="animate-scale-in relative rounded-[28px] shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto flex flex-col border"
                        style={{
                            backgroundColor: '#fff7fc',
                            backgroundImage: "url('/figma/paper-texture.png')",
                            backgroundSize: '410px 410px',
                            backgroundPosition: 'top left',
                            borderColor: 'rgba(217,193,194,0.4)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-5 md:p-6 pb-2">
                            <h3 className="text-2xl md:text-3xl font-semibold text-[#934652] text-center" style={{ fontFamily: 'var(--font-playfair), serif' }}>How to Earn Coins</h3>
                        </div>

                        {/* Content */}
                        <div className="px-5 md:px-6 pb-4 space-y-4">
                            {/* Tracker checkboxes */}
                            <div className="bg-[#f7eaf8] rounded-xl p-4">
                                <h4 className="font-bold text-[#934652] text-sm md:text-base mb-1">Progress Tracker Checkboxes</h4>
                                <p className="text-gray-700 text-xs md:text-sm">Check off Read, YouTube, or Drills in the Progress Tracker.</p>
                                <div className="mt-2 bg-white/70 rounded-lg px-3 py-2">
                                    <span className="font-semibold text-[#934652] text-sm">+1 coin</span>
                                    <span className="text-gray-500 text-xs ml-1">per checkbox</span>
                                </div>
                            </div>

                            {/* TOS status */}
                            <div className="bg-[#f7eaf8] rounded-xl p-4">
                                <h4 className="font-bold text-[#934652] text-sm md:text-base mb-1">TOS Topic Completion</h4>
                                <p className="text-gray-700 text-xs md:text-sm">Mark a TOS topic status as &quot;Done&quot;.</p>
                                <div className="mt-2 bg-white/70 rounded-lg px-3 py-2">
                                    <span className="font-semibold text-[#934652] text-sm">+1 coin</span>
                                    <span className="text-gray-500 text-xs ml-1">per topic completed</span>
                                </div>
                            </div>

                            {/* Score drills */}
                            <div className="bg-[#f7eaf8] rounded-xl p-4">
                                <h4 className="font-bold text-[#934652] text-sm md:text-base mb-1">Score Drills</h4>
                                <p className="text-gray-700 text-xs md:text-sm">Add a new drill score. Points are based on your average (score &divide; total).</p>
                                <div className="mt-2 bg-white/70 rounded-lg px-3 py-2 space-y-1">
                                    <div className="flex justify-between text-xs md:text-sm">
                                        <span className="text-gray-700">100% average</span>
                                        <span className="font-semibold text-[#934652]">+5 coins</span>
                                    </div>
                                    <div className="flex justify-between text-xs md:text-sm">
                                        <span className="text-gray-700">80% average</span>
                                        <span className="font-semibold text-[#934652]">+4 coins</span>
                                    </div>
                                    <div className="flex justify-between text-xs md:text-sm">
                                        <span className="text-gray-700">60% average</span>
                                        <span className="font-semibold text-[#934652]">+3 coins</span>
                                    </div>
                                    <div className="flex justify-between text-xs md:text-sm">
                                        <span className="text-gray-700">40% average</span>
                                        <span className="font-semibold text-[#934652]">+2 coins</span>
                                    </div>
                                    <div className="flex justify-between text-xs md:text-sm">
                                        <span className="text-gray-700">20% average</span>
                                        <span className="font-semibold text-[#934652]">+1 coin</span>
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
                                className="w-full py-2.5 text-sm font-semibold rounded-full border transition-colors hover:bg-[#f7eaf8]"
                                style={{ color: '#934652', borderColor: '#934652' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
