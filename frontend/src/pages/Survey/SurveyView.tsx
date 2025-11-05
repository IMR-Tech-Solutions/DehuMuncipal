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
import { Spin, Tag, Row, Col, Button } from "antd";
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
      property_no: "Property Number",
      property_description: "Property Description",
      property_owner_name: "Property Owner Name",
      property_owner_name_marathi: "मालक नाव (मराठी)",
      property_type: "Property Type",
      water_connection_owner_name: "Connection Owner Name",
      water_connection_owner_name_marathi: "कनेक्शन मालक नाव (मराठी)",
      connection_type: "Connection Type",
      new_connection_number: "New Connection Number",
      connection_size: "Connection Size",
      number_of_water_connections: "Number of Water Connections",
      mobile_number: "Mobile Number",
      address: "Address",
      pending_tax: "Pending Tax",
      current_tax: "Current Tax",
      total_tax: "Total Tax",
      connection_photo: "Connection Photo",
      remarks: "Remarks",
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
      property_description: <FileTextOutlined className="text-purple-500" />,
      property_owner_name: <UserOutlined className="text-cyan-500" />,
      property_owner_name_marathi: <UserOutlined className="text-cyan-400" />,
      property_type: <HomeOutlined className="text-orange-500" />,
      water_connection_owner_name: <IdcardOutlined className="text-teal-500" />,
      water_connection_owner_name_marathi: (
        <IdcardOutlined className="text-teal-400" />
      ),
      connection_type: <FileTextOutlined className="text-blue-600" />,
      new_connection_number: <NumberOutlined className="text-indigo-500" />,
      connection_size: <NumberOutlined className="text-teal-500" />,
      number_of_water_connections: <NumberOutlined className="text-lime-500" />,
      mobile_number: <UserOutlined className="text-rose-500" />,
      address: <EnvironmentOutlined className="text-orange-500" />,
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

    // Image field
    if (key === "connection_photo" && value) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 underline"
        >
          View Photo
        </a>
      );
    }

    // Datetime formatting
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

    // Decimal-like money fields: format to 2 decimals
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

  const shouldSkipField = (key: string) => {
    return key === "id";
  };

  // Group fields - EXACT SEQUENCE
  const groupFields = (fields: [string, any][]) => {
    const groups = {
      "Connection History": [] as [string, any][],
      "Property Information": [] as [string, any][],
      "Property Owner": [] as [string, any][],
      "Property Type": [] as [string, any][],
      "Water Connection Owner": [] as [string, any][],
      "Connection Details": [] as [string, any][],
      Address: [] as [string, any][],
      "Tax Information": [] as [string, any][],
      "Connection Photo": [] as [string, any][],
      Remarks: [] as [string, any][],
      "System Information": [] as [string, any][],
    };

    const connectionHistoryFields = ["old_connection_number"];
    const propertyFields = ["ward_no", "property_no", "property_description"];
    const propertyOwnerFields = [
      "property_owner_name",
      "property_owner_name_marathi",
    ];
    const propertyTypeFields = ["property_type"];
    const waterOwnerFields = [
      "water_connection_owner_name",
      "water_connection_owner_name_marathi",
    ];
    const connectionFields = [
      "connection_type",
      "new_connection_number",
      "connection_size",
      "number_of_water_connections",
      "mobile_number",
    ];
    const addressFields = ["address"];
    const taxFields = ["pending_tax", "current_tax", "total_tax"];
    const photoFields = ["connection_photo"];
    const remarkFields = ["remarks", "remarks_marathi"];
    const systemFields = ["created_at", "updated_at", "created_by"];

    fields.forEach(([key, value]) => {
      if (connectionHistoryFields.includes(key)) {
        groups["Connection History"].push([key, value]);
      } else if (propertyFields.includes(key)) {
        groups["Property Information"].push([key, value]);
      } else if (propertyOwnerFields.includes(key)) {
        groups["Property Owner"].push([key, value]);
      } else if (propertyTypeFields.includes(key)) {
        groups["Property Type"].push([key, value]);
      } else if (waterOwnerFields.includes(key)) {
        groups["Water Connection Owner"].push([key, value]);
      } else if (connectionFields.includes(key)) {
        groups["Connection Details"].push([key, value]);
      } else if (addressFields.includes(key)) {
        groups["Address"].push([key, value]);
      } else if (taxFields.includes(key)) {
        groups["Tax Information"].push([key, value]);
      } else if (photoFields.includes(key)) {
        groups["Connection Photo"].push([key, value]);
      } else if (remarkFields.includes(key)) {
        groups["Remarks"].push([key, value]);
      } else if (systemFields.includes(key)) {
        groups["System Information"].push([key, value]);
      }
    });

    return groups;
  };

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

      {/* Header Card */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 bg-gray-100 dark:bg-gray-800 lg:p-6 mb-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            {/* Icon */}
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 bg-blue-100 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>

            {/* Title + Info */}
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                Water Connection Survey - Ward {survey?.ward_no}, Property{" "}
                {survey?.property_no}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Survey ID: {survey?.id || id}
                </p>
                {survey?.created_at && (
                  <>
                    <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Created:{" "}
                      {new Date(survey.created_at).toLocaleDateString("en-IN")}
                    </p>
                  </>
                )}
                {typeof survey?.total_tax !== "undefined" &&
                  survey?.total_tax !== null && (
                    <>
                      <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Tax:{" "}
                        {Number(survey.total_tax).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </>
                  )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
          {/* Survey Information - Grouped */}
          <div className="lg:col-span-2">
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 bg-gray-100 dark:bg-gray-800 lg:p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-800 dark:text:white/90 mb-6">
                Survey Information
              </h4>

              {/* Group and render fields */}
              {(() => {
                const allFields = Object.entries(survey).filter(
                  ([key]) => !shouldSkipField(key)
                );
                const groupedFields = groupFields(allFields);

                return Object.entries(groupedFields).map(
                  ([groupName, fields]) => {
                    if (fields.length === 0) return null;

                    return (
                      <div key={groupName} className="mb-8 last:mb-0">
                        <h5 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
                          {groupName}
                        </h5>
                        <Row gutter={[16, 16]}>
                          {fields.map(([key, value]) => (
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
                  }
                );
              })()}
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
