import React, { useCallback, useRef, useState } from "react";

export interface SvgPanZoomState {
  scale: number;
  x: number;
  y: number;
  isDragging: boolean;
}

export interface UseSvgPanZoomOptions {
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  scaleStep?: number;
}

export function useSvgPanZoom(options: UseSvgPanZoomOptions = {}) {
  const { minScale = 0.2, maxScale = 5.0, initialScale = 1.0, scaleStep = 1.25 } = options;

  const [state, setState] = useState<SvgPanZoomState>({
    scale: initialScale,
    x: 0,
    y: 0,
    isDragging: false,
  });

  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initX: number;
    initY: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const zoomIn = useCallback(
    (customFactor?: number) => {
      const factor = customFactor ?? scaleStep;
      setState((prev) => ({
        ...prev,
        scale: Math.min(maxScale, Number((prev.scale * factor).toFixed(2))),
      }));
    },
    [maxScale, scaleStep],
  );

  const zoomOut = useCallback(
    (customFactor?: number) => {
      const factor = customFactor ?? scaleStep;
      setState((prev) => ({
        ...prev,
        scale: Math.max(minScale, Number((prev.scale / factor).toFixed(2))),
      }));
    },
    [minScale, scaleStep],
  );

  const resetZoom = useCallback(() => {
    setState({ scale: 1.0, x: 0, y: 0, isDragging: false });
  }, []);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      dragStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        initX: state.x,
        initY: state.y,
      };
      setState((prev) => ({ ...prev, isDragging: true }));
    },
    [state.x, state.y],
  );

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    setState((prev) => ({
      ...prev,
      x: dragStartRef.current!.initX + dx,
      y: dragStartRef.current!.initY + dy,
    }));
  }, []);

  const onMouseUp = useCallback(() => {
    dragStartRef.current = null;
    setState((prev) => ({ ...prev, isDragging: false }));
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 1.15 : 0.85;
      setState((prev) => ({
        ...prev,
        scale: Math.max(minScale, Math.min(maxScale, Number((prev.scale * delta).toFixed(2)))),
      }));
    },
    [minScale, maxScale],
  );

  const transformStyle: React.CSSProperties = {
    transform: `translate(${state.x}px, ${state.y}px) scale(${state.scale})`,
    transformOrigin: "center center",
    transition: state.isDragging ? "none" : "transform 0.15s ease-out",
    cursor: state.isDragging ? "grabbing" : "grab",
  };

  return {
    state,
    containerRef,
    transformStyle,
    zoomIn,
    zoomOut,
    resetZoom,
    containerProps: {
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave: onMouseUp,
      onWheel,
    },
  };
}
