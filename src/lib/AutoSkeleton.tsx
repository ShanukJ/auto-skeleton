import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { traverseAndMeasure } from './dom-traverser';
import { inferSkeletonNode } from './role-inferencer';
import { SkeletonRenderer } from './skeleton-renderer';
import type { SkeletonConfig, SkeletonNode } from './types';

interface AutoSkeletonProps {
  loading: boolean;
  children: React.ReactNode;
  config?: Partial<SkeletonConfig>;
}

const DEFAULT_CONFIG: SkeletonConfig = {
  animation: 'pulse',
  baseColor: '#e0e0e0',
  highlightColor: '#f5f5f5',
  borderRadius: 4,
  minTextHeight: 12,
  minImageSize: 32,
  iconMaxSize: 48,
  maxDepth: 10,
  ignoreSelectors: ['.no-skeleton', '[data-skeleton-ignore]'],
};

export function AutoSkeleton({
  loading,
  children,
  config: userConfig,
}: AutoSkeletonProps) {
  const config = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...userConfig }),
    [userConfig]
  );
  const measureRef = useRef<HTMLDivElement>(null);
  const [blueprint, setBlueprint] = useState<SkeletonNode | null>(null);

  useLayoutEffect(() => {
    if (!loading || !measureRef.current) {
      return;
    }

    // Wait for next frame to ensure render is complete
    const frameId = requestAnimationFrame(() => {
      if (!measureRef.current) return;

      try {
        const measurement = traverseAndMeasure(measureRef.current, config);
        if (measurement) {
          const skeletonNode = inferSkeletonNode(measurement, config);
          setBlueprint(skeletonNode);
        }
      } catch (error) {
        console.error('AutoSkeleton measurement failed:', error);
        setBlueprint(null);
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [loading, config]);

  // Keep blueprint briefly for fade-out after loading completes.
  useLayoutEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      setBlueprint(null);
    }, 300);

    return () => clearTimeout(timer);
  }, [loading]);

  const hideContent = loading && blueprint !== null;
  const showSkeleton = loading || blueprint !== null;

  return (
    <div style={{ position: 'relative' }}>
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .auto-skeleton-fade {
          transition: opacity 0.3s ease-out;
        }
      `}</style>

      {/* Content - always rendered, fades in/out */}
      <div
        className="auto-skeleton-fade"
        style={{ opacity: hideContent ? 0 : 1 }}
      >
        {children}
      </div>

      {/* Skeleton overlay - positioned absolute on top */}
      {showSkeleton && blueprint && (
        <div
          className="auto-skeleton-fade"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            opacity: loading ? 1 : 0,
            pointerEvents: loading ? 'auto' : 'none',
          }}
        >
          <SkeletonRenderer
            blueprint={blueprint}
            baseColor={config.baseColor}
            highlightColor={config.highlightColor}
            animation={config.animation}
          />
        </div>
      )}

      {/* Hidden measurement container */}
      {loading && (
        <div
          ref={measureRef}
          style={{
            opacity: 0,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            pointerEvents: 'none',
            zIndex: -1,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
