import api from "./baseapi";

export const getSummary = async () => {
  const response = await api.get("reports/summary/");
  return response.data;
};

export const getSurveyStatsService = async () => {
  try {
    const response = await api.get("surveys/statistics/");
    return response.data.data;
  } catch (error: any) {
    throw new Error('Failed to fetch survey statistics');
  }
};