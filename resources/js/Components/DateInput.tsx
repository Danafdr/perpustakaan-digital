import { useState, useEffect } from 'react';
import SelectInput from './SelectInput';

interface DateInputProps {
    value?: Date | null;
    onChange: (date: Date | null) => void;
    className?: string;
}

export default function DateInput({ value, onChange, className = '' }: DateInputProps) {
    const [month, setMonth] = useState<number | null>(value ? value.getMonth() : null);
    const [day, setDay] = useState<number | null>(value ? value.getDate() : null);
    const [year, setYear] = useState<number | null>(value ? value.getFullYear() : null);

    // Update internal state when value prop changes
    useEffect(() => {
        if (value) {
            setMonth(value.getMonth());
            setDay(value.getDate());
            setYear(value.getFullYear());
        } else {
            setMonth(null);
            setDay(null);
            setYear(null);
        }
    }, [value]);

    // Update parent when internal state changes
    const updateDate = (m: number | null, d: number | null, y: number | null) => {
        if (m !== null && d !== null && y !== null) {
            const newDate = new Date(y, m, d);
            // Check for invalid dates (e.g., Feb 31)
            if (newDate.getMonth() !== m) {
                // Adjust to last day of valid month if overflow
                const lastDay = new Date(y, m + 1, 0).getDate();
                const adjustedDate = new Date(y, m, lastDay);
                onChange(adjustedDate);
            } else {
                onChange(newDate);
            }
        } else {
            onChange(null);
        }
    };

    const handleMonthChange = (newMonth: number) => {
        setMonth(newMonth);
        updateDate(newMonth, day, year);
    };

    const handleDayChange = (newDay: number) => {
        setDay(newDay);
        updateDate(month, newDay, year);
    };

    const handleYearChange = (newYear: number) => {
        setYear(newYear);
        updateDate(month, day, newYear);
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
        <div className={`flex gap-2 ${className}`}>
            <SelectInput
                options={months.map((m, i) => ({ value: i, label: m }))}
                value={month}
                onChange={handleMonthChange}
                placeholder="Month"
                className="w-1/3"
            />
            <SelectInput
                options={days.map(d => ({ value: d, label: d.toString() }))}
                value={day}
                onChange={handleDayChange}
                placeholder="Day"
                className="w-1/4"
            />
            <SelectInput
                options={years.map(y => ({ value: y, label: y.toString() }))}
                value={year}
                onChange={handleYearChange}
                placeholder="Year"
                className="w-1/3"
            />
        </div>
    );
}
