import React, {
  type ComponentType,
  type PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";
import "./Input.css";
import clsx from "clsx";
import { camelToPascalWithSpaces } from "./camelToPascalWithSpaces";

export type InputProps = {
  type?: string;
  name?: string;
  className?: string;
  label?: string | React.ReactElement;
  placeholder?: string;
  invalid?: boolean;
  required?: boolean;
  onInput?: () => void;
  labelWrap?: ComponentType;
  value?: string;
  onValueChange?: (value: string) => void;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: (value: string) => string;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  layout?: "mui" | "antd";
  onFocus?: () => void;
  autoFocus?: boolean;
  autoComplete?: string;
};
const Input: React.FC<InputProps> = ({
  value: initialValue,
  type,
  name,
  label,
  placeholder,
  labelWrap,
  invalid = false,
  required = false,
  onValueChange,
  onBlur,
  className,
  format,
  pattern,
  minLength,
  maxLength,
  layout = "antd",
  onFocus,
  autoFocus,
  autoComplete,
}) => {
  const [value, setValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    // const val = event.target.value.trim();
    // setValue(val);
    // onValueChange && onValueChange(val);
    if (onBlur) {
      onBlur(event);
    }
    // if (name) {
    //   void reportEvent(`input_${camelCase(name ?? label as string)}`, { value: val });
    // }
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    setValue(val);
    if (onValueChange) {
      onValueChange(val);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (autoComplete === "cc-number") {
      event.preventDefault();
      const pastedText = event.clipboardData
        .getData("Text")
        .replace(/\s+/g, "");
      setValue(pastedText);
      if (onValueChange) {
        onValueChange(pastedText);
      }
    }
  };

  const LabelComponent = labelWrap || "span";

  return (
    <div className={className}>
      <div className="relative [--border:218,11%,82%] [--normal-c:hsl(var(--foreground)] [--place:theme(colors.place)] [--focus-c:theme(colors.primary)]">
        {layout === "antd" && !!label && (
          <label
            htmlFor={name}
            className={clsx(
              "text-sm/[1] transition-all duration-200 px-1 pointer-events-none mb-2 block font-bold",
              isFocused ? "text-[--focus-c]" : ""
            )}
          >
            <LabelComponent>
              {typeof label === "string"
                ? camelToPascalWithSpaces(label ?? "")
                : label}
            </LabelComponent>
          </label>
        )}
        <input
          ref={inputRef}
          type={type}
          className={clsx(
            "w-full px-3 py-[6px] rounded-md focus:outline-none transition-all duration-300",
            "border border-[theme(colors.border)]",
            !invalid &&
              "focus:ring-1 focus:border-[--focus-c] focus:ring-[--focus-c] focus-visible:ring-[--focus-c] appearance-none",
            !invalid &&
              "hover:ring-1 hover:border-[--focus-c] hover:ring-[--focus-c] appearance-none",
            invalid &&
              "bg-[#FFF5F5] border-destructive ring-1 ring-destructive",
            "disabled:cursor-not-allowed disabled:opacity-50 peer"
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleInput}
          onPaste={handlePaste}
          value={format ? format(value ?? "") : value}
          name={name}
          required={value ? false : required}
          minLength={minLength}
          maxLength={maxLength}
          data-pattern={pattern}
          id={name}
          placeholder={placeholder as unknown as string}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
        />
        {layout === "mui" && (
          <label
            htmlFor={name}
            className={clsx(
              "absolute left-[0.5em] text-base transform origin-left transition-all duration-200 px-1 pointer-events-none bg-transparent",
              (isFocused || value) &&
                "bg-gradient-to-b from-transparent peer-autofill:to-[#E7F0FE]",
              (isFocused || value) && invalid
                ? "via-[#FFF5F5] to-[#FFF5F5]"
                : "via-white to-white",
              isFocused || value
                ? "top-0 -translate-y-1/2 scale-[0.8] text-[--focus-c]"
                : "top-1/2 -translate-y-1/2 text-(--place)"
            )}
          >
            <LabelComponent>
              {typeof label === "string"
                ? camelToPascalWithSpaces(label ?? "")
                : label}
            </LabelComponent>
          </label>
        )}
      </div>
    </div>
  );
};

export const InputError: React.FC<PropsWithChildren> = ({ children }) => (
  <span className="empty:invisible text-destructive text-sm transition-colors duration-300 block min-h-6">
    {children}
  </span>
);

export default Input;
