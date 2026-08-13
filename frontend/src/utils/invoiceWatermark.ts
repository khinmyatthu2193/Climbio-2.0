import type { WatermarkPosition, WatermarkSize } from '@/types/auth';

export const watermarkSizes = {
  SMALL: { pdf: 150, emojiPdf: 68, html: 'size-40', emojiHtml: 'text-7xl' },
  MEDIUM: { pdf: 230, emojiPdf: 100, html: 'size-64', emojiHtml: 'text-9xl' },
  LARGE: { pdf: 310, emojiPdf: 132, html: 'size-80', emojiHtml: 'text-[10rem]' },
} satisfies Record<WatermarkSize, { pdf: number; emojiPdf: number; html: string; emojiHtml: string }>;

export const htmlWatermarkPositions: Record<WatermarkPosition, string> = {
  TOP_LEFT: 'left-10 top-28', TOP_CENTER: 'left-1/2 top-28 -translate-x-1/2', TOP_RIGHT: 'right-10 top-28',
  CENTER_LEFT: 'left-10 top-1/2 -translate-y-1/2', CENTER: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2', CENTER_RIGHT: 'right-10 top-1/2 -translate-y-1/2',
  BOTTOM_LEFT: 'bottom-24 left-10', BOTTOM_CENTER: 'bottom-24 left-1/2 -translate-x-1/2', BOTTOM_RIGHT: 'bottom-24 right-10',
};

export function getPdfWatermarkPosition(position: WatermarkPosition, size: number) {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 42;
  const horizontal = position.endsWith('LEFT') ? margin : position.endsWith('RIGHT') ? pageWidth - margin - size : (pageWidth - size) / 2;
  const vertical = position.startsWith('TOP') ? 105 : position.startsWith('BOTTOM') ? pageHeight - 105 - size : (pageHeight - size) / 2;
  return { left: horizontal, top: vertical };
}
