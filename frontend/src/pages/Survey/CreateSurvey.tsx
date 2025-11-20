import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { addSurveyService } from "../../services/surveyservices";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import {
  propertyDescriptionOptions,
  connectionSizes,
  propertyTypeOptions,
  connectionTypeOptions,
} from "../../services/surveydropdownmenu";
import { handleError } from "../../utils/handleError";
import { Button, Modal } from "antd";
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
  readOnly?: boolean;
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
    readOnly = false,
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
            readOnly={readOnly}
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
            readOnly={readOnly}
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
  number_of_building: string;
  water_connection_owner_name: string;
  water_connection_owner_name_marathi: string;
  connection_type: string;
  connection_size: string;
  number_of_water_connections: string;
  mobile_number: string;
  address: string;
  address_marathi: string;
  road_name: string;
  pincode: string;
  pending_tax: string;
  current_tax: string;
  total_tax: string;
  connection_photo: File | null;
  remarks: string;
  remarks_marathi: string;
}

const CreateSurvey = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Form state - EXACT SEQUENCE
  const [formData, setFormData] = useState<SurveyFormData>({
    old_connection_number: "",
    ward_no: "",
    property_no: "",
    property_description: "",
    property_owner_name: "",
    property_owner_name_marathi: "",
    property_type: "",
    number_of_building: "",
    water_connection_owner_name: "",
    water_connection_owner_name_marathi: "",
    connection_type: "",
    connection_size: "",
    number_of_water_connections: "",
    mobile_number: "",
    address: "",
    address_marathi: "",
    road_name: "",
    pincode: "",
    pending_tax: "",
    current_tax: "",
    total_tax: "",
    connection_photo: null,
    remarks: "",
    remarks_marathi: "",
  });

  // Single checkbox state for both owner name sync
  const [sameOwnerNames, setSameOwnerNames] = useState(false);

  // Translate helper - AUTO-TRANSLATE TO MARATHI
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

  // Auto-calculate total tax whenever pending/current tax changes
  useEffect(() => {
    const pending = parseFloat(formData.pending_tax) || 0;
    const current = parseFloat(formData.current_tax) || 0;
    const total = pending + current;
    setFormData((prev) => ({
      ...prev,
      total_tax: total ? total.toString() : "",
    }));
  }, [formData.pending_tax, formData.current_tax]);

  // Handle input change - WITH AUTO-TRANSLATION & CHECKBOX LOGIC
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
      if (name === "property_type" && value !== "बहुमजली इमारत") {
        return {
          ...prev,
          property_type: String(value),
          number_of_building: "",
        };
      }
      return { ...prev, [name]: value };
    });

    // Sync water connection owner names if checkbox is checked and relevant fields changed
    if (sameOwnerNames) {
      if (name === "property_owner_name") {
        setFormData((prev) => ({
          ...prev,
          water_connection_owner_name: value as string,
        }));
      }
      if (name === "property_owner_name_marathi") {
        setFormData((prev) => ({
          ...prev,
          water_connection_owner_name_marathi: value as string,
        }));
      }
    }

    // Auto-translate to Marathi for certain fields
    const englishToMarathiMap: Record<string, string> = {
      property_owner_name: "property_owner_name_marathi",
      water_connection_owner_name: "water_connection_owner_name_marathi",
      address: "address_marathi",
      remarks: "remarks_marathi",
    };

    if (typeof value === "string" && englishToMarathiMap[name]) {
      const marathiField = englishToMarathiMap[name];
      const translatedText = await translateToMarathi(value);
      setFormData((prev) => ({ ...prev, [marathiField]: translatedText }));

      if (name === "property_owner_name" && sameOwnerNames) {
        setFormData((prev) => ({
          ...prev,
          water_connection_owner_name_marathi: translatedText,
        }));
      }
    }
  };

  // Submit handler using axios
  // Submit handler using axios
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Basic validation
      if (!formData.ward_no || !formData.property_no) {
        toast.error("Please fill in Ward No and Property No");
        setIsLoading(false);
        return;
      }

      // Prepare FormData
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          submitData.append(key, value);
        } else if (value !== null) {
          submitData.append(key, String(value));
        }
      });

      // Call the service
      const response = await addSurveyService(submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(response.data?.message || "Survey created successfully!");

      // Reset form and checkbox
      setFormData({
        old_connection_number: "",
        ward_no: "",
        property_no: "",
        property_description: "",
        property_owner_name: "",
        property_owner_name_marathi: "",
        property_type: "",
        number_of_building: "",
        water_connection_owner_name: "",
        water_connection_owner_name_marathi: "",
        connection_type: "",
        connection_size: "",
        number_of_water_connections: "",
        mobile_number: "",
        address: "",
        address_marathi: "",
        road_name: "",
        pincode: "",
        pending_tax: "",
        current_tax: "",
        total_tax: "",
        connection_photo: null,
        remarks: "",
        remarks_marathi: "",
      });
      setSameOwnerNames(false);
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        handleError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

const startCamera = async () => {
  setShowCamera(true);
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  } catch (error) {
    console.error("Camera error:", error);
    toast.error("Camera not accessible");
  }
};

const stopCamera = () => {
  setShowCamera(false);
  const stream = videoRef.current?.srcObject as MediaStream;
  stream?.getTracks().forEach((track) => track.stop());
};

const captureImage = () => {
  if (!videoRef.current || !canvasRef.current) return;

  const video = videoRef.current;
  const canvas = canvasRef.current;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageData = canvas.toDataURL("image/jpeg");

  setCapturedImage(imageData); // preview दाखवण्यासाठी

  // Convert base64 → File
  const arr = imageData.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);

  const file = new File([u8arr], "connection_photo.jpg", { type: mime });

  setFormData((prev) => ({
    ...prev,
    connection_photo: file,   
  }));

  stopCamera();
};

const removeImage = () => {
  setCapturedImage(null);
  setFormData((prev) => ({ ...prev, connection_photo: null }));
};


  return (
    <>
      <PageMeta title="Create Survey" description="Create a new survey entry" />
      <PageBreadcrumb pageTitle="Create New Survey" />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Connection History
              </h3>
            </div>

            {/* Ward and Property */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Property Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              </div>
            </div>

            {/* Owner names, property type and description */}
            <div>
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
                <InputField
                  label="Property Type"
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleChange}
                  type="select"
                  options={propertyTypeOptions}
                  placeholder="Select property type"
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

            {/* Conditional number_of_building field - only if बहुमजली इमारत selected */}
            {formData.property_type === "बहुमजली इमारत" && (
              <div className="mt-4">
                <InputField
                  label="Number of Buildings"
                  name="number_of_building"
                  value={formData.number_of_building}
                  onChange={handleChange}
                  placeholder="Enter number of buildings"
                  type="number"
                />
              </div>
            )}

            {/* Connection Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Connection Details
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

            {/* Water connection owner names and sync checkbox */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
              <InputField
                label="Water Connection Owner Name (English)"
                placeholder="Enter connection owner name"
                name="water_connection_owner_name"
                value={formData.water_connection_owner_name}
                onChange={handleChange}
              />
              <InputField
                label="पाणी कनेक्शन मालक नाव (मराठी)"
                placeholder="मालक नाव टाका (auto-filled)"
                name="water_connection_owner_name_marathi"
                value={formData.water_connection_owner_name_marathi}
                onChange={handleChange}
                isMarathi={true}
              />
              <label className="flex items-center text-sm ml-2">
                <input
                  type="checkbox"
                  checked={sameOwnerNames}
                  onChange={(e) => {
                    setSameOwnerNames(e.target.checked);
                    if (e.target.checked) {
                      setFormData((prev) => ({
                        ...prev,
                        water_connection_owner_name: prev.property_owner_name,
                        water_connection_owner_name_marathi:
                          prev.property_owner_name_marathi,
                      }));
                    }
                  }}
                />
                <span className="ml-1">
                  Same as Owner Name / [translate:मालक नावासारखेच]
                </span>
              </label>
            </div>

            {/* Connection type and size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Connection Type"
                name="connection_type"
                value={formData.connection_type}
                onChange={handleChange}
                type="select"
                options={connectionTypeOptions}
                placeholder="Select connection type"
              />
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

            {/* Number of water connections and mobile number */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Number of Water Connections"
                  placeholder="Enter number"
                  type="number"
                  name="number_of_water_connections"
                  value={formData.number_of_water_connections}
                  onChange={handleChange}
                />
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

            {/* Connection photo */}
           <div>
  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
    Connection Photo
  </h3>

  <div className="space-y-3">
    <button
      type="button"
      onClick={startCamera}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
    >
      Capture Image
    </button>

    {capturedImage && (
      <div className="relative w-40">
        <img
          src={capturedImage}
          className="w-40 h-32 object-cover rounded-md"
        />
        <button
          type="button"
          onClick={removeImage}
          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
        >
          ×
        </button>
      </div>
    )}
  </div>
</div>

<Modal
  title="Capture Connection Photo"
  open={showCamera}
  onCancel={stopCamera}
  footer={[
    <Button key="cancel" onClick={stopCamera}>Cancel</Button>,
    <Button key="capture" type="primary" onClick={captureImage}>Capture</Button>,
  ]}
  width={700}
>
  <div className="text-center">
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="w-full max-w-md mx-auto rounded-lg"
    />
    <canvas ref={canvasRef} style={{ display: "none" }} />
  </div>
</Modal>

            {/* Address fields */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Address
              </h3>
              <div className="grid grid-cols-2 gap-5">
                <InputField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  type="textarea"
                  placeholder="Enter full address"
                />
                <InputField
                  label="पत्ता (मराठी)"
                  name="address_marathi"
                  value={formData.address_marathi}
                  onChange={handleChange}
                  type="textarea"
                  placeholder="पत्ता टाका (auto-filled)"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                {/* <InputField
                  label="Road Name"
                  name="road_name"
                  value={formData.road_name}
                  onChange={handleChange}
                  placeholder="Enter road name"
                /> */}
                <InputField
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Enter pincode"
                  type="text"
                />
              </div>
            </div>

            {/* Tax Information */}
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
                  placeholder="Total tax will be calculated automatically"
                  readOnly
                />
              </div>
            </div>

            {/* Remarks */}
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
