export const WORD_CLOUD_MIN_FONT = 14;
export const WORD_CLOUD_MAX_FONT = 52;
export const WORD_CLOUD_MIN_SCALE = 0.35;

export type WordCloudSizingInput = {
  count: number;
  minCount: number;
  maxCount: number;
  fitScale: number;
};

export function computeWordFontSize({
  count,
  minCount,
  maxCount,
  fitScale,
}: WordCloudSizingInput) {
  if (maxCount === minCount) {
    return ((WORD_CLOUD_MIN_FONT + WORD_CLOUD_MAX_FONT) / 2) * fitScale;
  }

  const ratio = (count - minCount) / (maxCount - minCount);
  return (WORD_CLOUD_MIN_FONT + ratio * (WORD_CLOUD_MAX_FONT - WORD_CLOUD_MIN_FONT)) * fitScale;
}

export function computeOverflowScale(
  contentWidth: number,
  contentHeight: number,
  containerWidth: number,
  containerHeight: number,
  currentScale: number,
) {
  if (contentWidth <= 0 || contentHeight <= 0) {
    return currentScale;
  }

  const padding = 16;
  const availWidth = Math.max(containerWidth - padding, 1);
  const availHeight = Math.max(containerHeight - padding, 1);

  if (contentWidth <= availWidth && contentHeight <= availHeight) {
    return currentScale;
  }

  const scaleWidth = availWidth / contentWidth;
  const scaleHeight = availHeight / contentHeight;
  const nextScale = Math.min(scaleWidth, scaleHeight, currentScale) * 0.95;

  return Math.max(WORD_CLOUD_MIN_SCALE, nextScale);
}
