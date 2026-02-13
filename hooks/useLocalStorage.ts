import { useState, useEffect } from "react";

/**
 * localStorage와 동기화되는 상태를 관리하는 hook
 * @param key - localStorage 키
 * @param initialValue - 초기값 (localStorage에 값이 없을 때 사용)
 * @returns [value, setValue, isLoading]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validator?: (value: unknown) => value is T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // 마운트 시 localStorage에서 값 읽기
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed: unknown = JSON.parse(item);
        const isValid = validator ? validator(parsed) : true;
        if (isValid) {
          setStoredValue(parsed as T);
        } else {
          setStoredValue(initialValue);
          window.localStorage.removeItem(key);
        }
      }
    } catch (error) {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
      console.warn(`Error reading localStorage key "${key}":`, error);
    } finally {
      setIsLoading(false);
    }
  }, [initialValue, key, validator]);

  // localStorage에 저장
  useEffect(() => {
    if (isLoading) return; // 초기 로딩 중에는 저장하지 않음

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue, isLoading]);

  return [storedValue, setStoredValue, isLoading];
}
