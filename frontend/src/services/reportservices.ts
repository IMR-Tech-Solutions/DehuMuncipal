// src/services/reportservices.ts - Updated service functions
import api from "./baseapi";

// PDF Download Services
export const downloadSingle115PDF = async (surveyId: number) => {
  const response = await api.get(`115/single/${surveyId}`, {
    responseType: "blob",
  });
  return response.data;
};

// Updated function name and endpoint for combined PDF
export const downloadCombined115PDF = async (params: {
  ward_no: number;
  property_no_start?: number;
  property_no_end?: number;
}) => {
  const response = await api.post(`115/bulk/`, params, {
    responseType: "blob",
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 120000, // 2 minutes for large PDF files
  });
  return response.data;
};

export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
