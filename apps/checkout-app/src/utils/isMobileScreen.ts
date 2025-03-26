function isMobileScreen(): boolean {
  const mediaQuery = globalThis?.window?.matchMedia('(max-width: 640px)');
  return mediaQuery?.matches;
}
export default isMobileScreen;
