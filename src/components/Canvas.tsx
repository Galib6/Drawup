import useCanvas from "../hooks/useCanvas";

export default function Canvas(): JSX.Element {
  const {
    canvasRef,
    dimension,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleDoubleClick,
    handleContextMenu,
  } = useCanvas();

  return (
    <canvas
      id="canvas"
      ref={canvasRef}
      tabIndex={0}
      width={dimension.width}
      height={dimension.height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    />
  );
}
