export interface SkeletonConfig {
  animation: 'pulse' | 'shimmer' | 'none';
  baseColor: string;
  highlightColor: string;
  borderRadius: number;
  minTextHeight: number;
  minImageSize: number;
  iconMaxSize: number;
  maxDepth: number;
  ignoreSelectors: string[];
}

export interface ElementMeasurement {
  rect: DOMRect;
  style: CSSStyleDeclaration;
  tagName: string;
  textContent: string | null;
  attributes: Record<string, string>;
  children: ElementMeasurement[];
  passthrough?: boolean;
  passthroughHtml?: string;
}

export interface SkeletonNode {
  type: 'text' | 'image' | 'icon' | 'button' | 'input' | 'container' | 'skip' | 'passthrough' | 'table' | 'thead' | 'tbody' | 'tr' | 'th' | 'td';
  rect: { x: number; y: number; width: number; height: number };
  borderRadius?: number;
  display?: string;
  gap?: string;
  children?: SkeletonNode[];
  passthrough?: boolean;
  passthroughHtml?: string;
  preservedStyles?: {
    display: string;
    margin: string;
    padding: string;
    border?: string;
    boxSizing?: string;
    lineHeight?: string;
    flex?: string;
    flexGrow?: string;
    flexShrink?: string;
    flexBasis?: string;
    alignSelf?: string;
    justifySelf?: string;
    justifyContent?: string;
    alignItems?: string;
    flexDirection?: string;
    minHeight?: string;
    gridTemplateColumns?: string;
    gridTemplateRows?: string;
    gridColumn?: string;
    gridRow?: string;
    gridArea?: string;
    verticalAlign?: string;
    // Table-specific styles
    width?: string;
    textAlign?: string;
    backgroundColor?: string;
    borderBottom?: string;
    borderCollapse?: string;
    tableLayout?: string;
  };
  lines?: number; // For multi-line text
  tagName?: string; // For preserving table element tags
}
