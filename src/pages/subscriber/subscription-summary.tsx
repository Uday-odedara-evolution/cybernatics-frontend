"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SubscriptionSummaryProps {
    planName: string
    devices: number
    years: number
    basePrice: number
    discount?: {
        type: string
        percentage: number
    }
    onSeatsChange: (increment: boolean) => void
    onYearsChange: (increment: boolean) => void
    onRemove?: () => void
    onPromoCodeApply: (code: string) => void
    onContinue: (planId:number, planName:string)=>{ } 
    onBack: () => void
}

export function SubscriptionSummary({

    planName,
    devices,
    years,
    basePrice,
    discount,
    onSeatsChange,
    onYearsChange,
    onRemove,
    onPromoCodeApply,
    onContinue,
    onBack,
}: SubscriptionSummaryProps) {
    const [promoCode, setPromoCode] = useState("")

    // Calculate prices
    const subtotal = basePrice * devices * years
    const discountAmount = discount ? (subtotal * discount.percentage) / 100 : 0
    const gst = (subtotal - discountAmount) * 0.1 // Assuming 10% GST
    const total = subtotal - discountAmount + gst

    useEffect(() => {
        document.title = 'subscriptions';
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-4">{planName}</h2>
                    <p className="text-gray-600 mb-4">
                        Modern multilayered endpoint protection featuring strong machine learning and easy-to-use management.
                    </p>

                    <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">Seats</div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => onSeatsChange(false)}
                                disabled={devices <= 5}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{devices}</span>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => onSeatsChange(true)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                        <div className="font-medium">Year(s)</div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => onYearsChange(false)}
                                disabled={years <= 1}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{years}</span>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => onYearsChange(true)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {years >= 3 && <div className="text-sm text-blue-600 mb-4">Save 20% with a 3-three year subscription</div>}

                    <div className="flex justify-between items-center">
                        <div className="font-medium">USD$</div>
                        <div className="font-bold text-xl">${(subtotal - discountAmount).toFixed(2)}</div>
                    </div>

                    {onRemove && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                            onClick={onRemove}
                        >
                            <Trash2 className="h-4 w-4 mr-2" /> Remove
                        </Button>
                    )}
                </div>

                {/* Addons section - can be expanded in the future */}
                <div>
                    <h2 className="text-xl font-bold mb-4">Addons</h2>
                    {/* You can add addon items here if needed */}
                </div>
            </div>

            <div className="md:col-span-1">
                <Card>
                    <CardContent className="pt-6">
                        <h3 className="font-bold mb-4">Summary</h3>

                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                                <span>{planName}</span>
                                <span>USD${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>
                                    {devices} devices for {years} year
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Auto-Renewal</span>
                            </div>

                            {discount && (
                                <div className="flex justify-between text-red-500">
                                    <span>{discount.type}</span>
                                    <span>-{discount.percentage}%</span>
                                </div>
                            )}

                            <div className="flex justify-between text-sm">
                                <span>GST</span>
                                <span>USD${gst.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="border-t pt-2 mb-4">
                            <div className="flex justify-between font-bold">
                                <span>Total</span>
                                <span>USD${total.toFixed(2)}</span>
                            </div>
                            <div className="text-xs text-gray-500">(including GST 10%)</div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <label className="text-sm">Add a promo code</label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="FOCUS10OFF"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    className="text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Button className="w-full bg-primary text-white hover:bg-primary/90" 
                            onClick={() => onContinue(1,planName)}>
                                CONTINUE
                            </Button>

                            <Button variant="outline" className="w-full" onClick={onBack}>
                                BACK
                            </Button>
                        </div>

                        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-600">
                            <div className="bg-gray-200 p-2 rounded-full">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-5 w-5"
                                >
                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-medium">Secure checkout</div>
                                <div>Safe payment guaranteed</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

