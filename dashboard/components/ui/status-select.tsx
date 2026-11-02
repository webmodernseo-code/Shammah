import { Fragment } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { ChevronDown } from "../../icons";
import { cn } from "@/lib/utils";

export interface Option {
  label: string;
  value: string | number;
}

interface StatusSelectProps {
  value: Option | null;
  onChange: (value: Option | null) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export default function StatusSelect({
  value,
  onChange,
  options,
  placeholder = "Select status",
  className,
}: StatusSelectProps) {
  return (
    <div className={cn("relative z-20", className)}>
      <Listbox value={value} onChange={onChange}>
        {({ open }) => (
          <div className="relative">
            <ListboxButton className="relative h-8 flex items-center justify-between w-full cursor-pointer rounded-xl border border-primary/30 text-xs font-bold bg-primary-lighter/60 text-primary px-3 py-1.5 text-left focus:outline-none transition-all shadow-2xs hover:bg-primary-lighter">
              <span className="block truncate font-bold mr-1.5">
                {value ? value.label : placeholder}
              </span>
              <span className="pointer-events-none flex items-center">
                <ChevronDown
                  className={`h-4 w-4 text-primary transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </span>
            </ListboxButton>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ListboxOptions className="absolute right-0 mt-1 max-h-60 w-full min-w-25 max-w-full overflow-auto rounded-xl bg-white p-1 py-1 ring-1 ring-gray-500/20 focus:outline-none z-50">
                {options.map((option, idx) => (
                  <ListboxOption
                    key={idx}
                    className={({ active, selected }) =>
                      `relative cursor-pointer select-none rounded-lg px-4 py-2 text-sm transition-colors ${
                        active
                          ? "bg-primary-lighter/20 text-primary-dark"
                          : "text-gray-700"
                      } ${selected ? " text-primary-dark" : "font-medium"}`
                    }
                    value={option}
                  >
                    {({ selected }) => (
                      <span className={`block truncate`}>{option.label}</span>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Transition>
          </div>
        )}
      </Listbox>
    </div>
  );
}
