export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", reject)
    image.setAttribute("crossOrigin", "anonymous")
    image.src = src
  })
}

export async function getCroppedImageFile(
  imageSrc: string,
  crop: CropArea,
  fileName: string,
  mimeType = "image/jpeg"
): Promise<File> {
  const image = await loadImage(imageSrc)

  const x = Math.round(crop.x)
  const y = Math.round(crop.y)
  const width = Math.round(crop.width)
  const height = Math.round(crop.height)

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Could not get canvas context")

  ctx.drawImage(image, x, y, width, height, 0, 0, width, height)

  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, mimeType, 0.92))
  if (!blob) throw new Error("Could not generate cropped image")

  return new File([blob], fileName, { type: mimeType })
}
