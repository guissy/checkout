'use client';

import React, { useRef, useState } from 'react';

type AnimationDuration = {
  open: number;
  close: number;
};

const useAnimateDetails = (detailRef: React.RefObject<HTMLDetailsElement | null>) => {
  const [isPending, setIsPending] = useState(false);
  const contentHeight = useRef<number | null>(null);
  const duration: AnimationDuration = {
    open: 200,
    close: 150,
  };

  const getContentHeight = () => {
    if (contentHeight.current !== null) {
      return contentHeight.current;
    }

    if (detailRef.current?.open) {
      contentHeight.current = detailRef.current?.offsetHeight;
      return contentHeight.current;
    }
  };

  const parseAnimationFrames = (property: string, ...frames: string[]) => {
    return frames.map((frame) => ({ [property]: frame }));
  };

  const getKeyframes = (open: boolean) => {
    const frames = parseAnimationFrames("maxHeight", "0px", `${getContentHeight()}px`);
    return open ? frames : [...frames].reverse();
  };

  const animate = (open: boolean, duration: number) => {
    setIsPending(true);
    const frames = getKeyframes(open);
    const animation = detailRef.current?.querySelector('summary')?.nextElementSibling?.animate(frames, {
      duration,
      easing: "ease-out",
    });
    // detailRef.current?.classList.add("details-animating");

    animation?.finished.catch(() => {
    }).finally(() => {
      setIsPending(false);
      // detailRef.current?.classList.remove("details-animating");
      if (!open) {
        detailRef.current?.removeAttribute("open");
      }
    });
  };

  const open = () => {
    if (contentHeight.current) {
      animate(true, duration.open);
    } else {
      requestAnimationFrame(() => animate(true, duration.open));
    }
  };

  const close = () => {
    animate(false, duration.close);
  };

  const preferAnimation = () => {
    return "matchMedia" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  return ((event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const badElement = event.target instanceof Element && (event.target.closest("a[href]") || !event.target.closest("summary"));
    if (badElement || !preferAnimation()) {
      return;
    }

    if (isPending) {
      // No need to cancel the animation since it's controlled by React's state
    } else if (detailRef.current?.open) {
      // if (!isLabel) {
        event.preventDefault();
      // }
      close();
    } else {
      open();
    }
  });
}

export default useAnimateDetails;
