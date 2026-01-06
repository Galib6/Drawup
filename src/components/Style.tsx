import React, { ChangeEvent, useEffect, useState } from "react";
import {
    Backward,
    Delete,
    Duplicate,
    Forward,
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
import { DrawElement, ElementStyle, SelectedElement } from "../types";

interface ElementStyleState {
  fill: string | undefined;
  strokeWidth: number | undefined;
  strokeStyle: "solid" | "dashed" | "dotted" | undefined;
  strokeColor: string | undefined;
  opacity: number | undefined;
  borderRadius: number | undefined;
}

interface StyleProps {
  selectedElement: (SelectedElement & ElementStyle) | ElementStyle;
}

export default function Style({ selectedElement }: StyleProps): JSX.Element | null {
  const { elements, setElements, setSelectedElement, setStyle } = useAppContext();

  const [elementStyle, setElementStyle] = useState<ElementStyleState>({
    fill: selectedElement?.fill,
    strokeWidth: selectedElement?.strokeWidth,
    strokeStyle: selectedElement?.strokeStyle,
    strokeColor: selectedElement?.strokeColor,
    opacity: selectedElement?.opacity,
    borderRadius: selectedElement?.borderRadius,
  });

  useEffect(() => {
    setElementStyle({
      fill: selectedElement?.fill,
      strokeWidth: selectedElement?.strokeWidth,
      strokeStyle: selectedElement?.strokeStyle,
      strokeColor: selectedElement?.strokeColor,
      opacity: selectedElement?.opacity,
      borderRadius: selectedElement?.borderRadius,
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
          <input
            type="range"
            className="itemRange"
            min={0}
            max={20}
            value={elementStyle.strokeWidth ?? 0}
            step="1"
            onChange={({ target }: ChangeEvent<HTMLInputElement>) => {
              setStylesStates({ strokeWidth: minmax(+target.value, [0, 20]) });
              if (selectedId) {
                updateElement(
                  selectedId,
                  { strokeWidth: minmax(+target.value, [0, 20]) },
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
      <div className="group opacity">
        <p>Angles</p>
        <div className="innerGroup">
          <input
            type="range"
            min={0}
            max={100}
            className="itemRange"
            value={elementStyle.borderRadius ?? 0}
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
      </div>
      <div className="group opacity">
        <p>Opacity</p>
        <div className="innerGroup">
          <input
            type="range"
            min={0}
            max={100}
            className="itemRange"
            value={elementStyle.opacity ?? 100}
            step="10"
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
            </div>
          </div>
        </React.Fragment>
      )}
    </section>
  );
}
