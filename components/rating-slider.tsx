"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

interface RatingSliderProps {
  questionId: string
  value: number
  onChange: (value: number) => void
}

export function RatingSlider({ questionId, value, onChange }: RatingSliderProps) {
  const [sliderValue, setSliderValue] = useState<number[]>([value ?? 0])

  useEffect(() => {
    if (value !== undefined && value !== sliderValue[0]) {
      setSliderValue([value])
    }
  }, [value])

  const handleValueChange = (newValue: number[]) => {
    setSliderValue(newValue)
    onChange(newValue[0])
  }

  const handleNumberClick = (num: number) => {
    setSliderValue([num])
    onChange(num)
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>Low (0)</span>
        <span>High (10)</span>
      </div>
      <Slider
        id={questionId}
        min={0}
        max={10}
        step={1}
        value={sliderValue}
        onValueChange={handleValueChange}
        className="cursor-pointer"
      />
      <div className="text-center font-medium text-lg">{sliderValue[0]}</div>

      {/* Clickable number buttons */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: 11 }, (_, i) => (
          <Button
            key={i}
            variant={sliderValue[0] === i ? "default" : "outline"}
            size="sm"
            className="w-8 h-8 p-0 rounded-full"
            onClick={() => handleNumberClick(i)}
          >
            {i}
          </Button>
        ))}
      </div>
    </div>
  )
}
