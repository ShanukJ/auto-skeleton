import type { ElementMeasurement, SkeletonConfig } from './types';

function hasSkeletonOff(node: HTMLElement | null): boolean {
  if (!node) return false
  if (node.hasAttribute?.('data-no-skeleton')) return true
  return hasSkeletonOff(node.parentElement)
}


export function traverseAndMeasure(
  element: HTMLElement,
  config: SkeletonConfig,
  depth = 0
): ElementMeasurement | null {
  if (depth > config.maxDepth) return null;
  if (hasSkeletonOff(element)) {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    const attributes: Record<string, string> = {};
    for (const attr of element.attributes) {
      attributes[attr.name] = attr.value;
    }

    return {
      rect,
      style,
      tagName: element.tagName,
      textContent: element.textContent,
      attributes,
      children: [],
      passthrough: true,
      passthroughHtml: element.outerHTML,
    };
  }

  // Check ignore selectors
  for (const selector of config.ignoreSelectors) {
    if (element.matches(selector)) return null;
  }

  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);

  // Special handling for IMG elements - detect dimensions from CSS/attributes, not actual render
  const isImage = element.tagName === 'IMG';
  const imgElement = isImage ? (element as HTMLImageElement) : null;

  // Check both the attribute value and the resolved src property
  // An empty src="" attribute gets resolved to window.location.href by the browser
  const srcAttribute = imgElement?.getAttribute('src');
  const resolvedSrc = imgElement?.src || '';

  // Detect if this is an image without a valid source
  // Key insight: naturalWidth/naturalHeight are 0 when:
  // - src is empty/missing
  // - src failed to load
  // - image hasn't loaded yet
  const hasNoNaturalSize = imgElement?.naturalWidth === 0 || imgElement?.naturalHeight === 0;
  const hasEmptySrc = !srcAttribute || srcAttribute === '';
  const srcIsCurrentPage = resolvedSrc === window.location.href || resolvedSrc.endsWith('/');

  const isEmptyOrLoadingImage = isImage && (hasEmptySrc || srcIsCurrentPage || hasNoNaturalSize);

  let effectiveRect = rect;

  if (isEmptyOrLoadingImage && imgElement) {
    // For images without src, calculate dimensions from CSS, NOT from getBoundingClientRect
    // because the browser may render alt text which affects the measured dimensions

    let finalWidth = 0;
    let finalHeight = 0;

    // Get the parent element for percentage calculations
    const parent = element.parentElement;
    const parentStyle = parent ? window.getComputedStyle(parent) : null;

    // Calculate parent's content width (excluding padding and border)
    let parentContentWidth = 0;
    if (parent) {
      const parentRect = parent.getBoundingClientRect();
      const parentPaddingLeft = parseFloat(parentStyle?.paddingLeft || '0');
      const parentPaddingRight = parseFloat(parentStyle?.paddingRight || '0');
      parentContentWidth = parentRect.width - parentPaddingLeft - parentPaddingRight;
    }

    // Get the raw style values from the element (not computed, to detect percentages)
    const inlineWidth = imgElement.style.width;
    const inlineHeight = imgElement.style.height;

    // Handle height - check inline style first, then computed
    if (inlineHeight && !inlineHeight.includes('%')) {
      const parsed = parseFloat(inlineHeight);
      if (!isNaN(parsed) && parsed > 0) {
        finalHeight = parsed;
      }
    }
    if (finalHeight === 0) {
      // Try computed style (will be in px if explicitly set)
      const computedHeight = parseFloat(style.height);
      // Only use computed height if it looks reasonable (not inflated by alt text)
      // Alt text typically makes height small (line height), CSS height of 200 would be larger
      if (!isNaN(computedHeight) && computedHeight > 50) {
        finalHeight = computedHeight;
      }
    }

    // Handle width - check if it's percentage-based
    if (inlineWidth) {
      if (inlineWidth.includes('%')) {
        const percentage = parseFloat(inlineWidth) / 100;
        if (!isNaN(percentage) && parentContentWidth > 0) {
          finalWidth = parentContentWidth * percentage;
        }
      } else {
        const parsed = parseFloat(inlineWidth);
        if (!isNaN(parsed) && parsed > 0) {
          finalWidth = parsed;
        }
      }
    }

    // If no inline width but parent has width, use parent width (common for width: 100%)
    if (finalWidth === 0 && parentContentWidth > 0) {
      finalWidth = parentContentWidth;
    }

    // Fallback to HTML attributes
    if (finalWidth === 0) {
      const attrWidth = imgElement.getAttribute('width');
      if (attrWidth) finalWidth = parseFloat(attrWidth);
    }
    if (finalHeight === 0) {
      const attrHeight = imgElement.getAttribute('height');
      if (attrHeight) finalHeight = parseFloat(attrHeight);
    }

    // Create effective rect with calculated dimensions (ignore actual rect which has alt text dimensions)
    if (finalWidth > 0 && finalHeight > 0) {
      effectiveRect = {
        x: rect.x,
        y: rect.y,
        width: finalWidth,
        height: finalHeight,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        toJSON: rect.toJSON.bind(rect),
      } as DOMRect;
    }
  }

  // Skip invisible or zero-size elements
  if (
    effectiveRect.width === 0 ||
    effectiveRect.height === 0 ||
    style.display === 'none' ||
    style.visibility === 'hidden'
  ) {
    return null;
  }

  // Collect attributes
  const attributes: Record<string, string> = {};
  for (const attr of element.attributes) {
    attributes[attr.name] = attr.value;
  }

  // Recursively measure children
  const children: ElementMeasurement[] = [];
  for (const child of element.children) {
    if (child instanceof HTMLElement) {
      const measurement = traverseAndMeasure(child, config, depth + 1);
      if (measurement) children.push(measurement);
    }
  }

  return {
    rect: effectiveRect,
    style,
    tagName: element.tagName,
    textContent: element.textContent,
    attributes,
    children,
  };
}
