import React from 'react';
import type { SkeletonNode } from './types';

interface SkeletonRendererProps {
  blueprint: SkeletonNode;
  baseColor: string;
  highlightColor: string;
  animation: 'pulse' | 'shimmer' | 'none';
}

export function SkeletonRenderer({
  blueprint,
  baseColor,
  highlightColor,
  animation,
}: SkeletonRendererProps) {
  return renderNode(blueprint, baseColor, highlightColor, animation);
}

function renderNode(
  node: SkeletonNode,
  baseColor: string,
  highlightColor: string,
  animation: 'pulse' | 'shimmer' | 'none',
  key?: number
): React.ReactNode {
  if (node.type === 'passthrough') {
    if (!node.passthroughHtml) return null;
    return (
      <div
        key={key}
        style={{ display: 'contents' }}
        dangerouslySetInnerHTML={{ __html: node.passthroughHtml }}
      />
    );
  }

  if (node.type === 'skip') return null;

  // Handle table structural elements - render actual HTML table elements
  if (node.type === 'table') {
    return (
      <table
        key={key}
        style={{
          width: node.preservedStyles?.width || '100%',
          borderCollapse: node.preservedStyles?.borderCollapse as React.CSSProperties['borderCollapse'],
          tableLayout: node.preservedStyles?.tableLayout as React.CSSProperties['tableLayout'],
        }}
      >
        {node.children?.map((child, i) =>
          renderNode(child, baseColor, highlightColor, animation, i)
        )}
      </table>
    );
  }

  if (node.type === 'thead') {
    return (
      <thead key={key}>
        {node.children?.map((child, i) =>
          renderNode(child, baseColor, highlightColor, animation, i)
        )}
      </thead>
    );
  }

  if (node.type === 'tbody') {
    return (
      <tbody key={key}>
        {node.children?.map((child, i) =>
          renderNode(child, baseColor, highlightColor, animation, i)
        )}
      </tbody>
    );
  }

  if (node.type === 'tr') {
    return (
      <tr key={key}>
        {node.children?.map((child, i) =>
          renderNode(child, baseColor, highlightColor, animation, i)
        )}
      </tr>
    );
  }

  // Handle table cells - render actual th/td with skeleton content inside
  if (node.type === 'th' || node.type === 'td') {
    const CellTag = node.type;
    const cellStyle: React.CSSProperties = {
      padding: node.preservedStyles?.padding,
      borderBottom: node.preservedStyles?.borderBottom,
      backgroundColor: node.preservedStyles?.backgroundColor,
      textAlign: node.preservedStyles?.textAlign as React.CSSProperties['textAlign'],
      verticalAlign: node.preservedStyles?.verticalAlign as React.CSSProperties['verticalAlign'],
      width: node.preservedStyles?.width,
    };

    // If cell has children, render them as skeletons
    if (node.children && node.children.length > 0) {
      return (
        <CellTag key={key} style={cellStyle}>
          {node.children.map((child, i) =>
            renderNode(child, baseColor, highlightColor, animation, i)
          )}
        </CellTag>
      );
    }

    // Empty cell - render a skeleton placeholder based on cell dimensions
    const skeletonStyle: React.CSSProperties = {
      width: '80%',
      height: 16,
      borderRadius: 4,
      backgroundColor: baseColor,
      animation: animation === 'pulse' ? 'skeleton-pulse 2s ease-in-out infinite' : undefined,
    };

    return (
      <CellTag key={key} style={cellStyle}>
        <div style={skeletonStyle} />
      </CellTag>
    );
  }

  // Container renders children with preserved layout
  if (node.type === 'container' && node.children && node.children.length > 0) {
    // Check if border is meaningful (not "0px none" or similar)
    const borderValue = node.preservedStyles?.border || '';
    const hasMeaningfulBorder = borderValue && !borderValue.includes('0px') && !borderValue.startsWith('none');

    return (
      <div
        key={key}
        style={{
          display: node.display || 'block',
          gap: node.gap,
          width: node.rect.width,
          // Don't set fixed height - let container size naturally from children
          // This avoids issues with incorrect height measurement from alt text
          boxSizing: 'border-box',
          margin: node.preservedStyles?.margin,
          padding: node.preservedStyles?.padding,
          border: hasMeaningfulBorder ? node.preservedStyles?.border : undefined,
          borderRadius: node.borderRadius,
          flex: node.preservedStyles?.flex,
          flexGrow: node.preservedStyles?.flexGrow ? Number(node.preservedStyles.flexGrow) : undefined,
          flexShrink: node.preservedStyles?.flexShrink ? Number(node.preservedStyles.flexShrink) : undefined,
          flexBasis: node.preservedStyles?.flexBasis,
          alignSelf: node.preservedStyles?.alignSelf as React.CSSProperties['alignSelf'],
          justifySelf: node.preservedStyles?.justifySelf as React.CSSProperties['justifySelf'],
          justifyContent: node.preservedStyles?.justifyContent as React.CSSProperties['justifyContent'],
          alignItems: node.preservedStyles?.alignItems as React.CSSProperties['alignItems'],
          flexDirection: node.preservedStyles?.flexDirection as React.CSSProperties['flexDirection'],
          minHeight: node.preservedStyles?.minHeight,
          // Preserve measured grid template so responsive breakpoints (e.g. md:grid-cols-*)
          // are kept exactly during skeleton rendering.
          gridTemplateColumns: node.preservedStyles?.gridTemplateColumns,
          gridTemplateRows: node.preservedStyles?.gridTemplateRows,
          gridColumn: node.preservedStyles?.gridColumn,
          gridRow: node.preservedStyles?.gridRow,
          gridArea: node.preservedStyles?.gridArea,
        }}
      >
        {node.children.map((child, i) =>
          renderNode(child, baseColor, highlightColor, animation, i)
        )}
      </div>
    );
  }

  // Handle image skeletons - render as block with exact dimensions
  if (node.type === 'image') {
    const imageSkeletonStyle: React.CSSProperties = {
      width: node.rect.width,
      height: node.rect.height,
      borderRadius: node.borderRadius,
      backgroundColor: baseColor,
      display: 'block',
      boxSizing: 'border-box',
      margin: node.preservedStyles?.margin,
    };

    if (animation === 'pulse') {
      imageSkeletonStyle.animation = 'skeleton-pulse 2s ease-in-out infinite';
    }

    return (
      <div key={key} style={imageSkeletonStyle} className="skeleton-image" />
    );
  }

  // Check if element is an interactive element (button, input) that needs special handling
  const isInteractive = node.type === 'button' || node.type === 'input';

  // For interactive elements in flex containers, render without wrapper to preserve layout
  if (isInteractive) {
    const skeletonStyle: React.CSSProperties = {
      // Lock exact dimensions
      width: node.rect.width,
      height: node.rect.height,
      minWidth: node.rect.width,
      minHeight: node.rect.height,
      boxSizing: 'border-box',
      // Preserve flex-item properties
      margin: node.preservedStyles?.margin,
      flex: node.preservedStyles?.flex,
      flexGrow: node.preservedStyles?.flexGrow ? Number(node.preservedStyles.flexGrow) : undefined,
      flexShrink: 0, // Prevent flex compression
      flexBasis: node.preservedStyles?.flexBasis,
      alignSelf: node.preservedStyles?.alignSelf as React.CSSProperties['alignSelf'],
      justifySelf: node.preservedStyles?.justifySelf as React.CSSProperties['justifySelf'],
      // Grid properties
      gridColumn: node.preservedStyles?.gridColumn,
      gridRow: node.preservedStyles?.gridRow,
      gridArea: node.preservedStyles?.gridArea,
      // Visual
      borderRadius: node.borderRadius,
      backgroundColor: baseColor,
      // Preserve inline nature
      display: 'inline-block',
      verticalAlign: node.preservedStyles?.verticalAlign || 'middle',
    };

    if (animation === 'pulse') {
      skeletonStyle.animation = 'skeleton-pulse 2s ease-in-out infinite';
    }

    return (
      <div key={key} style={skeletonStyle} className={`skeleton-${node.type}`} />
    );
  }

  // Leaf nodes: wrapper preserves spacing, skeleton has fixed dimensions
  const wrapperStyle: React.CSSProperties = {
    // Only margin for spacing between siblings
    margin: node.preservedStyles?.margin,
    // Flex-item properties
    flex: node.preservedStyles?.flex,
    flexGrow: node.preservedStyles?.flexGrow ? Number(node.preservedStyles.flexGrow) : undefined,
    flexShrink: node.preservedStyles?.flexShrink ? Number(node.preservedStyles.flexShrink) : undefined,
    flexBasis: node.preservedStyles?.flexBasis,
    alignSelf: node.preservedStyles?.alignSelf as React.CSSProperties['alignSelf'],
    // Grid-item properties
    gridColumn: node.preservedStyles?.gridColumn,
    gridRow: node.preservedStyles?.gridRow,
    gridArea: node.preservedStyles?.gridArea,
  };

  // For inline elements, use inline-block for skeleton
  const skeletonDisplay =
    node.preservedStyles?.display === 'inline' ? 'inline-block' : 'block';

  const skeletonStyle: React.CSSProperties = {
    width: node.rect.width,
    height: node.rect.height,
    borderRadius: node.borderRadius,
    backgroundColor: baseColor,
    display: skeletonDisplay,
    verticalAlign: node.preservedStyles?.verticalAlign || 'middle',
  };

  if (animation === 'pulse') {
    skeletonStyle.animation = 'skeleton-pulse 2s ease-in-out infinite';
  }

  // Handle multi-line text
  if (node.type === 'text' && node.lines && node.lines > 1) {
    const lineHeight = parseFloat(node.preservedStyles?.lineHeight || '1.2');
    const singleLineHeight = node.rect.height / node.lines;

    return (
      <div
        key={key}
        style={{
          ...wrapperStyle,
          display: 'flex',
          flexDirection: 'column',
          gap: lineHeight > singleLineHeight ? (lineHeight - singleLineHeight) : 4,
        }}
      >
        {Array.from({ length: node.lines }).map((_, i) => (
          <div
            key={i}
            style={{
              ...skeletonStyle,
              height: singleLineHeight,
              width: i === node.lines! - 1 ? node.rect.width * 0.7 : node.rect.width, // Last line shorter
            }}
            className={`skeleton-${node.type}`}
          />
        ))}
      </div>
    );
  }

  // Single-line leaf elements
  const className = `skeleton-${node.type}`;

  return (
    <div key={key} style={wrapperStyle}>
      <div style={skeletonStyle} className={className} />
    </div>
  );
}
