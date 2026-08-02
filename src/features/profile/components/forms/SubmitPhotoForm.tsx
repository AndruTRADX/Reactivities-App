import { useCallback, useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@sharedUi/card"
import { FieldGroup } from "@sharedUi/field"
import { Button } from "@sharedUi/button"
import { Spinner } from "@sharedUi/spinner"
import DropZone from "@sharedForms/DropZone"
import ImageCropper from "@/shared/components/common/ImageCropper"

import { AddPhotoRequestSchema } from "@profile/schema/request/AddPhotoRequest"
import { useAddPhotoProfile } from "@profile/hooks/api/useProfile"
import { getCroppedImageFile, type CropArea } from "@/shared/lib/cropImage"

type Step = 1 | 2 | 3

const STEP_LABELS: Record<Step, string> = {
  1: "Choose a photo to upload.",
  2: "Pick a shape, then drag the handles to resize the crop.",
  3: "Review your photo before submitting.",
}

interface Props {
  onSuccess?: () => void
}

export default function SubmitPhotoForm({ onSuccess }: Props) {
  const { addPhotoAsync, isPendingAddPhoto } = useAddPhotoProfile()

  const [step, setStep] = useState<Step>(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null)
  const [croppedFile, setCroppedFile] = useState<File | null>(null)
  const [isGeneratingCrop, setIsGeneratingCrop] = useState(false)

  const form = useForm({
    resolver: zodResolver(AddPhotoRequestSchema),
    mode: "onTouched",
  })

  const {
    formState: { isValid, isSubmitting: isSubmittingForm },
    control,
    watch,
  } = form

  const rawFile = watch("file")

  const rawImageUrl = useMemo(() => (rawFile ? URL.createObjectURL(rawFile) : null), [rawFile])
  const croppedImageUrl = useMemo(
    () => (croppedFile ? URL.createObjectURL(croppedFile) : null),
    [croppedFile]
  )

  useEffect(() => {
    return () => {
      if (rawImageUrl) URL.revokeObjectURL(rawImageUrl)
    }
  }, [rawImageUrl])

  useEffect(() => {
    return () => {
      if (croppedImageUrl) URL.revokeObjectURL(croppedImageUrl)
    }
  }, [croppedImageUrl])

  const handleReset = useCallback(() => {
    form.reset()
    setStep(1)
    setCroppedAreaPixels(null)
    setCroppedFile(null)
  }, [form])

  const handleContinueToCrop = useCallback(async () => {
    const valid = await form.trigger("file")
    if (valid) setStep(2)
  }, [form])

  const handleCropAreaChange = useCallback((area: CropArea) => {
    setCroppedAreaPixels(area)
  }, [])

  const handleConfirmCrop = useCallback(async () => {
    if (!rawFile || !rawImageUrl || !croppedAreaPixels) return

    setIsGeneratingCrop(true)
    try {
      const cropped = await getCroppedImageFile(rawImageUrl, croppedAreaPixels, rawFile.name)
      setCroppedFile(cropped)
      setStep(3)
    } finally {
      setIsGeneratingCrop(false)
    }
  }, [rawFile, rawImageUrl, croppedAreaPixels])

  const handleSubmitPhoto = useCallback(async () => {
    if (!croppedFile) return

    await addPhotoAsync(
      { file: croppedFile },
      {
        onSuccess: () => {
          toast.success("Photo updated successfully")
          handleReset()
          onSuccess?.()
        },
      }
    )
  }, [croppedFile, addPhotoAsync, handleReset, onSuccess])

  const isSubmitting = useMemo(() => {
    return isPendingAddPhoto || isSubmittingForm
  }, [isPendingAddPhoto, isSubmittingForm])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Submit Photo — Step {step} of 3</CardTitle>
        <CardDescription>{STEP_LABELS[step]}</CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <form id="submit-photo-form">
            <FieldGroup>
              <DropZone control={control} name="file" accept="image/jpeg,image/png" />
            </FieldGroup>
          </form>
        )}

        {step === 2 && rawImageUrl && (
          <ImageCropper image={rawImageUrl} onCropComplete={handleCropAreaChange} />
        )}

        {step === 3 && croppedImageUrl && (
          <div className="flex justify-center">
            <img
              src={croppedImageUrl}
              alt="Cropped preview"
              className="max-h-[60vh] max-w-full rounded-lg border border-border object-contain"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2 justify-end">
        {step === 1 && (
          <>
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button type="button" onClick={handleContinueToCrop} disabled={!isValid}>
              Next
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              type="button"
              onClick={handleConfirmCrop}
              disabled={!croppedAreaPixels || isGeneratingCrop}
            >
              {isGeneratingCrop ? (
                <>
                  <Spinner /> Cropping
                </>
              ) : (
                "Next"
              )}
            </Button>
          </>
        )}

        {step === 3 && (
          <>
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button type="button" onClick={handleSubmitPhoto} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner /> Submitting
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
