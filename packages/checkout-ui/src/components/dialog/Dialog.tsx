import React, { type PropsWithChildren, useCallback, useEffect } from "react";
import clsx from "clsx";
import useDialog from "./useDialog";
import { SpinnerCycle as LoadingSpin } from "../../index";
import { Trans } from "@lingui/react";

type Props = {
  open: boolean;
  onClose: (() => void) | undefined;
  id: string;
  closeOnOverlayClick?: boolean;
  onSubmit?: () => void;
};
const Dialog: React.FC<PropsWithChildren<Props>> = ({
  open,
  onClose,
  children,
  id,
  closeOnOverlayClick = true,
  onSubmit,
}) => {
  const shouldRender = useDialog(open, 300);
  const [loading, setLoading] = React.useState(false);
  const onCallback = useCallback(
    async (e: React.SyntheticEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setLoading(true);
      await onSubmit?.();
      setLoading(false);
    },
    [onSubmit]
  );

  useEffect(() => {
    if (shouldRender) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [shouldRender]);

  if (!shouldRender) return <dialog className={"sr-only"} id={id} />;

  return (
    <form onSubmit={onCallback}>
      <div
        className={clsx(
          "fixed inset-0 z-50 flex items-center justify-center duration-300",
          open ? "animate-in fade-in" : "animate-out fade-out"
        )}
        style={{ animationFillMode: "forwards" }}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        id={id}
      >
        <div
          className={clsx(
            "absolute inset-0 bg-black opacity-50",
            open ? "opacity-50" : "opacity-0"
          )}
          onClick={closeOnOverlayClick ? onClose : undefined}
        ></div>
        <div className="bg-white mx-6 px-4 sm:px-6 py-4 sm:py-8 rounded-lg shadow-lg z-10 relative max-sm:w-full transform -translate-y-4">
          {children}
          {onSubmit && (
            <button
              type={"submit"}
              disabled={loading}
              onClick={onCallback}
              id={"pay-btn"}
              className={clsx(
                "mt-4 flex space-x-3 items-center justify-center w-full px-3 py-1.5 transition-colors",
                "text-base sm:text-lg font-bold text-white bg-primary hover:bg-primary/70",
                "rounded-full shadow-sm focus:outline-none focus:border-primary"
              )}
            >
              {loading ? (
                <LoadingSpin className={"size-[24px] sm:size-[28px]"} />
              ) : (
                <span>
                  <Trans id="dialog.otp_btn"></Trans>
                </span>
              )}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              className={clsx(
                "border-2 text-white w-10 h-10 rounded-full flex items-center justify-center",
                "absolute -bottom-6 right-1/2 left-1/2 transform -translate-x-1/2 translate-y-full disabled:hidden"
              )}
              onClick={onClose}
              aria-label="close"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 15 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.1263 13.6269C13.6292 14.1244 12.8195 14.1244 12.3212 13.6269L0.887147 2.18495C0.390014 1.68635 0.388881 0.87724 0.887147 0.378631C1.38315 -0.119978 2.19283 -0.119978 2.69336 0.378631L14.1263 11.8194C14.6234 12.3203 14.6257 13.1283 14.1263 13.6269ZM14.1127 2.17929L2.67977 13.6201C2.18037 14.1198 1.37182 14.1198 0.873558 13.6201C0.375292 13.1226 0.375292 12.3146 0.874691 11.8138L12.3076 0.374098C12.807 -0.12451 13.6167 -0.12451 14.1127 0.372965C14.6121 0.871574 14.6098 1.68068 14.1127 2.17929Z"
                  fill="white"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default Dialog;
