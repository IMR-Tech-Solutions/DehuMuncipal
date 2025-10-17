import React, { useState } from "react";
import { toast } from "react-toastify";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { addSurveyService } from "../../services/surveyservices";
import { propertyDescriptionOptions, connectionSizes } from "../../services/surveydropdownmenu";
import { handleError } from "../../utils/handleError";

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

const CreateSurvey = () => {
  const [isLoading, setIsLoading] = useState(false);

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
    const englishToMarathiMap: Record<
      | "remarks"
      | "address",
      string
    > = {
      address: "address_marathi",
      remarks: "remarks_marathi",
    };

    if (Object.prototype.hasOwnProperty.call(englishToMarathiMap, name)) {
      const marathiField =
        englishToMarathiMap[name as keyof typeof englishToMarathiMap];
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
      const result = await addSurveyService(formData);
      toast.success("Survey created successfully!");
      console.log("Survey Response:", result);

      // Reset form
      setFormData({
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
    } catch (error) {
      console.error(error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Create Survey"
        description="Create a new survey entry"
      />
      <PageBreadcrumb pageTitle="Create New Survey" />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Survey Information
          </h2>
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
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-8 py-3 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isLoading
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isLoading ? "Creating Survey..." : "Create Survey"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateSurvey;
