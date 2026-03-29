import React, { ChangeEvent, useEffect, useState } from "react";
import {
  ArrowheadBoth,
  ArrowheadEnd,
  Backward,
  CurvedArrow,
  Delete,
  Duplicate,
  ElbowedArrow,
  Forward,
  Link,
  SharpArrow,
  ToBack,
  ToFront,
} from "../assets/icons";
import { BACKGROUND_COLORS, STROKE_COLORS, STROKE_STYLES } from "../global/var";
import {
  deleteElementsByIds,
  duplicateSelectedElements,
  getElementById,
  measureTextBounds,
  minmax,
  moveElementLayer,
  updateElementsByIds,
} from "../helper/element";
import { useAppContext } from "../provider/AppStates";
import { ArrowType, Arrowheads, DrawElement, ElementStyle, FontSize, SelectedElement, TextAlign } from "../types";

interface ElementStyleState {
  fill: string | undefined;
  strokeWidth: number | undefined;
  strokeStyle: "solid" | "dashed" | "dotted" | undefined;
  strokeColor: string | undefined;
  opacity: number | undefined;
  borderRadius: number | undefined;
  roughness: number | undefined;
  arrowType: ArrowType | undefined;
  arrowheads: Arrowheads | undefined;
  fontSize: FontSize | undefined;
  textAlign: TextAlign | undefined;
}

interface StyleProps {
  selectedElement: (SelectedElement & ElementStyle) | ElementStyle;
}

export default function Style({ selectedElement }: StyleProps): JSX.Element | null {
  const {
    elements,
    setElements,
    setSelectedElement,
    setSelectedIds,
    setStyle,
    selectedTool,
    selectedIds,
  } = useAppContext();

  const [elementStyle, setElementStyle] = useState<ElementStyleState>({
    fill: selectedElement?.fill,
    strokeWidth: selectedElement?.strokeWidth,
    strokeStyle: selectedElement?.strokeStyle,
    strokeColor: selectedElement?.strokeColor,
    opacity: selectedElement?.opacity,
    borderRadius: selectedElement?.borderRadius,
    roughness: selectedElement?.roughness,
    arrowType: selectedElement?.arrowType,
    arrowheads: selectedElement?.arrowheads,
    fontSize: selectedElement?.fontSize,
    textAlign: selectedElement?.textAlign,
  });

  useEffect(() => {
    setElementStyle({
      fill: selectedElement?.fill,
      strokeWidth: selectedElement?.strokeWidth,
      strokeStyle: selectedElement?.strokeStyle,
      strokeColor: selectedElement?.strokeColor,
      opacity: selectedElement?.opacity,
      borderRadius: selectedElement?.borderRadius,
      roughness: selectedElement?.roughness,
      arrowType: selectedElement?.arrowType,
      arrowheads: selectedElement?.arrowheads,
      fontSize: selectedElement?.fontSize,
      textAlign: selectedElement?.textAlign,
    });
  }, [selectedElement]);

  const setStylesStates = (styleObject: Partial<ElementStyle>): void => {
    setElementStyle((prevState) => ({ ...prevState, ...styleObject }));
    setStyle((prevState) => ({ ...prevState, ...styleObject }));
  };

  const isSelectedElement = (el: (SelectedElement & ElementStyle) | ElementStyle): el is SelectedElement => {
    return "id" in el;
  };

  if (!selectedElement) return null;

  const styleTargetIds =
    selectedIds.length > 0
      ? selectedIds
      : isSelectedElement(selectedElement)
        ? [selectedElement.id]
        : [];

  const primaryEl =
    selectedIds.length > 0
      ? getElementById(selectedIds[0], elements)
      : isSelectedElement(selectedElement)
        ? selectedElement
        : undefined;

  const isText =
    styleTargetIds.length > 0 &&
    styleTargetIds.every(
      (id) => getElementById(id, elements)?.tool === "text"
    );

  const showArrowStyle =
    styleTargetIds.length === 0
      ? selectedTool === "arrow"
      : styleTargetIds.every((id) => getElementById(id, elements)?.tool === "arrow");

  const showRectRadius =
    styleTargetIds.length === 0
      ? selectedTool === "rectangle" ||
        (selectedTool === "arrow" && elementStyle.arrowType === "elbowed")
      : styleTargetIds.every((id) => {
          const e = getElementById(id, elements);
          return (
            e?.tool === "rectangle" ||
            (e?.tool === "arrow" && e.arrowType === "elbowed")
          );
        });

  const edgesLabel =
    styleTargetIds.length === 0
      ? selectedTool === "arrow" && elementStyle.arrowType === "elbowed"
        ? "Bend radius"
        : "Edges"
      : styleTargetIds.every(
          (id) => getElementById(id, elements)?.tool === "arrow"
        )
        ? "Bend radius"
        : "Edges";

  return (
    <section className="styleOptions">
      <div className="group strokeColor">
        <p>Stroke</p>
        <div className="innerGroup">
          {STROKE_COLORS.map((color, index) => (
            <button
              type="button"
              title={color}
              style={{ "--color": color } as React.CSSProperties}
              key={index}
              className={
                "itemButton color" +
                (color === elementStyle.strokeColor ? " selected" : "")
              }
              onClick={() => {
                setStylesStates({ strokeColor: color });
                if (styleTargetIds.length > 0) {
                  updateElementsByIds(
                    styleTargetIds,
                    { strokeColor: color },
                    setElements as (
                      action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]),
                      overwrite?: boolean
                    ) => void,
                    elements
                  );
                }
              }}
            ></button>
          ))}
        </div>
      </div>
      {!isText && (
        <div className="group backgroundColor">
          <p>Background</p>
          <div className="innerGroup">
            {BACKGROUND_COLORS.map((fill, index) => (
              <button
                type="button"
                title={fill}
                className={
                  "itemButton color" +
                  (fill === "transparent" ? " checkerboard" : "") +
                  (fill === elementStyle.fill ? " selected" : "")
                }
                style={{ "--color": fill } as React.CSSProperties}
                key={index}
                onClick={() => {
                  setStylesStates({ fill });
                  if (styleTargetIds.length > 0) {
                    updateElementsByIds(
                      styleTargetIds,
                      { fill },
                      setElements as (
                        action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]),
                        overwrite?: boolean
                      ) => void,
                      elements
                    );
                  }
                }}
              ></button>
            ))}
          </div>
        </div>
      )}
      {!isText && (
      <div className="group strokeWidth">
        <p>Stroke width</p>
        <div className="innerGroup">
          <button
            type="button"
            title="Thin"
            className={
              "itemButton option" +
              ((elementStyle.strokeWidth ?? 2) <= 2 ? " selected" : "")
            }
            onClick={() => {
              setStylesStates({ strokeWidth: 2 });
              if (styleTargetIds.length > 0) {
                updateElementsByIds(
                  styleTargetIds,
                  { strokeWidth: 2 },
                  setElements as (
                    action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]),
                    overwrite?: boolean
                  ) => void,
                  elements
                );
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            title="Medium"
            className={
              "itemButton option" +
              ((elementStyle.strokeWidth ?? 2) > 2 && (elementStyle.strokeWidth ?? 2) <= 6 ? " selected" : "")
            }
            onClick={() => {
              setStylesStates({ strokeWidth: 5 });
              if (styleTargetIds.length > 0) {
                updateElementsByIds(
                  styleTargetIds,
                  { strokeWidth: 5 },
                  setElements as (
                    action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]),
                    overwrite?: boolean
                  ) => void,
                  elements
                );
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            title="Thick"
            className={
              "itemButton option" +
              ((elementStyle.strokeWidth ?? 2) > 6 ? " selected" : "")
            }
            onClick={() => {
              setStylesStates({ strokeWidth: 10 });
              if (styleTargetIds.length > 0) {
                updateElementsByIds(
                  styleTargetIds,
                  { strokeWidth: 10 },
                  setElements as (
                    action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]),
                    overwrite?: boolean
                  ) => void,
                  elements
                );
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      )}
      {!isText && (
      <div className="group strokeStyle">
        <p>Stroke style</p>
        <div className="innerGroup">
          {STROKE_STYLES.map((style, index) => (
            <button
              type="button"
              title={style.slug}
              className={
                "itemButton option" +
                (style.slug === elementStyle.strokeStyle ? " selected" : "")
              }
              key={index}
              onClick={() => {
                setStylesStates({ strokeStyle: style.slug });
                if (styleTargetIds.length > 0) {
                  updateElementsByIds(
                    styleTargetIds,
                    { strokeStyle: style.slug },
                    setElements as (
                      action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]),
                      overwrite?: boolean
                    ) => void,
                    elements
                  );
                }
              }}
            >
              <style.icon />
            </button>
          ))}
        </div>
      </div>
      )}
      {!isText && (
      <div className="group sloppiness">
        <p>Sloppiness</p>
        <div className="innerGroup">
          <button
            type="button"
            title="Straight (Architect)"
            className={
              "itemButton option" +
              ((elementStyle.roughness ?? 1) === 0 ? " selected" : "")
            }
            onClick={() => {
              setStylesStates({ roughness: 0 });
              if (styleTargetIds.length > 0) {
                updateElementsByIds(
                  styleTargetIds,
                  { roughness: 0 },
                  setElements as (
                    action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]),
                    overwrite?: boolean
                  ) => void,
                  elements
                );
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <line x1="2" y1="18" x2="18" y2="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            title="Hand-drawn (Artist)"
            className={
              "itemButton option" +
              ((elementStyle.roughness ?? 1) === 1 ? " selected" : "")
            }
            onClick={() => {
              setStylesStates({ roughness: 1 });
              if (styleTargetIds.length > 0) {
                updateElementsByIds(
                  styleTargetIds,
                  { roughness: 1 },
                  setElements as (
                    action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]),
                    overwrite?: boolean
                  ) => void,
                  elements
                );
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M2 18 Q6 14 8 15 Q10 16 12 13 Q14 10 18 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            title="Cartoonist"
            className={
              "itemButton option" +
              ((elementStyle.roughness ?? 1) >= 2 ? " selected" : "")
            }
            onClick={() => {
              setStylesStates({ roughness: 2 });
              if (styleTargetIds.length > 0) {
                updateElementsByIds(
                  styleTargetIds,
                  { roughness: 2 },
                  setElements as (
                    action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]),
                    overwrite?: boolean
                  ) => void,
                  elements
                );
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M3 17 Q5 13 7 15 Q9 17 11 12 Q13 8 17 3" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M4 18 Q7 12 9 14 Q11 16 13 11 Q15 7 18 2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
            </svg>
          </button>
        </div>
      </div>
      )}
      {isText && (
        <>
          <div className="group fontSize">
            <p>Font size</p>
            <div className="innerGroup">
              {(['S', 'M', 'L', 'XL'] as FontSize[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  title={size}
                  className={
                    "itemButton option" +
                    ((elementStyle.fontSize ?? 'M') === size ? " selected" : "")
                  }
                  onClick={() => {
                    setStylesStates({ fontSize: size });
                    if (styleTargetIds.length > 0) {
                      setElements(
                        (prev) =>
                          prev.map((el) => {
                            if (!styleTargetIds.includes(el.id)) return el;
                            if (el.tool !== "text" || !("text" in el)) return el;
                            const bounds = measureTextBounds(
                              el.text,
                              size,
                              el.x1,
                              el.y1
                            );
                            return {
                              ...el,
                              fontSize: size,
                              ...bounds,
                            } as DrawElement;
                          }),
                        false
                      );
                    }
                  }}
                >
                  <span style={{ fontSize: size === 'S' ? 11 : size === 'M' ? 13 : size === 'L' ? 15 : 17, fontWeight: 600 }}>{size}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="group textAlign">
            <p>Text align</p>
            <div className="innerGroup">
              {([
                { align: 'left' as TextAlign, title: 'Align left', paths: 'M3 5h14M3 9h9M3 13h14M3 17h9' },
                { align: 'center' as TextAlign, title: 'Center', paths: 'M3 5h14M5.5 9h9M3 13h14M5.5 17h9' },
                { align: 'right' as TextAlign, title: 'Align right', paths: 'M3 5h14M8 9h9M3 13h14M8 17h9' },
              ]).map(({ align, title, paths }) => (
                <button
                  key={align}
                  type="button"
                  title={title}
                  className={
                    "itemButton option" +
                    ((elementStyle.textAlign ?? 'left') === align ? " selected" : "")
                  }
                  onClick={() => {
                    setStylesStates({ textAlign: align });
                    if (styleTargetIds.length > 0) {
                      updateElementsByIds(
                        styleTargetIds,
                        { textAlign: align },
                        setElements as (
                          action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]),
                          overwrite?: boolean
                        ) => void,
                        elements
                      );
                    }
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <path d={paths} stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      {showArrowStyle && (
        <>
          <div className="group arrowType">
            <p>Arrow type</p>
            <div className="innerGroup">
              {([
                { type: 'sharp' as ArrowType, icon: SharpArrow, title: 'Sharp' },
                { type: 'curved' as ArrowType, icon: CurvedArrow, title: 'Curved' },
                { type: 'elbowed' as ArrowType, icon: ElbowedArrow, title: 'Elbowed' },
              ]).map(({ type, icon: Icon, title }) => (
                <button
                  key={type}
                  type="button"
                  title={title}
                  className={
                    "itemButton option" +
                    ((elementStyle.arrowType ?? 'sharp') === type ? " selected" : "")
                  }
                  onClick={() => {
                    setStylesStates({ arrowType: type });
                    if (styleTargetIds.length > 0) {
                      updateElementsByIds(
                        styleTargetIds,
                        { arrowType: type },
                        setElements as (
                          action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]),
                          overwrite?: boolean
                        ) => void,
                        elements
                      );
                    }
                  }}
                >
                  <Icon />
                </button>
              ))}
            </div>
          </div>
          <div className="group arrowheads">
            <p>Arrowheads</p>
            <div className="innerGroup">
              {([
                { type: 'end' as Arrowheads, icon: ArrowheadEnd, title: 'End only' },
                { type: 'both' as Arrowheads, icon: ArrowheadBoth, title: 'Both sides' },
              ]).map(({ type, icon: Icon, title }) => (
                <button
                  key={type}
                  type="button"
                  title={title}
                  className={
                    "itemButton option" +
                    ((elementStyle.arrowheads ?? 'end') === type ? " selected" : "")
                  }
                  onClick={() => {
                    setStylesStates({ arrowheads: type });
                    if (styleTargetIds.length > 0) {
                      updateElementsByIds(
                        styleTargetIds,
                        { arrowheads: type },
                        setElements as (
                          action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]),
                          overwrite?: boolean
                        ) => void,
                        elements
                      );
                    }
                  }}
                >
                  <Icon />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      {showRectRadius && (
        <div className="group edges">
          <p>{edgesLabel}</p>
          <div className="innerGroup">
            <button
              type="button"
              title={
                edgesLabel === "Bend radius"
                  ? "Auto bend (follows arrow size, max 40px)"
                  : "Sharp edges"
              }
              className={
                "itemButton option" +
                ((elementStyle.borderRadius ?? 0) === 0 ? " selected" : "")
              }
              onClick={() => {
                setStylesStates({ borderRadius: 0 });
                if (styleTargetIds.length > 0) {
                  updateElementsByIds(
                    styleTargetIds,
                    { borderRadius: 0 },
                    setElements as (
                      action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]),
                      overwrite?: boolean
                    ) => void,
                    elements
                  );
                }
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path d="M4 4 L4 16 L16 16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              title={
                edgesLabel === "Bend radius"
                  ? "Set explicit bend radius (slider)"
                  : "Rounded edges"
              }
              className={
                "itemButton option" +
                ((elementStyle.borderRadius ?? 0) > 0 ? " selected" : "")
              }
              onClick={() => {
                setStylesStates({ borderRadius: 15 });
                if (styleTargetIds.length > 0) {
                  updateElementsByIds(
                    styleTargetIds,
                    { borderRadius: 15 },
                    setElements as (
                      action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]),
                      overwrite?: boolean
                    ) => void,
                    elements
                  );
                }
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path d="M4 4 L4 10 Q4 16 10 16 L16 16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {(elementStyle.borderRadius ?? 0) > 0 && (
            <div className="innerGroup">
              <input
                type="range"
                min={0}
                max={100}
                className="itemRange styleRangeSlider"
                value={elementStyle.borderRadius ?? 15}
                onChange={({ target }: ChangeEvent<HTMLInputElement>) => {
                  setStylesStates({
                    borderRadius: minmax(+target.value, [0, 100]),
                  });
                  if (styleTargetIds.length > 0) {
                    updateElementsByIds(
                      styleTargetIds,
                      { borderRadius: minmax(+target.value, [0, 100]) },
                      setElements as (
                        action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]),
                        overwrite?: boolean
                      ) => void,
                      elements
                    );
                  }
                }}
              />
            </div>
          )}
        </div>
      )}
      {!isText && (
        <div className="group opacity">
          <p>Opacity</p>
          <div className="innerGroup opacityRow">
            <span className="opacityTick">0</span>
            <input
              type="range"
              min={0}
              max={100}
              className="itemRange styleRangeSlider"
              value={elementStyle.opacity ?? 100}
              step={1}
              onChange={({ target }: ChangeEvent<HTMLInputElement>) => {
                setStylesStates({
                  opacity: minmax(+target.value, [0, 100]),
                });
                if (styleTargetIds.length > 0) {
                  updateElementsByIds(
                    styleTargetIds,
                    { opacity: minmax(+target.value, [0, 100]) },
                    setElements as (
                      action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]),
                      overwrite?: boolean
                    ) => void,
                    elements
                  );
                }
              }}
            />
            <span className="opacityTick">100</span>
          </div>
        </div>
      )}
      {styleTargetIds.length > 0 && (
        <React.Fragment>
          {styleTargetIds.length === 1 && (
            <div className="group layers">
              <p>Layers</p>
              <div className="innerGroup">
                <button
                  type="button"
                  className="itemButton option"
                  title="Send to back"
                  onClick={() =>
                    moveElementLayer(
                      styleTargetIds[0],
                      0,
                      setElements as (action: DrawElement[]) => void,
                      elements
                    )
                  }
                >
                  <ToBack />
                </button>
                <button
                  type="button"
                  className="itemButton option"
                  title="Send backward"
                  onClick={() =>
                    moveElementLayer(
                      styleTargetIds[0],
                      -1,
                      setElements as (action: DrawElement[]) => void,
                      elements
                    )
                  }
                >
                  <Backward />
                </button>
                <button
                  type="button"
                  className="itemButton option"
                  title="Bring forward"
                  onClick={() =>
                    moveElementLayer(
                      styleTargetIds[0],
                      1,
                      setElements as (action: DrawElement[]) => void,
                      elements
                    )
                  }
                >
                  <Forward />
                </button>
                <button
                  type="button"
                  className="itemButton option"
                  title="Bring to front"
                  onClick={() =>
                    moveElementLayer(
                      styleTargetIds[0],
                      2,
                      setElements as (action: DrawElement[]) => void,
                      elements
                    )
                  }
                >
                  <ToFront />
                </button>
              </div>
            </div>
          )}

          <div className="group actions">
            <p>Actions</p>
            <div className="innerGroup">
              <button
                type="button"
                className="itemButton option"
                title="Duplicate ~ Ctrl + d"
                onClick={() =>
                  duplicateSelectedElements(
                    styleTargetIds,
                    setElements as (
                      action: (prev: DrawElement[]) => DrawElement[]
                    ) => void,
                    setSelectedElement,
                    setSelectedIds,
                    10
                  )
                }
              >
                <Duplicate />
              </button>
              <button
                type="button"
                onClick={() =>
                  deleteElementsByIds(
                    styleTargetIds,
                    setElements as (
                      action: (prev: DrawElement[]) => DrawElement[]
                    ) => void,
                    setSelectedElement,
                    setSelectedIds
                  )
                }
                title="Delete"
                className="itemButton option"
              >
                <Delete />
              </button>
              <button
                type="button"
                className="itemButton option"
                title="Link/Group elements"
                onClick={() => {
                  // TODO: Implement link/group functionality
                  console.log("Link/Group clicked");
                }}
              >
                <Link />
              </button>
            </div>
          </div>
        </React.Fragment>
      )}
    </section>
  );
}
