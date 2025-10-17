import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Spin, Alert, Button } from 'antd';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  getSingleSurveyService,
  updateSurveyService,
} from '../../services/surveyservices';
import { propertyDescriptionOptions, connectionSizes } from '../../services/surveydropdownmenu';
import { handleError } from '../../utils/handleError';

// InputField Component
interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  isMarathi?: boolean;
}

const InputField = React.memo<InputFieldProps>(
  ({
    label,
    name,
    value,
    onChange,
    type = "text",
    placeholder = "",
    required = false,
    options = [],
    isMarathi = false,
  }) => {
    const inputId = `input-${name}`;

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        {type === "select" ? (
          <select
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-white dark:bg-gray-800 px-4 py-2.5 text-sm ${
              isMarathi ? "font-marathi" : ""
            }`}
          >
            <option value="">{placeholder}</option>
            {options.map((option, index) => (
              <option key={`${name}-option-${index}`} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-white dark:bg-gray-800 px-4 py-2.5 text-sm resize-none ${
              isMarathi ? "font-marathi" : ""
            }`}
            placeholder={placeholder}
            rows={3}
          />
        ) : (
          <input
            id={inputId}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-white dark:bg-gray-800 px-4 py-2.5 text-sm ${
              isMarathi ? "font-marathi" : ""
            }`}
            placeholder={placeholder}
          />
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";

// Survey Form Data Interface
interface SurveyFormData {
  ward_no: string;
  property_no: string;
  old_ward_no: string;
  old_property_no: string;
  property_description: string;
  address: string;
  address_marathi: string;
  water_connection_available: string;
  number_of_water_connections: string;
  connection_size: string;
  remarks: string;
  remarks_marathi: string;
}

const EditSurvey = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<SurveyFormData>({
    ward_no: "",
    property_no: "",
    old_ward_no: "",
    old_property_no: "",
    property_description: "",
    address: "",
    address_marathi: "",
    water_connection_available: "",
    number_of_water_connections: "",
    connection_size: "",
    remarks: "",
    remarks_marathi: "",
  });

  // Translation helper - AUTO-TRANSLATE TO MARATHI
  const translateToMarathi = async (englishText: string) => {
    if (!englishText) return "";
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          englishText
        )}&langpair=en|mr`
      );
      const data = await response.json();
      return data.responseData.translatedText;
    } catch (error) {
      console.error("Translation error:", error);
      return "";
    }
  };

  // Fetch survey data
  const fetchSurveyData = async () => {
    try {
      setIsInitialLoading(true);
      setFetchError(null);

      const idNumber = Number(id);
      if (isNaN(idNumber)) {
        throw new Error("Invalid survey ID");
      }

      const surveyData = await getSingleSurveyService(idNumber);

      if (!surveyData) {
        throw new Error("No survey data received from server");
      }

      // Populate form data
      setFormData({
        ward_no: surveyData.ward_no?.toString() || "",
        property_no: surveyData.property_no?.toString() || "",
        old_ward_no: surveyData.old_ward_no?.toString() || "",
        old_property_no: surveyData.old_property_no?.toString() || "",
        property_description: surveyData.property_description || "",
        address: surveyData.address || "",
        address_marathi: surveyData.address_marathi || "",
        water_connection_available: surveyData.water_connection_available || "",
        number_of_water_connections: surveyData.number_of_water_connections?.toString() || "",
        connection_size: surveyData.connection_size || "",
        remarks: surveyData.remarks || "",
        remarks_marathi: surveyData.remarks_marathi || "",
      });

      toast.success("Survey data loaded successfully!");
    } catch (error) {
      console.error("Error fetching survey data:", error);
      let errorMessage = "Failed to load survey data";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setFetchError(errorMessage);
      handleError(error);
      toast.error(errorMessage);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSurveyData();
    } else {
      setFetchError("No survey ID provided");
      setIsInitialLoading(false);
    }
  }, [id]);

  // Handle input change - WITH AUTO-TRANSLATION
  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Clear dependent fields
      if (name === "water_connection_available" && value !== "Yes") {
        newData.number_of_water_connections = "";
        newData.connection_size = "";
      }

      return newData;
    });

    // Auto-translate to Marathi for address and remarks
    const englishToMarathiMap: Record<string, string> = {
      address: "address_marathi",
      remarks: "remarks_marathi",
    };

    if (englishToMarathiMap[name]) {
      const marathiField = englishToMarathiMap[name];
      const translatedText = await translateToMarathi(value);
      setFormData((prev) => ({ ...prev, [marathiField]: translatedText }));
    }
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.ward_no || !formData.property_no) {
        toast.error("Please fill in Ward No and Property No");
        return;
      }

      // Submit data
      const result = await updateSurveyService(parseInt(id || "0"), formData);
      toast.success("Survey updated successfully!");
      console.log("Survey Response:", result);
      navigate("/surveys");
    } catch (error) {
      console.error(error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner
  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-gray-800">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Loading survey data...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Survey ID: {id}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (fetchError) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 p-6">
        <PageMeta title="Edit Survey - Error" description="Error loading survey data" />
        <PageBreadcrumb pageTitle="Edit Survey" />

        <div className="max-w-2xl mx-auto">
          <Alert
            message="Failed to Load Survey Data"
            description={
              <div>
                <p className="mb-2">{fetchError}</p>
                <p className="text-sm text-gray-600">Survey ID: {id}</p>
              </div>
            }
            type="error"
            showIcon
            action={
              <div className="space-x-2">
                <Button size="small" onClick={fetchSurveyData}>
                  Retry
                </Button>
                <Button size="small" onClick={() => navigate("/surveys")}>
                  Back to Surveys
                </Button>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Edit Survey" description="Edit existing survey data" />
      <PageBreadcrumb pageTitle="Edit Survey" />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Edit Survey Information
            </h2>
            <button
              onClick={() => navigate("/surveys")}
              className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <ArrowLeftOutlined />
              Back
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Basic Property Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Basic Property Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <InputField
                  label="Ward No"
                  placeholder="Enter Ward No"
                  type="number"
                  name="ward_no"
                  value={formData.ward_no}
                  onChange={handleChange}
                  required
                />
                <InputField
                  label="Property No"
                  placeholder="Enter Property No"
                  name="property_no"
                  value={formData.property_no}
                  onChange={handleChange}
                  required
                />
                <InputField
                  label="Old Ward No"
                  placeholder="Enter Old Ward No"
                  name="old_ward_no"
                  value={formData.old_ward_no}
                  onChange={handleChange}
                />
                <InputField
                  label="Old Property No"
                  placeholder="Enter Old Property No"
                  name="old_property_no"
                  value={formData.old_property_no}
                  onChange={handleChange}
                />
                {/* Property Description as Dropdown */}
                <InputField
                  label="Property Description"
                  name="property_description"
                  value={formData.property_description}
                  onChange={handleChange}
                  type="select"
                  options={propertyDescriptionOptions}
                  placeholder="Select property description"
                />
              </div>
            </div>

            {/* Address - WITH AUTO-TRANSLATION */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  type="textarea"
                  placeholder="Enter address (auto-translates to Marathi)"
                />
                <InputField
                  label="पत्ता (मराठी)"
                  name="address_marathi"
                  value={formData.address_marathi}
                  onChange={handleChange}
                  type="textarea"
                  placeholder="पत्ता टाका (auto-filled)"
                  isMarathi={true}
                />
              </div>
            </div>

            {/* Water Connection - WITH CONNECTION SIZE DROPDOWN */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Water Connection
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <InputField
                  label="Water Connection Available"
                  name="water_connection_available"
                  value={formData.water_connection_available}
                  onChange={handleChange}
                  type="select"
                  options={["Yes", "No"]}
                  placeholder="Select availability"
                />
                {formData.water_connection_available === "Yes" && (
                  <>
                    <InputField
                      label="Number of Water Connections"
                      name="number_of_water_connections"
                      value={formData.number_of_water_connections}
                      onChange={handleChange}
                      type="number"
                      placeholder="Number of connections"
                    />
                    {/* Connection Size as Dropdown */}
                    <InputField
                      label="Connection Size"
                      name="connection_size"
                      value={formData.connection_size}
                      onChange={handleChange}
                      type="select"
                      options={connectionSizes}
                      placeholder="Select connection size"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Remarks - WITH AUTO-TRANSLATION */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Remarks
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  type="textarea"
                  placeholder="Enter remarks (auto-translates to Marathi)"
                />
                <InputField
                  label="टिप्पणी (मराठी)"
                  name="remarks_marathi"
                  value={formData.remarks_marathi}
                  onChange={handleChange}
                  type="textarea"
                  placeholder="टिप्पणी टाका (auto-filled)"
                  isMarathi={true}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/surveys")}
              className="px-8 py-3 rounded-md font-medium border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-8 py-3 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isLoading
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isLoading ? "Updating Survey..." : "Update Survey"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditSurvey;
