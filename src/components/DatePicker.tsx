import { Calendar } from 'lucide-react'

interface DatePickerProps {
    value: string
    onChange?: (value: string) => void
}

export default function DatePicker({ value }: DatePickerProps) {
    return (
        <button className="date-picker">
            <Calendar size={16} />
            <span>{value}</span>
        </button>
    )
}
