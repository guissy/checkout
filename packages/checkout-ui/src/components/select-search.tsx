import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";
import SearchIcon from '@/components/svg/SearchIcon.svg';

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  value: string;
  selected: boolean;
}

const SelectItem: React.FC<SelectItemProps> = ({
  className,
  children,
  selected,
  ...props
}) => (
  <div
    ref={props.ref}
    className={cn(
      "relative flex w-full cursor-default items-center rounded-md py-3 px-4 text-sm transition-colors",
      "focus:bg-accent focus:text-accent-foreground",
      selected ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
      className
    )}
    role="option"
    aria-selected={selected}
    {...props}
  >
    <div className="flex-1 truncate font-medium">{children}</div>
    <Check
      className={cn(
        "ml-2 h-5 w-5 opacity-0 transition-opacity",
        selected && "opacity-100"
      )}
    />
  </div>
);

interface SelectSearchProps {
  className?: string;
  listClassName?: string;
  keyword: string;
  onKeywordChange: (value: string) => void;
  children?: React.ReactNode;
  placeholder?: string;
}

const SelectSearch = ({
  keyword,
  onKeywordChange,
  listClassName,
  className,
  children,
  placeholder,
}: SelectSearchProps) => {
  return (
    <div className={cn("w-full max-w-full md:w-[544px]", className)}>
      <div className="relative z-10 mb-2 px-4">
        <Input
          placeholder={placeholder}
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className="h-12 pl-4 pr-12"
        />
        <SearchIcon className="absolute right-8 top-3 text-muted-foreground" />
      </div>

      <ScrollArea className={cn("h-[300px] px-4", listClassName)}>
        <div className="space-y-1 pb-2">{children}</div>
      </ScrollArea>
    </div>
  );
};


export { SelectItem, SelectSearch };
