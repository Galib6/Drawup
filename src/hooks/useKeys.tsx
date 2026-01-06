import { useEffect, useState } from "react";

export default function useKeys(): Set<string> {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      setPressedKeys((prevKeys) => {
        const newKeys = new Set(prevKeys).add(event.key);
        return newKeys;
      });
    };

    const handleKeyUp = (event: KeyboardEvent): void => {
      setPressedKeys((prevKeys) => {
        const updatedKeys = new Set(prevKeys);
        updatedKeys.delete(event.key);
        return updatedKeys;
      });
    };

    const clearKeys = (): void => {
      setPressedKeys(new Set());
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearKeys);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearKeys);
    };
  }, []);

  return pressedKeys;
}
