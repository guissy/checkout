import React from 'react';

export function hideLoading(selfRef?: React.RefObject<HTMLDivElement | null>): void {
  const article = selfRef?.current?.closest('article') ?? document.querySelector('article.fp-checkout-article') as HTMLDivElement;
  if (article) {
    article.style.setProperty('--fp-checkout-display', 'none');
    (article.firstElementChild as HTMLElement)?.style.setProperty('display', 'none');
  }
}


export function showLoading(selfRef?: React.RefObject<HTMLDivElement>): void {
  const article = selfRef?.current?.closest('article') ?? document.querySelector('article.fp-checkout-article') as HTMLDivElement;
  if (article) {
    article.style.setProperty('--fp-checkout-display', 'grid');
    (article.firstElementChild as HTMLElement)?.style.setProperty('display', 'grid');
  }
}
