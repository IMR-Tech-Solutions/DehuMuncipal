// hooks/useChangedFields.ts
import { useRef } from "react";

export const useChangedFields = <T extends Record<string, any>>() => {
  const originalDataRef = useRef<T | null>(null);

  const setOriginalData = (data: T) => {
    originalDataRef.current = { ...data };
  };

  const getChangedFields = (
    currentValues: Partial<T>,
    fileFields: string[] = []
  ) => {
    const updateData: Partial<T> = {};
    const originalData = originalDataRef.current;

    if (!originalData) return currentValues;

    Object.keys(currentValues).forEach((key) => {
      if (fileFields.includes(key)) {
        // Special handling for file inputs
        if (currentValues[key] && (currentValues[key] as any).length > 0) {
          updateData[key as keyof T] = currentValues[key as keyof T]!;
        }
      } else {
        // Compare other fields with original data
        if (currentValues[key] !== originalData[key]) {
          updateData[key as keyof T] = currentValues[key as keyof T]!;
        }
      }
    });

    return updateData;
  };

  const hasChanges = (currentValues: Partial<T>, fileFields: string[] = []) => {
    const changes = getChangedFields(currentValues, fileFields);
    return Object.keys(changes).length > 0;
  };

  const clearOriginalData = () => {
    originalDataRef.current = null;
  };

  return {
    setOriginalData,
    getChangedFields,
    hasChanges,
    clearOriginalData,
  };
};

// Usage in your component:
// const { setOriginalData, getChangedFields, hasChanges, clearOriginalData } = useChangedFields<CategoryData>();
