import React, { useState } from "react";
import { toast } from "react-toastify";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { addSurveyService } from "../../services/surveyservices";
import {
  propertyDescriptionOptions,
  connectionSizes,
  propertyTypeOptions,
  connectionTypeOptions,
} from "../../services/surveydropdownmenu";
import { handleError } from "../../utils/handleError";

// InputField Component
interface InputFieldProps {
  label: string;
  name: string;
  value: string | File | null;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
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
            value={value as string}
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
            value={value as string}
            onChange={onChange}
            className={`w-full border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-white dark:bg-gray-800 px-4 py-2.5 text-sm resize-none ${
              isMarathi ? "font-marathi" : ""
            }`}
            placeholder={placeholder}
            rows={3}
          />
        ) : type === "file" ? (
          <input
            id={inputId}
            type="file"
            name={name}
            onChange={onChange}
            className={`w-full border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-white dark:bg-gray-800 px-4 py-2.5 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
            accept="image/*"
          />
        ) : (
          <input
            id={inputId}
            type={type}
            name={name}
            value={value as string}
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

// Survey Form Data Interface - EXACT SEQUENCE
interface SurveyFormData {
  old_connection_number: string;
  ward_no: string;
  property_no: string;
  property_description: string;
  property_owner_name: string;
  property_owner_name_marathi: string;
  property_type: string;
  water_connection_owner_name: string;
  water_connection_owner_name_marathi: string;
  connection_type: string;
  new_connection_number: string;
  connection_size: string;
  number_of_water_connections: string;
  mobile_number: string;
  address: string;
  pending_tax: string;
  current_tax: string;
  total_tax: string;
  connection_photo: File | null;
  remarks: string;
  remarks_marathi: string;
}

const CreateSurvey = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Form state - EXACT SEQUENCE
  const [formData, setFormData] = useState<SurveyFormData>({
    old_connection_number: "",
    ward_no: "",
    property_no: "",
    property_description: "",
    property_owner_name: "",
    property_owner_name_marathi: "",
    property_type: "",
    water_connection_owner_name: "",
    water_connection_owner_name_marathi: "",
    connection_type: "",
    new_connection_number: "",
    connection_size: "",
    number_of_water_connections: "",
    mobile_number: "",
    address: "",
    pending_tax: "",
    current_tax: "",
    total_tax: "",
    connection_photo: null,
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, type } = e.target;
    let value: string | File | null = "";

    if (type === "file") {
      const fileInput = e.target as HTMLInputElement;
      value = fileInput.files ? fileInput.files[0] : null;
    } else {
      value = (
        e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      ).value;
    }

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      return newData;
    });

    // Auto-translate to Marathi
    const englishToMarathiMap: Record<string, string> = {
      property_owner_name: "property_owner_name_marathi",
      water_connection_owner_name: "water_connection_owner_name_marathi",
      remarks: "remarks_marathi",
    };

    if (typeof value === "string" && englishToMarathiMap[name]) {
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

      // Create FormData for file upload
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof SurveyFormData];
        if (value instanceof File) {
          submitData.append(key, value);
        } else if (value !== null && value !== "") {
          submitData.append(key, String(value));
        }
      });

      // Submit data
      const result = await addSurveyService(submitData);
      toast.success("Survey created successfully!");
      console.log("Survey Response:", result);

      // Reset form
      setFormData({
        old_connection_number: "",
        ward_no: "",
        property_no: "",
        property_description: "",
        property_owner_name: "",
        property_owner_name_marathi: "",
        property_type: "",
        water_connection_owner_name: "",
        water_connection_owner_name_marathi: "",
        connection_type: "",
        new_connection_number: "",
        connection_size: "",
        number_of_water_connections: "",
        mobile_number: "",
        address: "",
        pending_tax: "",
        current_tax: "",
        total_tax: "",
        connection_photo: null,
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
      <PageMeta title="Create Survey" description="Create a new survey entry" />
      <PageBreadcrumb pageTitle="Create New Survey" />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Water Connection Survey
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* 1. Old Connection Number */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Connection History
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Old Connection Number"
                  placeholder="Enter old connection number"
                  name="old_connection_number"
                  value={formData.old_connection_number}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* 2-4. Ward, Property, Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Property Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                  label="Property Description"
                  name="property_description"
                  value={formData.property_description}
                  onChange={handleChange}
                  type="select"
                  options={propertyDescriptionOptions}
                  placeholder="Select description"
                />
              </div>
            </div>

            {/* 5-6. Property Owner */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Property Owner
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Owner Name (English)"
                  placeholder="Enter owner name"
                  name="property_owner_name"
                  value={formData.property_owner_name}
                  onChange={handleChange}
                />
                <InputField
                  label="मालक नाव (मराठी)"
                  placeholder="मालक नाव टाका (auto-filled)"
                  name="property_owner_name_marathi"
                  value={formData.property_owner_name_marathi}
                  onChange={handleChange}
                  isMarathi={true}
                />
              </div>
            </div>

            {/* 7. Property Type */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Property Type
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Property Type"
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleChange}
                  type="select"
                  options={propertyTypeOptions}
                  placeholder="Select property type"
                />
              </div>
            </div>

            {/* 8-9. Water Connection Owner */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Water Connection Owner
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Owner Name (English)"
                  placeholder="Enter connection owner name"
                  name="water_connection_owner_name"
                  value={formData.water_connection_owner_name}
                  onChange={handleChange}
                />
                <InputField
                  label="मालक नाव (मराठी)"
                  placeholder="मालक नाव टाका (auto-filled)"
                  name="water_connection_owner_name_marathi"
                  value={formData.water_connection_owner_name_marathi}
                  onChange={handleChange}
                  isMarathi={true}
                />
              </div>
            </div>

            {/* 10. Connection Type */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Connection Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <InputField
                  label="Connection Type"
                  name="connection_type"
                  value={formData.connection_type}
                  onChange={handleChange}
                  type="select"
                  options={connectionTypeOptions}
                  placeholder="Select connection type"
                />
                {/* 11. New Connection Number */}
                <InputField
                  label="New Connection Number"
                  placeholder="Enter new connection number"
                  name="new_connection_number"
                  value={formData.new_connection_number}
                  onChange={handleChange}
                />
                {/* 12. Connection Size */}
                <InputField
                  label="Connection Size"
                  name="connection_size"
                  value={formData.connection_size}
                  onChange={handleChange}
                  type="select"
                  options={connectionSizes}
                  placeholder="Select connection size"
                />
              </div>
            </div>

            {/* 13-14. Water Connection Details */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 13. Number of Connections */}
                <InputField
                  label="Number of Water Connections"
                  placeholder="Enter number"
                  type="number"
                  name="number_of_water_connections"
                  value={formData.number_of_water_connections}
                  onChange={handleChange}
                />
                {/* 14. Mobile Number */}
                <InputField
                  label="Mobile Number"
                  placeholder="Enter mobile number"
                  type="tel"
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* 15. Address */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Address
              </h3>
              <div className="grid grid-cols-1 gap-5">
                <InputField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  type="textarea"
                  placeholder="Enter full address"
                />
              </div>
            </div>

            {/* 16-18. Tax Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Tax Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <InputField
                  label="Pending Tax"
                  name="pending_tax"
                  value={formData.pending_tax}
                  onChange={handleChange}
                  type="number"
                  placeholder="Enter pending tax"
                />
                <InputField
                  label="Current Tax"
                  name="current_tax"
                  value={formData.current_tax}
                  onChange={handleChange}
                  type="number"
                  placeholder="Enter current tax"
                />
                <InputField
                  label="Total Tax"
                  name="total_tax"
                  value={formData.total_tax}
                  onChange={handleChange}
                  type="number"
                  placeholder="Enter total tax"
                />
              </div>
            </div>

            {/* 19. Connection Photo */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Connection Photo
              </h3>
              <div className="grid grid-cols-1 gap-5">
                <InputField
                  label="Upload Photo"
                  name="connection_photo"
                  value={formData.connection_photo}
                  onChange={handleChange}
                  type="file"
                />
              </div>
            </div>

            {/* 20-21. Remarks */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Remarks
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Remarks (English)"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  type="textarea"
                  placeholder="Enter remarks (auto-translates)"
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
