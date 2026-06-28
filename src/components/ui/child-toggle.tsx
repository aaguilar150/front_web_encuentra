import { Baby, Check } from "lucide-react"
import { Button } from "./button"

interface ChildToggleProps {
  value: boolean
  onChange: (value: boolean) => void
}

export default function ChildToggle({ value, onChange }: ChildToggleProps) {
  return (
    <Button
      type="button"
      variant={value ? "toggleOn" : "toggleOff"}
      size="sm"
      onClick={() => onChange(!value)}
      aria-pressed={value}
      id="btn-toggle-child"
    >
      {value ? <Check size={18} /> : <Baby size={18} />}
      {value ? "MENOR PROTEGIDO" : "SÍ, ES MENOR"}
    </Button>
  )
}
