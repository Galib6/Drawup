import { useEffect, useState } from "react";
import { Dimension } from "../types";

export default function useDimension(): Dimension {
  const [dimension, setDimension] = useState<Dimension>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = (): void => {
      setDimension({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return dimension;
}
