import clsx from 'clsx';
import type { FC, HTMLAttributes, PropsWithChildren } from 'react';
import Input from './input/Input';

interface Props {
  value: string;
  selected: boolean;
}

export const SelectItem: FC<HTMLAttributes<HTMLDivElement> & Props> = (({ children, className, ...props }) => (
  <div
    {...props}
    className={clsx(
      "relative group/item flex w-full cursor-default select-none items-center rounded-lg py-3 px-4 transition-all data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      props.selected && "bg-accent text-accent-foreground",
      "bg-white hover:bg-[#F7F8F9] cursor-pointer animate-in fade-in slide-in-from-bottom-6",
      className
    )}
    role="option"
    aria-selected={props.selected}
  >
    <div className="text-xl font-medium group-hover/item:font-bold inline-block mr-auto flex-1 truncated">{children}</div>
    <span
      className={clsx('flex items-center justify-center opacity-0 transition-opacity duration-300', props.selected && 'opacity-100')}>
      <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm5.736 7.406-6.468 6.468a.906.906 0 0 1-1.28 0L4.264 10.15a.905.905 0 0 1 1.28-1.28l3.084 3.084 5.828-5.828a.905.905 0 0 1 1.28 1.28z"
          fill="var(--fp-primary)"/>
      </svg>
    </span>
  </div>
));

type SelectSearchProps = { listClassName?: string, keyword: string, onKeywordChange: (event: string) => void }

export const SelectSearch: FC<PropsWithChildren<SelectSearchProps>> = ({ keyword, onKeywordChange, listClassName, children }) => {
  return (
    <div className="w-full max-w-full md:w-[544px]">
      <div className={"relative z-10"}>
        <Input
          label={""} placeholder={"Search"}
          className="mt-4 [&_input]:!mb-px" name="keyword" value={keyword}
          onValueChange={onKeywordChange}
        />
        <svg className={"absolute top-1/2 right-4 text-gray-400"} width="22" height="22" style={{
          transform: "translateY(-50%)",
        }}
             viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22 20.1706L18.4098 16.7702C20.124 14.988 21.1708 12.6203 21.1708 10.0251C21.1708 4.49719 16.4221 0 10.5855 0C4.74892 0 0 4.4974 0 10.0253C0 15.5533 4.7487 20.0505 10.5853 20.0505C12.6964 20.0505 14.6634 19.4599 16.3168 18.4472L20.0684 22L22 20.1706ZM2.73176 10.0253C2.73176 5.92404 6.25482 2.58741 10.5853 2.58741C14.9158 2.58741 18.4388 5.92404 18.4388 10.0253C18.4388 14.1266 14.916 17.4633 10.5855 17.4633C6.25505 17.4633 2.73176 14.1266 2.73176 10.0253Z"
            fill="#00112C"/>
        </svg>
      </div>

      <div className={clsx("overflow-y-scroll list-container relative -mt-px", listClassName)}>
        <div className="pt-4 h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SelectSearch;
