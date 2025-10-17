import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";
import { getSurveyStatsService } from "../../services/summaryservice";

export default function WardWiseChart() {
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

  const categories = statsData?.ward_wise_distribution?.map((item: any) => `Ward ${item.ward_no}`) || [];
  const seriesData = statsData?.ward_wise_distribution?.map((item: any) => item.count) || [];

  const options: ApexOptions = {
    colors: ["#10b981"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 280,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 5,
        borderRadiusApplication: "end",
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      offsetX: 30,
      style: {
        fontSize: "12px",
        colors: ["#304758"],
      },
    },
    xaxis: {
      categories: categories,
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
    },
    tooltip: {
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
            Ward-wise Survey Distribution
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Top 10 wards by survey count
          </p>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-[280px]">
            <p className="text-gray-500 animate-pulse">Loading chart...</p>
          </div>
        ) : seriesData.length > 0 ? (
          <Chart options={options} series={series} type="bar" height={280} />
        ) : (
          <div className="flex items-center justify-center h-[280px]">
            <p className="text-gray-500">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
