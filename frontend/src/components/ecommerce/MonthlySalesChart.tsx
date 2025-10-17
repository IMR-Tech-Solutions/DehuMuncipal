import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";
import { getSurveyStatsService } from "../../services/summaryservice";

export default function MonthlySurveyChart() {
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getSurveyStatsService();
        setStatsData(data);
      } catch (e) {
        console.error("Can't Fetch Survey Stats", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const categories = statsData?.monthly_trend?.map((item: any) => item.month) || [];
  const seriesData = statsData?.monthly_trend?.map((item: any) => item.count) || [];

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 250,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: true,
      },
      y: {
        formatter: (val: number) => `${val} surveys`,
      },
    },
  };

  const series = [
    {
      name: "Surveys",
      data: seriesData,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Monthly Survey Trend
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Survey completion over the last 12 months
          </p>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-[250px]">
              <p className="text-gray-500 animate-pulse">Loading chart...</p>
            </div>
          ) : seriesData.length > 0 ? (
            <Chart options={options} series={series} type="bar" height={250} />
          ) : (
            <div className="flex items-center justify-center h-[250px]">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
