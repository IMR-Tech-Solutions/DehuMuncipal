export const getChangedFormData = (
  original: Record<string, any>,
  updated: Record<string, any>,
  file?: File | null,
  fileKey: string = "user_image"
): FormData => {
  const formData = new FormData();

  Object.entries(updated).forEach(([key, value]) => {
    if (original[key] !== value && value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  if (file) {
    formData.append(fileKey, file);
  }

  return formData;
};
