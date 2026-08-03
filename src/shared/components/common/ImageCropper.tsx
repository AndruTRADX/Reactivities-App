import { useCallback, useRef, useState } from "react"
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"

import { Button } from "@sharedUi/button"
import { ButtonGroup } from "@sharedUi/button-group"
import type { CropArea } from "@/shared/lib/cropImage"

interface AspectOption {
  label: string
  value: number | undefined
}

const ASPECT_OPTIONS: AspectOption[] = [
  { label: "Square", value: 1 },
  { label: "Portrait", value: 3 / 4 },
  { label: "Landscape", value: 4 / 3 },
  { label: "Widescreen", value: 16 / 9 },
  { label: "Free", value: undefined },
]

interface Props {
  image: string
  onCropComplete: (crop: CropArea) => void
}

function centeredCrop(aspect: number | undefined, width: number, height: number): Crop {
  if (!aspect) return { unit: "%", x: 5, y: 5, width: 90, height: 90 }

  return centerCrop(makeAspectCrop({ unit: "%", width: 90 }, aspect, width, height), width, height)
}

function percentCropToNatural(crop: Crop, naturalWidth: number, naturalHeight: number): CropArea {
  return {
    x: (crop.x / 100) * naturalWidth,
    y: (crop.y / 100) * naturalHeight,
    width: (crop.width / 100) * naturalWidth,
    height: (crop.height / 100) * naturalHeight,
  }
}

export default function ImageCropper({ image, onCropComplete }: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [aspect, setAspect] = useState<number | undefined>(1)
  const [crop, setCrop] = useState<Crop>()

  const handleImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height, naturalWidth, naturalHeight } = e.currentTarget
      const initialCrop = centeredCrop(aspect, width, height)
      setCrop(initialCrop)
      onCropComplete(percentCropToNatural(initialCrop, naturalWidth, naturalHeight))
    },
    [aspect, onCropComplete]
  )

  const handleAspectChange = useCallback(
    (value: number | undefined) => {
      setAspect(value)

      const img = imgRef.current
      if (!img) return

      const newCrop = centeredCrop(value, img.width, img.height)
      setCrop(newCrop)
      onCropComplete(percentCropToNatural(newCrop, img.naturalWidth, img.naturalHeight))
    },
    [onCropComplete]
  )

  const handleCropChange = useCallback((_pixelCrop: PixelCrop, percentCrop: Crop) => {
    setCrop(percentCrop)
  }, [])

  const handleCropComplete = useCallback(
    (pixelCrop: PixelCrop) => {
      const img = imgRef.current
      if (!img || pixelCrop.width === 0 || pixelCrop.height === 0) return

      const scaleX = img.naturalWidth / img.width
      const scaleY = img.naturalHeight / img.height

      onCropComplete({
        x: pixelCrop.x * scaleX,
        y: pixelCrop.y * scaleY,
        width: pixelCrop.width * scaleX,
        height: pixelCrop.height * scaleY,
      })
    },
    [onCropComplete]
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <ButtonGroup>
          {ASPECT_OPTIONS.map(option => (
            <Button
              key={option.label}
              type="button"
              size="sm"
              variant={aspect === option.value ? "default" : "outline"}
              onClick={() => handleAspectChange(option.value)}
              className="shrink-0"
            >
              {option.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      <div className="flex justify-center rounded-lg border border-border bg-muted">
        <ReactCrop
          crop={crop}
          aspect={aspect}
          onChange={handleCropChange}
          onComplete={handleCropComplete}
        >
          <img
            ref={imgRef}
            src={image}
            alt="Photo to crop"
            onLoad={handleImageLoad}
            style={{ maxHeight: "70vh", maxWidth: "100%", width: "auto", height: "auto" }}
          />
        </ReactCrop>
      </div>
    </div>
  )
}
