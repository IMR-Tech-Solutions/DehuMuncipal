import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Spin, Alert, Button, Modal } from "antd";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { ArrowLeftOutlined, DownloadOutlined } from "@ant-design/icons";
import {
  getSingleSurveyService,
  updateSurveyService,
  downloadSurveyReport,
} from "../../services/surveyservices";
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
          <div>
            <input
              id={inputId}
              type="file"
              name={name}
              onChange={onChange}
              className={`w-full border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-white dark:bg-gray-800 px-4 py-2.5 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
              accept="image/*"
            />
            {value && typeof value === "string" && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Current: {value}
              </p>
            )}
          </div>
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

// Survey Form Data Interface
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
  connection_photo: File | string | null;
  remarks: string;
  remarks_marathi: string;
}

const EditSurvey = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [sameOwnerNames, setSameOwnerNames] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Form state
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

  // Translation helper
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

  // Auto-calculate total tax
  useEffect(() => {
    const pending = parseFloat(formData.pending_tax) || 0;
    const current = parseFloat(formData.current_tax) || 0;
    const total = pending + current;
    setFormData((prev) => ({
      ...prev,
      total_tax: total ? total.toString() : "",
    }));
  }, [formData.pending_tax, formData.current_tax]);

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

      setFormData({
        old_connection_number: surveyData.old_connection_number || "",
        ward_no: surveyData.ward_no?.toString() || "",
        property_no: surveyData.property_no?.toString() || "",
        property_description: surveyData.property_description || "",
        property_owner_name: surveyData.property_owner_name || "",
        property_owner_name_marathi:
          surveyData.property_owner_name_marathi || "",
        property_type: surveyData.property_type || "",
        number_of_building: surveyData.number_of_building || "",
        water_connection_owner_name:
          surveyData.water_connection_owner_name || "",
        water_connection_owner_name_marathi:
          surveyData.water_connection_owner_name_marathi || "",
        connection_type: surveyData.connection_type || "",
        connection_size: surveyData.connection_size || "",
        number_of_water_connections:
          surveyData.number_of_water_connections?.toString() || "",
        mobile_number: surveyData.mobile_number || "",
        address: surveyData.address || "",
        address_marathi: surveyData.address_marathi || "",
        road_name: surveyData.road_name || "",
        pincode: surveyData.pincode || "",
        pending_tax: surveyData.pending_tax?.toString() || "",
        current_tax: surveyData.current_tax?.toString() || "",
        total_tax: surveyData.total_tax?.toString() || "",
        connection_photo: surveyData.connection_photo || null,
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

  // Handle input change with auto-translation & checkbox logic
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

    // Sync water connection owner names if checkbox is checked
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

    // Auto-translate to Marathi
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

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "environment" }, // Use back camera on mobile
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Camera access denied or not available");
    }
  };

   const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setShowCamera(false);
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
    setCapturedImage(imageData);

    // Convert base64 to File
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

  // Handle submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.ward_no || !formData.property_no) {
        toast.error("Please fill in Ward No and Property No");
        return;
      }

      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof SurveyFormData];

        if (key === "connection_photo" && typeof value === "string") {
          return;
        }

        if (value instanceof File) {
          submitData.append(key, value);
        } else if (value !== null && value !== "") {
          submitData.append(key, String(value));
        }
      });

      const result = await updateSurveyService(parseInt(id || "0"), submitData);
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

  const handleDownloadReport = async () => {
    try {
      await downloadSurveyReport(Number(id));
      toast.success("Report downloaded successfully!");
    } catch (error) {
      handleError(error);
      toast.error("Failed to download report");
    }
  };

  // Loading state
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

  // Error state
  if (fetchError) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 p-6">
        <PageMeta
          title="Edit Survey - Error"
          description="Error loading survey data"
        />
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
              Edit Water Connection Survey
            </h2>
            <div className="flex gap-2">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownloadReport}
              >
                Download Report
              </Button>
              <button
                onClick={() => navigate("/surveys")}
                className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <ArrowLeftOutlined />
                Back
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Property Information */}
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

            {/* Conditional number_of_building field */}
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
                  Same as Owner Name / मालक नावासारखेच
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

            {/* Connection photo with camera capture */}
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
                      alt="Captured"
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

                {/* Show existing photo if available */}
                {!capturedImage &&
                  formData.connection_photo &&
                  typeof formData.connection_photo === "string" && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Current photo: {formData.connection_photo}
                      </p>
                    </div>
                  )}
              </div>
            </div>

            <Modal
              title="Capture Connection Photo"
              open={showCamera}
              onCancel={stopCamera}
              footer={[
                <Button key="cancel" onClick={stopCamera}>
                  Cancel
                </Button>,
                <Button key="capture" type="primary" onClick={captureImage}>
                  Capture
                </Button>,
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
              {/* <div className="grid grid-cols-2 gap-5">
                <InputField
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Enter pincode"
                  type="text"
                />
              </div> */}
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