import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import {
  getSingleSurveyService,
  downloadSurveyReport,
} from "../../services/surveyservices";
import { handleError } from "../../utils/handleError";
import { toast } from "react-toastify";
import { Spin, Row, Col, Button } from "antd";
import {
  ArrowLeftOutlined,
  HomeOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
  NumberOutlined,
  FileTextOutlined,
  DollarOutlined,
  IdcardOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

const SurveyView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSurvey = async () => {
    setLoading(true);
    try {
      const data = await getSingleSurveyService(Number(id));
      setSurvey(data);
    } catch (err) {
      handleError(err);
      console.error("Error fetching survey:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const formatFieldName = (key: string) => {
    const specialFormats: { [key: string]: string } = {
      old_connection_number: "Old Connection Number",
      ward_no: "Ward Number",
      ward_name: "Ward Name",
      property_no: "Property Number",
      property_type: "Property Type",
      number_of_building: "Number of Building",
      property_description: "Property Description",
      property_owner_name: "Owner Name (English)",
      property_owner_name_marathi: "मालक नाव (मराठी)",
      water_connection_owner_name: "Connection Owner Name",
      water_connection_owner_name_marathi: "कनेक्शन मालक नाव (मराठी)",
      connection_type: "Connection Type",
      connection_size: "Connection Size",
      number_of_water_connections: "Number of Water Connections",
      mobile_number: "Mobile Number",
      address: "Address",
      address_marathi: "पत्ता (मराठी)",
//       pincode: "Pincode",
      pending_tax: "Pending Tax",
      current_tax: "Current Tax",
      total_tax: "Total Tax",
      connection_photo: "Connection Photo",
      remarks: "Remarks (English)",
      remarks_marathi: "टिप्पणी (मराठी)",
      created_at: "Created At",
      updated_at: "Updated At",
      created_by: "Created By",
    };
    return (
      specialFormats[key] ||
      key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  const getFieldIcon = (key: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      old_connection_number: <NumberOutlined className="text-gray-500" />,
      ward_no: <NumberOutlined className="text-blue-500" />,
      property_no: <HomeOutlined className="text-blue-500" />,
      property_type: <HomeOutlined className="text-orange-500" />,
      number_of_building: <HomeOutlined className="text-green-500" />,
      property_description: <FileTextOutlined className="text-purple-500" />,
      property_owner_name: <UserOutlined className="text-cyan-500" />,
      property_owner_name_marathi: <UserOutlined className="text-cyan-400" />,
      water_connection_owner_name: <IdcardOutlined className="text-teal-500" />,
      water_connection_owner_name_marathi: (
        <IdcardOutlined className="text-teal-400" />
      ),
      connection_type: <FileTextOutlined className="text-blue-600" />,
      connection_size: <NumberOutlined className="text-teal-500" />,
      number_of_water_connections: <NumberOutlined className="text-lime-500" />,
      mobile_number: <UserOutlined className="text-rose-500" />,
      address: <EnvironmentOutlined className="text-orange-500" />,
      address_marathi: <EnvironmentOutlined className="text-blue-700" />,
      road_name: <EnvironmentOutlined className="text-green-500" />,
//       pincode: <EnvironmentOutlined className="text-gray-500" />,
      pending_tax: <DollarOutlined className="text-emerald-500" />,
      current_tax: <DollarOutlined className="text-emerald-500" />,
      total_tax: <DollarOutlined className="text-emerald-600" />,
      connection_photo: <FileTextOutlined className="text-violet-500" />,
      remarks: <FileTextOutlined className="text-gray-500" />,
      remarks_marathi: <FileTextOutlined className="text-gray-400" />,
      created_at: <CalendarOutlined className="text-green-500" />,
      updated_at: <CalendarOutlined className="text-green-500" />,
      created_by: <UserOutlined className="text-indigo-500" />,
    };
    return iconMap[key] || <InfoCircleOutlined className="text-gray-500" />;
  };

  const isDecimalLike = (key: string) =>
    key === "pending_tax" || key === "current_tax" || key === "total_tax";

  const renderValue = (key: string, value: any) => {
    if (value === null || value === "" || value === undefined) {
      return <span className="text-gray-500 dark:text-gray-400">-</span>;
    }
    if (key === "connection_photo" && value) {
  return (
    <img
      src={`${import.meta.env.VITE_API_IMG_URL}${value}`}
      alt="Connection Photo"
      style={{
        maxWidth: "120px",
        maxHeight: "80px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
        border: "1px solid #e5e7eb"
      }}
    />
  );
}

    if (key.includes("_at") || key === "created_at" || key === "updated_at") {
      try {
        return (
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">
            {new Date(value).toLocaleString("en-IN")}
          </span>
        );
      } catch (e) {
        return (
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">
            {String(value)}
          </span>
        );
      }
    }
    if (isDecimalLike(key)) {
      const asNumber = typeof value === "number" ? value : Number(value);
      if (!Number.isNaN(asNumber)) {
        return (
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">
            {asNumber.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        );
      }
    }
    return (
      <span className="text-sm font-medium text-gray-800 dark:text-white/90">
        {String(value)}
      </span>
    );
  };

  const shouldSkipField = (key: string) => key === "id";

  // --- Updated Group Function ---
  const groupedFieldList = [
    {
      group: "Connection History",
      fields: ["old_connection_number"],
    },
    {
      group: "Property Information",
      fields: [
        "ward_no",
        "property_no",
        "property_type",
        "number_of_building",
        "property_description",
      ],
    },
    {
      group: "Property Owner",
      fields: ["property_owner_name", "property_owner_name_marathi"],
    },
    {
      group: "Water Connection Owner",
      fields: ["water_connection_owner_name", "water_connection_owner_name_marathi"],
    },
    {
      group: "Connection Details",
      fields: ["connection_type", "connection_size"],
    },
    {
      group: "Water Connection Mobile",
      fields: ["number_of_water_connections", "mobile_number"],
    },
    {
      group: "Address",
      fields: ["address", "address_marathi"],
    },
    {
      group: "Tax Information",
      fields: ["pending_tax", "current_tax", "total_tax"],
    },
    {
      group: "Connection Photo",
      fields: ["connection_photo"],
    },
    {
      group: "Remarks",
      fields: ["remarks", "remarks_marathi"],
    },
    {
      group: "System Information",
      fields: ["created_at", "updated_at", "created_by"],
    },
  ];

  const handleDownloadReport = async () => {
    try {
      await downloadSurveyReport(Number(id));
      toast.success("Report downloaded successfully!");
    } catch (error) {
      handleError(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Survey Details"
        description="View property survey details"
      />
      <PageBreadcrumb pageTitle="Survey Details" />

      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 bg-gray-100 dark:bg-gray-800 lg:p-6 mb-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 bg-blue-100 flex items-center justify-center">
             <img
                src={`${import.meta.env.VITE_API_IMG_URL}${survey?.connection_photo}`}
                alt="Connection Photo"
                
            />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                Water Connection Survey - Ward {survey?.ward_no}, Property {survey?.property_no}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Survey ID: {survey?.id || id}
                </p>
                {survey?.created_at && (
                  <>
                    <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Created: {new Date(survey.created_at).toLocaleDateString("en-IN")}
                    </p>
                  </>
                )}
                {typeof survey?.total_tax !== "undefined" && survey?.total_tax !== null && (
                  <>
                    <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Tax: {Number(survey.total_tax).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full lg:w-auto">
            <button
              onClick={() => navigate(-1)}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
            >
              <ArrowLeftOutlined className="w-4 h-4" />
              Back
            </button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownloadReport}
              className="w-full lg:w-auto"
            >
              Download Report
            </Button>
          </div>
        </div>
      </div>

      {survey ? (
        <div>
          <div className="lg:col-span-2">
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 bg-gray-100 dark:bg-gray-800 lg:p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-800 dark:text:white/90 mb-6">
                Survey Information
              </h4>
              {groupedFieldList.map(({ group, fields }) => {
                const groupFields = fields
                  .map((key) => [key, survey[key]])
                  .filter(([key]) => !shouldSkipField(key));
                if (!groupFields.length) return null;
                return (
                  <div key={group} className="mb-8 last:mb-0">
                    <h5 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
                      {group}
                    </h5>
                    <Row gutter={[16, 16]}>
                      {groupFields.map(([key, value]) => (
                        <Col xs={24} sm={12} lg={8} key={key}>
                          <div className="group p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-md">
                            <div className="flex items-start gap-3">
                              <div className="mt-1 p-2 rounded-lg bg-white dark:bg-gray-400 shadow-sm">
                                {getFieldIcon(key)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                  {formatFieldName(key)}
                                </p>
                                <div className="group-hover:scale-105 transition-transform duration-200">
                                  {renderValue(key, value)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              No Survey Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              The requested survey could not be found.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default SurveyView;
