import { getAllPaginatedData } from "./getpaginateddata";
import api from "./baseapi";

// 📄 Get All Surveys (Paginated)
export const getAllSurveysService = () => {
  return getAllPaginatedData("surveys/");
};

// ➕ Add Survey (Create New Survey)
export const addSurveyService = async (surveyData: any) => {
  const response = await api.post("surveys/create/", surveyData);
  return response.data;
};

// ❌ Delete Survey
export const deleteSurveyService = async (surveyID: number) => {
  await api.delete(`surveys/${surveyID}/`);
};

// 🔍 Get Single Survey
export const getSingleSurveyService = async (surveyID: number) => {
  const response = await api.get(`surveys/${surveyID}/`);
  return response.data;
};

// ✏️ Update Survey
export const updateSurveyService = async (
  surveyID: number,
  updatedData: any
) => {
  const response = await api.put(`surveys/${surveyID}/`, updatedData);
  return response.data;
};

// 📊 Export Surveys to Excel
export const exportSurveysToExcelService = async (exportParams: {
  ward_no: number;
  property_no_start: number;
  property_no_end: number;
}) => {
  try {
    const response = await api.post("surveys/export-excel/", exportParams, {
      responseType: "blob",
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 60000,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error(
        "No data found for the specified ward and property range"
      );
    } else if (error.response?.status === 400) {
      throw new Error("Invalid parameters provided");
    } else if (error.response?.status === 500) {
      throw new Error("Server error occurred during export");
    } else if (error.code === "ECONNABORTED") {
      throw new Error("Export timeout - please try with smaller range");
    } else {
      throw new Error("Failed to export data. Please try again.");
    }
  }
};

// 📥 Import Surveys from Excel
export const importSurveysFromExcelService = async (excelFile: File) => {
  try {
    const formData = new FormData();
    formData.append("excel_file", excelFile);

    const response = await api.post("surveys/import-excel/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000,
    });

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      const errorData = error.response.data;
      if (errorData.missing_columns) {
        throw new Error(
          `Missing required columns: ${errorData.missing_columns.join(", ")}`
        );
      }
      throw new Error(errorData.message || "Invalid file format or data");
    } else if (error.response?.status === 413) {
      throw new Error("File size too large. Please upload smaller file.");
    } else if (error.response?.status === 500) {
      throw new Error("Server error occurred during import");
    } else if (error.code === "ECONNABORTED") {
      throw new Error("Import timeout - please try with smaller file");
    } else {
      throw new Error(
        "Failed to import data. Please check file format and try again."
      );
    }
  }
};

// 🏗️ Download Excel Template
export const downloadExcelTemplateService = async () => {
  try {
    const response = await api.get("surveys/download-template/", {
      responseType: "blob",
      timeout: 30000,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error("Template service not available");
    } else if (error.response?.status === 500) {
      throw new Error("Server error occurred while generating template");
    } else if (error.code === "ECONNABORTED") {
      throw new Error("Template download timeout");
    } else {
      throw new Error("Failed to download template. Please try again.");
    }
  }
};

// 📤 Helper function to download blob as file
export const downloadExcelFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const downloadSurveyReport = async (surveyId: number) => {
  try {
    const response = await api.get(
      `/surveys/${surveyId}/download-report/`,
      {
        responseType: "blob",
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Survey-Report-${surveyId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
};
