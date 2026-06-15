import type { ReactNode } from "react"

export default function FormWrapper({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-center h-full pb-20">{children}</div>
}
