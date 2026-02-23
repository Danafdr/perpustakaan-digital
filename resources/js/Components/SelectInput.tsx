import { Fragment, useState, useEffect, useRef } from 'react';
import { Transition } from '@headlessui/react';

interface SelectOption {
    value: string | number;
    label: string;
}

interface SelectInputProps {
    options: SelectOption[];
    value: string | number | null;
    onChange: (value: any) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export default function SelectInput({
    options,
    value,
    onChange,
    placeholder = 'Select',
    className = '',
    disabled = false
}: SelectInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = value !== null
        ? options.find(o => o.value === value)?.label
        : placeholder;

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={
                    `w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ` +
                    (disabled ? 'opacity-50 cursor-not-allowed' : '')
                }
            >
                <span className={`block truncate ${value === null ? 'text-gray-400' : ''}`}>{selectedLabel}</span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </span>
            </button>

            <Transition
                show={isOpen}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 shadow-xl max-h-60 rounded-xl py-1 text-base ring-1 ring-black/5 dark:ring-white/10 overflow-auto focus:outline-none sm:text-sm custom-scrollbar">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`cursor-pointer select-none relative py-2.5 pl-3 pr-9 border-b border-gray-50 dark:border-gray-700/50 last:border-0 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 ${value === option.value ? 'font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' : 'text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            <span className={`block truncate ${value === option.value ? 'font-medium' : 'font-normal'}`}>
                                {option.label}
                            </span>
                            {value === option.value && (
                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 hover:text-white">
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </Transition>
        </div>
    );
}
