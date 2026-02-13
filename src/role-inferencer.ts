import type { ElementMeasurement, SkeletonConfig, SkeletonNode } from './types';

// Table structural elements should never be skeletonized - they preserve structure
const TABLE_STRUCTURAL_TAGS = ['TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR'];
// Table cell elements contain the actual content to skeletonize
const TABLE_CELL_TAGS = ['TH', 'TD'];

function shouldSkeletonize(measurement: ElementMeasurement): boolean {
  const { tagName, textContent, children, style, rect } = measurement;
  const area = rect.width * rect.height;

  // Skip tiny spacer elements
  if (area < 100) return false;

  // Table structural elements are NEVER skeletonized - they preserve layout
  if (TABLE_STRUCTURAL_TAGS.includes(tagName)) return false;

  // Table cells (TH, TD) are containers that hold skeletonizable content
  // They should not be skeletonized themselves, but their children should be
  if (TABLE_CELL_TAGS.includes(tagName)) return false;

  // Always skeletonize these interactive/media elements
  if (tagName.match(/^(IMG|BUTTON|INPUT|TEXTAREA|SELECT|SVG)$/)) return true;

  // Skeletonize text leaves (no children, has text)
  if (textContent?.trim() && children.length === 0) return true;

  // Skeletonize single-child text containers like <p><span>text</span></p>
  if (children.length === 1 && textContent?.trim()) {
    const child = children[0];
    if (child.textContent?.trim() && child.children.length === 0) return true;
  }

  // Keep as container if multiple children
  if (children.length > 1) return false;

  // Keep as container if has layout display
  if (style.display?.match(/flex|grid/)) return false;

  // Default: treat as container if it has children
  return children.length === 0;
}

export function inferSkeletonNode(
  measurement: ElementMeasurement,
  config: SkeletonConfig
): SkeletonNode {
  if (measurement.passthrough) {
    return {
      type: 'passthrough',
      rect: {
        x: measurement.rect.x,
        y: measurement.rect.y,
        width: measurement.rect.width,
        height: measurement.rect.height,
      },
      passthrough: true,
      passthroughHtml: measurement.passthroughHtml,
    };
  }

  const { rect, style, tagName, textContent, attributes, children } = measurement;

  // Check for forced role via data attribute
  const forcedRole = attributes['data-skeleton-role'];
  if (forcedRole) {
    const forcedType = forcedRole as SkeletonNode['type'];
    let lines = 1;

    if (forcedType === 'text') {
      const lineHeightValue = parseFloat(style.lineHeight);
      const fontSize = parseFloat(style.fontSize);
      const effectiveLineHeight = lineHeightValue || fontSize * 1.2;

      if (effectiveLineHeight > 0 && rect.height > effectiveLineHeight) {
        lines = Math.ceil(rect.height / effectiveLineHeight);
      }
    }

    return {
      type: forcedType,
      rect: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      },
      borderRadius: parseFloat(style.borderRadius) || config.borderRadius,
      lines: forcedType === 'text' ? lines : undefined,
      preservedStyles: {
        display: style.display,
        margin: style.margin,
        padding: style.padding,
        lineHeight: style.lineHeight,
        flex: style.flex,
        flexGrow: style.flexGrow,
        flexShrink: style.flexShrink,
        flexBasis: style.flexBasis,
        alignSelf: style.alignSelf,
        justifySelf: style.justifySelf,
        gridColumn: style.gridColumn,
        gridRow: style.gridRow,
        gridArea: style.gridArea,
        verticalAlign: style.verticalAlign,
      },
    };
  }

  // Handle table structural elements - preserve their structure completely
  if (TABLE_STRUCTURAL_TAGS.includes(tagName)) {
    const childNodes = children
      .map((child) => inferSkeletonNode(child, config))
      .filter((child) => child.type !== 'skip');

    return {
      type: tagName.toLowerCase() as SkeletonNode['type'],
      tagName,
      rect: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      },
      children: childNodes,
      preservedStyles: {
        display: style.display,
        margin: style.margin,
        padding: style.padding,
        border: style.border,
        borderBottom: style.borderBottom,
        backgroundColor: style.backgroundColor,
        width: style.width,
        borderCollapse: style.borderCollapse,
        tableLayout: style.tableLayout,
      },
    };
  }

  // Handle table cells (TH, TD) - preserve cell structure, skeletonize content
  if (TABLE_CELL_TAGS.includes(tagName)) {
    const childNodes = children
      .map((child) => inferSkeletonNode(child, config))
      .filter((child) => child.type !== 'skip');

    return {
      type: tagName.toLowerCase() as SkeletonNode['type'],
      tagName,
      rect: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      },
      children: childNodes,
      preservedStyles: {
        display: style.display,
        margin: style.margin,
        padding: style.padding,
        border: style.border,
        borderBottom: style.borderBottom,
        backgroundColor: style.backgroundColor,
        textAlign: style.textAlign,
        verticalAlign: style.verticalAlign,
        width: style.width,
      },
    };
  }

  // Check if this should be a container that preserves children
  if (!shouldSkeletonize(measurement)) {
    const childNodes = children
      .map((child) => inferSkeletonNode(child, config))
      .filter((child) => child.type !== 'skip');

    return {
      type: 'container',
      rect: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      },
      display: style.display,
      gap: style.gap,
      borderRadius: parseFloat(style.borderRadius) || 0,
      children: childNodes,
      preservedStyles: {
        display: style.display,
        margin: style.margin,
        padding: style.padding,
        border: style.border,
        boxSizing: style.boxSizing,
        justifyContent: style.justifyContent,
        alignItems: style.alignItems,
        flexDirection: style.flexDirection,
        minHeight: style.minHeight,
        gridTemplateColumns: style.gridTemplateColumns,
        gridTemplateRows: style.gridTemplateRows,
      },
    };
  }

  // This is a leaf - infer its visual role
  const area = rect.width * rect.height;
  
  const scores = {
    text: 0,
    image: 0,
    icon: 0,
    button: 0,
    input: 0,
    container: 0,
    skip: 0,
  };

  // TEXT heuristics
  if (textContent && textContent.trim().length > 0) scores.text += 40;
  if (
    rect.height < config.minTextHeight * 3 &&
    rect.height >= config.minTextHeight
  ) {
    scores.text += 30;
  }
  if (tagName.match(/^(P|SPAN|H[1-6]|LABEL|A|DIV)$/)) scores.text += 20;
  const fontSize = parseFloat(style.fontSize);
  if (fontSize > 0 && fontSize < 100) scores.text += 20;

  // IMAGE heuristics - IMG tag gets highest priority
  if (tagName === 'IMG') scores.image += 100;
  if (attributes['role'] === 'img') scores.image += 60;
  if (style.backgroundImage !== 'none') scores.image += 50;
  if (area > config.minImageSize ** 2) scores.image += 30;

  // ICON heuristics (small square-ish elements)
  if (tagName === 'SVG') scores.icon += 70;
  const aspectRatio = rect.width / rect.height;
  if (
    area < config.iconMaxSize ** 2 &&
    aspectRatio > 0.8 &&
    aspectRatio < 1.2
  ) {
    scores.icon += 40;
  }

  // BUTTON heuristics
  if (tagName === 'BUTTON') scores.button += 80;
  if (attributes['role'] === 'button') scores.button += 60;
  if (style.cursor === 'pointer' && area < 20000) scores.button += 30;

  // INPUT heuristics
  if (tagName.match(/^(INPUT|TEXTAREA|SELECT)$/)) scores.input += 80;
  if (attributes['contenteditable']) scores.input += 50;

  // CONTAINER heuristics (has children)
  if (children.length > 1) scores.container += 50;
  if (style.display?.match(/flex|grid/)) scores.container += 30;

  // SKIP heuristics (spacers, tiny elements)
  if (area < 100) scores.skip += 50;
  if (rect.height < 5 || rect.width < 5) scores.skip += 40;

  // Find winner (but we already filtered containers, so exclude container type)
  const winner = (Object.entries(scores).filter(
    ([key]) => key !== 'container'
  ) as Array<
    [typeof scores extends Record<infer K, number> ? Exclude<K, 'container'> : never, number]
  >).reduce((a, b) => (b[1] > a[1] ? b : a));

  const type = winner[1] > 30 ? winner[0] : 'text'; // Default to text for leaves

  // Calculate lines for text elements
  let lines = 1;
  if (type === 'text') {
    const lineHeightValue = parseFloat(style.lineHeight);
    const fontSize = parseFloat(style.fontSize);
    const effectiveLineHeight = lineHeightValue || fontSize * 1.2;
    
    if (effectiveLineHeight > 0 && rect.height > effectiveLineHeight) {
      lines = Math.ceil(rect.height / effectiveLineHeight);
    }
  }

  // Build skeleton node (leaf only, no children)
  return {
    type,
    rect: {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    },
    borderRadius: parseFloat(style.borderRadius) || config.borderRadius,
    lines: type === 'text' ? lines : undefined,
    preservedStyles: {
      display: style.display,
      margin: style.margin,
      padding: style.padding,
      lineHeight: style.lineHeight,
      flex: style.flex,
      flexGrow: style.flexGrow,
      flexShrink: style.flexShrink,
      flexBasis: style.flexBasis,
      alignSelf: style.alignSelf,
      justifySelf: style.justifySelf,
      gridColumn: style.gridColumn,
      gridRow: style.gridRow,
      gridArea: style.gridArea,
      verticalAlign: style.verticalAlign,
    },
  };
}
