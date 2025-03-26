// global.d.ts
declare global {
  interface Window {
    indexStartTime?: number;
  }
}

// svg.d.ts
declare module "*.svg?raw" {
  const content: string;
  export default content;
}
// svg.d.ts
declare module "*.svg?url" {
  const content: string;
  export default content;
}