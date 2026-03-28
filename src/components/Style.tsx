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
  deleteElement,
  duplicateElement,
  minmax,
  moveElementLayer,
  updateElement,
} from "../helper/element";
import { useAppContext } from "../provider/AppStates";
import { ArrowType, Arrowheads, DrawElement, ElementStyle, SelectedElement } from "../types";

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
}

interface StyleProps {
  selectedElement: (SelectedElement & ElementStyle) | ElementStyle;
}

export default function Style({ selectedElement }: StyleProps): JSX.Element | null {
  const { elements, setElements, setSelectedElement, setStyle, selectedTool } = useAppContext();

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

  const selectedId = isSelectedElement(selectedElement) ? selectedElement.id : undefined;

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
                if (selectedId) {
                  updateElement(
                    selectedId,
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
                if (selectedId) {
                  updateElement(
                    selectedId,
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
              if (selectedId) {
                updateElement(
                  selectedId,
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
              if (selectedId) {
                updateElement(
                  selectedId,
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
              if (selectedId) {
                updateElement(
                  selectedId,
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
                if (selectedId) {
                  updateElement(
                    selectedId,
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
              if (selectedId) {
                updateElement(
                  selectedId,
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
              if (selectedId) {
                updateElement(
                  selectedId,
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
              if (selectedId) {
                updateElement(
                  selectedId,
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
      {(isSelectedElement(selectedElement) ? selectedElement.tool === 'arrow' : selectedTool === 'arrow') && (
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
                    if (selectedId) {
                      updateElement(
                        selectedId,
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
                    if (selectedId) {
                      updateElement(
                        selectedId,
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
      {isSelectedElement(selectedElement) && selectedElement.tool === 'rectangle' && (
        <div className="group edges">
          <p>Edges</p>
          <div className="innerGroup">
            <button
              type="button"
              title="Sharp edges"
              className={
                "itemButton option" +
                ((elementStyle.borderRadius ?? 0) === 0 ? " selected" : "")
              }
              onClick={() => {
                setStylesStates({ borderRadius: 0 });
                if (selectedId) {
                  updateElement(
                    selectedId,
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
              title="Rounded edges"
              className={
                "itemButton option" +
                ((elementStyle.borderRadius ?? 0) > 0 ? " selected" : "")
              }
              onClick={() => {
                setStylesStates({ borderRadius: 15 });
                if (selectedId) {
                  updateElement(
                    selectedId,
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
                  if (selectedId) {
                    updateElement(
                      selectedId,
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
              if (selectedId) {
                updateElement(
                  selectedId,
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
      {isSelectedElement(selectedElement) && (
        <React.Fragment>
          <div className="group layers">
            <p>Layers</p>
            <div className="innerGroup">
              <button
                type="button"
                className="itemButton option"
                title="Send to back"
                onClick={() =>
                  moveElementLayer(
                    selectedElement.id,
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
                    selectedElement.id,
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
                    selectedElement.id,
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
                    selectedElement.id,
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

          <div className="group actions">
            <p>Actions</p>
            <div className="innerGroup">
              <button
                type="button"
                className="itemButton option"
                title="Duplicate ~ Ctrl + d"
                onClick={() =>
                  duplicateElement(
                    selectedElement,
                    setElements as (
                      action: (prev: DrawElement[]) => DrawElement[]
                    ) => void,
                    setSelectedElement,
                    10
                  )
                }
              >
                <Duplicate />
              </button>
              <button
                type="button"
                onClick={() =>
                  deleteElement(
                    selectedElement,
                    setElements as (
                      action: (prev: DrawElement[]) => DrawElement[]
                    ) => void,
                    setSelectedElement
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
