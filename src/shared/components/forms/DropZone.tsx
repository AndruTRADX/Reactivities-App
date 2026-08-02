import { useEffect, useMemo, useRef, useState } from "react"
import { type FieldValues, useController, type UseControllerProps } from "react-hook-form"
import { HugeiconsIcon } from "@hugeicons/react"
import { CloudUploadIcon, Delete02Icon, File01Icon } from "@hugeicons/core-free-icons"

import { Field, FieldLabel, FieldDescription, FieldError } from "@sharedUi/field"
import { cn } from "@/shared/lib/utils"

type BaseProps<T extends FieldValues> = {
  label?: string
  description?: string
  accept?: string
  disabled?: boolean
} & UseControllerProps<T>

type DropZoneProps<T extends FieldValues> = BaseProps<T> &
  ({ multiple?: false } | { multiple: true })

function matchesAccept(file: File, accept?: string) {
  if (!accept) return true

  return accept.split(",").some(pattern => {
    const trimmed = pattern.trim().toLowerCase()
    if (!trimmed) return true
    if (trimmed.startsWith(".")) return file.name.toLowerCase().endsWith(trimmed)
    if (trimmed.endsWith("/*")) return file.type.startsWith(trimmed.slice(0, -1))
    return file.type.toLowerCase() === trimmed
  })
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const IMAGE_EXTENSION_PATTERN = /\.(jpe?g|png|gif|webp|bmp|avif|svg)$/i

function isImageFile(file: File) {
  if (file.type.startsWith("image/")) return true
  return IMAGE_EXTENSION_PATTERN.test(file.name)
}

function FilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [failedPreviewUrl, setFailedPreviewUrl] = useState<string | null>(null)

  const previewUrl = useMemo(() => (isImageFile(file) ? URL.createObjectURL(file) : null), [file])
  const previewFailed = previewUrl !== null && previewUrl === failedPreviewUrl

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  return (
    <div className="flex items-center gap-3 rounded-lg border border-input bg-input/30 px-3 py-2">
      {previewUrl && !previewFailed ? (
        <img
          src={previewUrl}
          alt={file.name}
          className="size-10 shrink-0 rounded-md object-cover"
          onError={() => setFailedPreviewUrl(previewUrl)}
        />
      ) : (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
          <HugeiconsIcon icon={File01Icon} className="size-5 text-muted-foreground" />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{file.name}</span>
        <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <HugeiconsIcon icon={Delete02Icon} className="size-4" />
      </button>
    </div>
  )
}

export default function DropZone<T extends FieldValues>({
  label,
  description,
  accept,
  multiple = false,
  disabled,
  ...props
}: DropZoneProps<T>) {
  const {
    field: { onChange, onBlur, value, ref },
    fieldState: { error },
  } = useController(props)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const files: File[] = multiple ? ((value as File[]) ?? []) : value ? [value as File] : []

  const addFiles = (incoming: FileList | File[]) => {
    const accepted = Array.from(incoming).filter(file => matchesAccept(file, accept))
    if (accepted.length === 0) return

    onChange(multiple ? [...files, ...accepted] : accepted[0])
    onBlur()
  }

  const removeFile = (index: number) => {
    onChange(multiple ? files.filter((_, i) => i !== index) : null)
    onBlur()
  }

  const openFileDialog = () => {
    if (!disabled) inputRef.current?.click()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)
    if (disabled) return
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!disabled) setIsDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files)
    e.target.value = ""
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      openFileDialog()
    }
  }

  return (
    <Field className="mb-3">
      {label && <FieldLabel htmlFor={props.name}>{label}</FieldLabel>}
      {description && <FieldDescription>{description}</FieldDescription>}

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-invalid={!!error}
        aria-disabled={disabled}
        onClick={openFileDialog}
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onBlur={onBlur}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-input/30 px-4 py-8 text-center transition-colors outline-none",
          "hover:bg-input/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          isDragActive && "border-ring bg-primary/5",
          disabled && "pointer-events-none cursor-not-allowed opacity-50"
        )}
      >
        <HugeiconsIcon
          icon={CloudUploadIcon}
          className={cn("size-8 text-muted-foreground", isDragActive && "text-primary")}
        />
        <p className="text-sm text-foreground">
          <span className="font-medium text-primary">Click to upload</span> or drag and drop
        </p>
        {accept && <p className="text-xs text-muted-foreground">{accept}</p>}

        <input
          id={props.name}
          ref={el => {
            inputRef.current = el
            ref(el)
          }}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
          className="sr-only"
        />
      </div>

      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((file, index) => (
            <FilePreview
              key={`${file.name}-${index}`}
              file={file}
              onRemove={() => removeFile(index)}
            />
          ))}
        </div>
      )}

      {error && <FieldError>{error.message}</FieldError>}
    </Field>
  )
}
