import { useEffect, useState } from 'react';

export interface ILocalStorageEvent extends Event {
  key: string;
  value: any;
}

type LocalStorageValue<T> = T | null;

type Config<T> = {
  key: string;
  initialValue: T;
};

const useLocalStorage = <T = any>(
  config: Config<T>,
): [LocalStorageValue<T>, (value: T | ((val: LocalStorageValue<T>) => T)) => void, boolean] => {
  const [storedValue, setStoredValue] = useState<LocalStorageValue<T>>(null);
  const [loading, setLoading] = useState(true);

  // Update the localStorage whenever the state changes
  const setValue = (value: T | ((val: LocalStorageValue<T>) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      localStorage.setItem(config.key, JSON.stringify(valueToStore));

      const event = new Event('onChangeLocalStorage') as ILocalStorageEvent;
      event.key = config.key;
      event.value = valueToStore;
      window.dispatchEvent(event);
    } catch (error) {
      console.error(error);
    }
  };

  const getValue = (): T => {
    if (typeof window === 'undefined') {
      return config.initialValue;
    }
    try {
      const item = localStorage.getItem(config.key);
      return item ? JSON.parse(item) : config.initialValue;
    } catch (error) {
      console.error(error);
      return config.initialValue;
    }
  };

  useEffect(() => {
    setStoredValue(getValue());
    setLoading(false);

    const handleChange: EventListener = (e) => {
      const ev = e as ILocalStorageEvent;
      if (ev.key !== config.key || ev.type !== "onChangeLocalStorage") return;
      setStoredValue(ev.value);
    };

    window.addEventListener("onChangeLocalStorage", handleChange);
    return () => {
      window.removeEventListener("onChangeLocalStorage", handleChange);
    };
  }, [config.key]);

  return [storedValue, setValue, loading];
};

export default useLocalStorage;
