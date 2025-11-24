import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  FileExcelOutlined,
  UploadOutlined,
  InboxOutlined,
  CloudDownloadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Space,
  Table,
  Tag,
  Upload,
  Progress,
  Alert,
  List,
  Typography,
  Card,
  Tooltip,
  Select,
} from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import {
  deleteSurveyService,
  downloadExcelFile,
  exportAllSurveysToExcelService,
  exportWardWiseSurveysToExcelService,
  exportPropertyRangeSurveysToExcelService,
  getAllSurveysService,
  importSurveysFromExcelService,
  downloadExcelTemplateService,
} from "../../services/surveyservices";
import { handleError } from "../../utils/handleError";

const { Search } = Input;
const { Dragger } = Upload;
const { Text, Title } = Typography;

// Interfaces
interface SurveyData {
  id: number;
  ward_no: number;
  property_no: string;
  old_ward_no?: string;
  old_property_no?: string;
  property_description?: string;
  address?: string;
  address_marathi?: string;
  water_connection_available?: string;
  number_of_water_connections?: number;
  connection_size?: string;
  remarks?: string;
  remarks_marathi?: string;
  created_at: string;
  created_by?: string;
}

interface ExportFormValues {
  export_type?: string;
  ward_no?: number;
  property_no_start?: number;
  property_no_end?: number;
}

interface ImportResult {
  success: boolean;
  message: string;
  success_count: number;
  error_count: number;
  errors: string[];
}

const Surveys = () => {
  const permissions = useSelector((state: any) => state.user?.permissions);
  const [surveys, setSurveys] = useState<SurveyData[]>([]);
  const [filteredSurveys, setFilteredSurveys] = useState<SurveyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Export Modal States
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportType, setExportType] = useState<string>("all"); // all, ward-wise, property-range

  // Import Modal States
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [templateDownloading, setTemplateDownloading] = useState(false);

  const pageSize = 10;
  const navigate = useNavigate();
  const [exportForm] = Form.useForm();

  // Fetch all surveys
  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const response = (await getAllSurveysService()) as any;
      const rawData = Array.isArray(response)
        ? response
        : (response && response.results) || (response && response.data) || [];

      const data: SurveyData[] = rawData.map((item: any) => ({
        id: item.id,
        created_by: item.created_by,
        ward_no: item.ward_no,
        property_no: item.property_no,
        old_ward_no: item.old_ward_no,
        old_property_no: item.old_property_no,
        property_description: item.property_description,
        address: item.address,
        address_marathi: item.address_marathi,
        water_connection_available: item.water_connection_available,
        number_of_water_connections: item.number_of_water_connections,
        connection_size: item.connection_size,
        remarks: item.remarks,
        remarks_marathi: item.remarks_marathi,
        created_at: item.created_at,
      }));

      setSurveys(data);
      setFilteredSurveys(data);
    } catch (err) {
      handleError(err);
      console.error("Error fetching surveys:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  // Filters state
  const [filters, setFilters] = useState({
    wardNo: "",
    propertyNo: "",
    propertyDescription: "",
  });

  // Search functionality
  const handleSearch = (field: string, value: string) => {
    const updatedFilters = { ...filters, [field]: value };
    setFilters(updatedFilters);

    const filtered = surveys.filter((survey) => {
      return (
        (!updatedFilters.wardNo ||
          (survey.ward_no || "").toString().includes(updatedFilters.wardNo)) &&
        (!updatedFilters.propertyNo ||
          (survey.property_no || "")
            .toLowerCase()
            .includes(updatedFilters.propertyNo.toLowerCase())) &&
        (!updatedFilters.propertyDescription ||
          (survey.property_description || "")
            .toLowerCase()
            .includes(updatedFilters.propertyDescription.toLowerCase()))
      );
    });

    setFilteredSurveys(filtered);
    setCurrentPage(1);
  };

  // Delete survey
  const handleDelete = async (id: number) => {
    if (permissions === "all" || permissions.includes("deletesurvey")) {
      setLoading(true);
      try {
        await deleteSurveyService(id);
        toast.success("Survey deleted successfully");
        await fetchSurveys();
      } catch (err) {
        handleError(err);
        console.error("Error deleting survey:", err);
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("You dont have permission for this");
    }
  };

  // Edit survey
  const handleEdit = async (id: number) => {
    if (permissions === "all" || permissions.includes("editsurvey")) {
      navigate(`/survey/edit/${id}`);
    } else {
      toast.error("You dont have permission for this");
    }
  };

  // View survey
  const handleView = (id: number) => {
    navigate(`/survey/${id}`);
  };

  // ============================================
  // EXPORT FUNCTIONS - 3 Types
  // ============================================

  const showExportModal = () => {
    setExportModalVisible(true);
    setExportType("all");
    exportForm.resetFields();
  };

  const handleExportCancel = () => {
    setExportModalVisible(false);
    exportForm.resetFields();
    setExportType("all");
  };

  // 1. Export All Surveys
  const handleExportAll = async () => {
    setExportLoading(true);
    try {
      const blob = await exportAllSurveysToExcelService();
      const filename = `Survey_All_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      downloadExcelFile(blob, filename);
      toast.success("All surveys exported successfully!");
      setExportModalVisible(false);
    } catch (err) {
      handleError(err);
    } finally {
      setExportLoading(false);
    }
  };

  // 2. Export Ward-wise
  const handleExportWardWise = async (values: any) => {
    if (!values.ward_no) {
      toast.error("Please select a ward number");
      return;
    }

    setExportLoading(true);
    try {
      const exportParams = {
        ward_no: values.ward_no,
      };

      const blob = await exportWardWiseSurveysToExcelService(exportParams);
      const filename = `Survey_Ward_${values.ward_no}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;

      downloadExcelFile(blob, filename);

      toast.success("Ward-wise surveys exported successfully!");
      setExportModalVisible(false);
      exportForm.resetFields();
    } catch (err) {
      handleError(err);
    } finally {
      setExportLoading(false);
    }
  };

  // 3. Export Property Range-wise
  const handleExportPropertyRange = async (values: any) => {
    if (!values.ward_no) {
      toast.error("Please enter ward number");
      return;
    }

    if (!values.property_no_start || !values.property_no_end) {
      toast.error("Please enter property number range");
      return;
    }

    if (values.property_no_start > values.property_no_end) {
      toast.error(
        "Property start number should be less than or equal to end number"
      );
      return;
    }

    setExportLoading(true);
    try {
      const exportParams = {
        ward_no: values.ward_no,
        property_no_start: values.property_no_start,
        property_no_end: values.property_no_end,
      };

      const blob = await exportPropertyRangeSurveysToExcelService(exportParams);
      const filename = `Survey_Ward_${values.ward_no}_Property_${
        values.property_no_start
      }_to_${values.property_no_end}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;

      downloadExcelFile(blob, filename);

      toast.success("Property range surveys exported successfully!");
      setExportModalVisible(false);
      exportForm.resetFields();
    } catch (err) {
      handleError(err);
    } finally {
      setExportLoading(false);
    }
  };

  // Main export handler
  const handleExportSubmit = async (values: ExportFormValues) => {
    if (exportType === "all") {
      await handleExportAll();
    } else if (exportType === "ward-wise") {
      await handleExportWardWise(values);
    } else if (exportType === "property-range") {
      await handleExportPropertyRange(values);
    }
  };

  // Get unique ward numbers for dropdown
  const getUniqueWardNumbers = () => {
    const wardNumbers = [...new Set(surveys.map((survey) => survey.ward_no))];
    return wardNumbers.filter((ward) => ward).sort((a, b) => a - b);
  };

  // Import Functions
  const showImportModal = () => {
    setImportModalVisible(true);
    setImportResult(null);
    setUploadedFile(null);
  };

  const handleImportCancel = () => {
    setImportModalVisible(false);
    setImportResult(null);
    setUploadedFile(null);
  };

  const handleFileUpload = async (file: File) => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!validTypes.includes(file.type)) {
      toast.error("Please upload only Excel files (.xlsx or .xls)");
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB");
      return false;
    }

    setUploadedFile(file);
    setImportResult(null);
    return false;
  };

  const handleImportSubmit = async () => {
    if (!uploadedFile) {
      toast.error("Please select an Excel file to import");
      return;
    }

    setImportLoading(true);
    try {
      const result = await importSurveysFromExcelService(uploadedFile);
      setImportResult(result);

      if (result.success) {
        toast.success(
          `Import completed! ${result.success_count} surveys imported successfully`
        );
        if (result.error_count > 0) {
          toast.warning(`${result.error_count} records had errors`);
        }
        await fetchSurveys();
      } else {
        toast.error(result.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Import failed");
      setImportResult({
        success: false,
        message: err.message || "Import failed",
        success_count: 0,
        error_count: 0,
        errors: [],
      });
    } finally {
      setImportLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setTemplateDownloading(true);
    try {
      const blob = await downloadExcelTemplateService();
      const filename = `Survey_Import_Template_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      downloadExcelFile(blob, filename);
      toast.success("Template downloaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to download template");
    } finally {
      setTemplateDownloading(false);
    }
  };

  const uploadProps = {
    name: "excel_file",
    multiple: false,
    accept: ".xlsx,.xls",
    beforeUpload: handleFileUpload,
    onRemove: () => {
      setUploadedFile(null);
      setImportResult(null);
    },
    fileList: uploadedFile
      ? [
          {
            uid: "1",
            name: uploadedFile.name,
            status: "done" as const,
            size: uploadedFile.size,
          },
        ]
      : [],
    showUploadList: {
      showPreviewIcon: false,
      showDownloadIcon: false,
    },
  };

  // Table columns
  const columns = [
    {
      title: "Sr. No",
      key: "srno",
      width: 70,
      render: (_: any, __: SurveyData, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Ward/Property",
      key: "property_info",
      render: (record: SurveyData) => (
        <div>
          <div className="font-medium">Ward: {record.ward_no}</div>
          <div className="text-sm text-gray-500">
            Property: {record.property_no}
          </div>
        </div>
      ),
      sorter: (a: SurveyData, b: SurveyData) =>
        (a.property_no || "").localeCompare(b.property_no || ""),
    },
    {
      title: "Property Description",
      dataIndex: "property_description",
      key: "property_description",
      render: (type: string) => (
        <Tag color="blue" className="text-xs">
          {type || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
      render: (address: string) => address || "N/A",
    },
    {
      title: "Created By",
      dataIndex: "created_by",
      key: "created_by",
    },
    {
      title: "Created Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => {
        try {
          return new Date(date).toLocaleDateString("en-IN");
        } catch {
          return "N/A";
        }
      },
      sorter: (a: SurveyData, b: SurveyData) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: "right" as const,
      render: (_: any, record: SurveyData) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            title="View Survey"
            onClick={() => handleView(record.id)}
          />
          <Button
            icon={<EditOutlined />}
            size="small"
            title="Edit Survey"
            onClick={() => handleEdit(record.id)}
          />
          <Popconfirm
            title="Delete this survey?"
            description="Are you sure you want to delete this survey?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              title="Delete Survey"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageMeta title="Surveys" description="Manage all property surveys" />
      <PageBreadcrumb pageTitle="Property Surveys" />

      <ComponentCard
        title="All Property Surveys"
        addButtonText="Create New Survey"
        onAddClick={() => navigate("/create-survey")}
      >
        {/* Search Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <Search
            placeholder="Search by Ward No"
            onChange={(e) => handleSearch("wardNo", e.target.value)}
            allowClear
            className="w-full"
          />
          <Search
            placeholder="Search by Property No"
            onChange={(e) => handleSearch("propertyNo", e.target.value)}
            allowClear
            className="w-full"
          />
          <Search
            placeholder="Search by Property Description"
            onChange={(e) =>
              handleSearch("propertyDescription", e.target.value)
            }
            allowClear
            className="w-full"
          />
        </div>

        {/* Export/Import Buttons */}
        <div className="flex justify-end mb-4 space-x-2">
          <Tooltip title="Import surveys from Excel file">
            <Button
              type="default"
              icon={<UploadOutlined />}
              onClick={showImportModal}
              className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 text-white"
            >
              Import Excel
            </Button>
          </Tooltip>
          <Tooltip title="Export surveys to Excel file">
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={showExportModal}
              className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
            >
              Export Excel
            </Button>
          </Tooltip>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {surveys.length}
            </div>
            <div className="text-gray-500 text-sm">Total Surveys</div>
          </Card>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {getUniqueWardNumbers().length}
            </div>
            <div className="text-gray-500 text-sm">Wards Covered</div>
          </Card>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {filteredSurveys.length}
            </div>
            <div className="text-gray-500 text-sm">Filtered Results</div>
          </Card>
        </div>

        {/* Survey Table */}
        <Table
          columns={columns}
          className="custom-orders-table"
          dataSource={filteredSurveys}
          loading={loading}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} surveys`,
            onChange: (page) => setCurrentPage(page),
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </ComponentCard>

      {/* ============================================ */}
      {/* EXPORT MODAL - 3 Export Types */}
      {/* ============================================ */}
      <Modal
        title={
          <div className="flex items-center">
            <FileExcelOutlined className="mr-2 text-green-600" />
            <span>Export Survey Data to Excel</span>
          </div>
        }
        open={exportModalVisible}
        onCancel={handleExportCancel}
        footer={null}
        width={600}
      >
        <Divider />

        {/* Export Type Selection */}
        <Form form={exportForm} layout="vertical" onFinish={handleExportSubmit}>
          <Form.Item
            label={
              <span className="font-medium text-base">
                Select Export Type <span className="text-red-500">*</span>
              </span>
            }
          >
            <div className="grid grid-cols-3 gap-3">
              <Button
                size="large"
                type={exportType === "all" ? "primary" : "default"}
                onClick={() => {
                  setExportType("all");
                  exportForm.resetFields([
                    "ward_no",
                    "property_no_start",
                    "property_no_end",
                  ]);
                }}
                className="!h-20 flex flex-col items-center justify-center"
              >
                <FileExcelOutlined className="text-xl mb-1" />
                <span className="text-xs">All Surveys</span>
              </Button>

              <Button
                size="large"
                type={exportType === "ward-wise" ? "primary" : "default"}
                onClick={() => {
                  setExportType("ward-wise");
                  exportForm.resetFields([
                    "property_no_start",
                    "property_no_end",
                  ]);
                }}
                className="!h-20 flex flex-col items-center justify-center"
              >
                <FileExcelOutlined className="text-xl mb-1" />
                <span className="text-xs">Ward-wise</span>
              </Button>

              <Button
                size="large"
                type={exportType === "property-range" ? "primary" : "default"}
                onClick={() => {
                  setExportType("property-range");
                }}
                className="!h-20 flex flex-col items-center justify-center"
              >
                <FileExcelOutlined className="text-xl mb-1" />
                <span className="text-xs PY-5">Property Range</span>
              </Button>
            </div>
          </Form.Item>

          <Divider />

          {/* Export Type 1: All Surveys */}
          {exportType === "all" && (
            <Card className="bg-blue-50 border-blue-200">
              <p className="text-center text-blue-800">
                ✅ Export all {surveys.length} surveys to Excel file
              </p>
              <p className="text-center text-sm text-blue-600 mt-2">
                No additional parameters needed
              </p>
            </Card>
          )}

          {/* Export Type 2: Ward-wise */}
          {exportType === "ward-wise" && (
            <>
              <Form.Item
                name="ward_no"
                label={
                  <span className="font-medium">
                    Ward Number <span className="text-red-500">*</span>
                  </span>
                }
                rules={[
                  { required: true, message: "Please select a ward number!" },
                ]}
              >
                <Select
                  placeholder="Select Ward Number"
                  options={getUniqueWardNumbers().map((ward) => ({
                    label: `Ward ${ward}`,
                    value: ward,
                  }))}
                />
              </Form.Item>

              <Alert
                type="info"
                message="Ward-wise Export"
                description="Export all surveys for the selected ward"
                showIcon
              />
            </>
          )}

          {/* Export Type 3: Property Range */}
          {exportType === "property-range" && (
            <>
              <Form.Item
                name="ward_no"
                label={
                  <span className="font-medium">
                    Ward Number <span className="text-red-500">*</span>
                  </span>
                }
                rules={[
                  { required: true, message: "Please select a ward number!" },
                ]}
              >
                <Select
                  placeholder="Select Ward Number"
                  options={getUniqueWardNumbers().map((ward) => ({
                    label: `Ward ${ward}`,
                    value: ward,
                  }))}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="property_no_start"
                    label={
                      <span className="font-medium">
                        Property No (From){" "}
                        <span className="text-red-500">*</span>
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please enter start property number!",
                      },
                      {
                        type: "number",
                        min: 1,
                        message: "Property number must be positive!",
                      },
                    ]}
                  >
                    <InputNumber
                      placeholder="1"
                      style={{ width: "100%" }}
                      min={1}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="property_no_end"
                    label={
                      <span className="font-medium">
                        Property No (To) <span className="text-red-500">*</span>
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please enter end property number!",
                      },
                      {
                        type: "number",
                        min: 1,
                        message: "Property number must be positive!",
                      },
                    ]}
                  >
                    <InputNumber
                      placeholder="100"
                      style={{ width: "100%" }}
                      min={1}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Alert
                type="info"
                message="Property Range Export"
                description="Export surveys within the specified property number range for the selected ward"
                showIcon
              />
            </>
          )}

          <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
            <Button onClick={handleExportCancel} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={exportLoading}
              icon={<DownloadOutlined />}
              size="large"
              className="bg-green-600 hover:bg-green-700"
            >
              {exportLoading ? "Exporting..." : "Export Excel"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* IMPORT MODAL */}
      <Modal
        title={
          <div className="flex items-center">
            <UploadOutlined className="mr-2 text-blue-600" />
            <span>Import Survey Data from Excel</span>
          </div>
        }
        open={importModalVisible}
        onCancel={handleImportCancel}
        footer={null}
        width={700}
      >
        <Divider />

        <Card className="mb-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <CloudDownloadOutlined className="text-orange-600 mr-2" />
                <Text strong className="text-orange-800">
                  🏗️ Download Import Template
                </Text>
              </div>
              <div className="text-sm text-orange-700 mb-2">
                Sample data with ready-to-use Excel template
              </div>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
              loading={templateDownloading}
              className="bg-gradient-to-r from-orange-600 to-yellow-600 border-0 ml-4"
            >
              {templateDownloading ? "Downloading..." : "Download Template"}
            </Button>
          </div>
        </Card>

        <div className="mb-4">
          <Title level={5} className="mb-2 flex items-center">
            <InboxOutlined className="mr-2" />
            Select Excel File <span className="text-red-500 ml-1">*</span>
          </Title>

          <Dragger
            {...uploadProps}
            className={`mb-4 ${
              uploadedFile ? "border-green-300 bg-green-50" : ""
            }`}
            disabled={importLoading}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined
                style={{ color: uploadedFile ? "#52c41a" : undefined }}
              />
            </p>
            <p className="ant-upload-text">
              {uploadedFile
                ? `Selected: ${uploadedFile.name}`
                : "Click or drag Excel file to upload"}
            </p>
            <p className="ant-upload-hint">
              Support for .xlsx and .xls files only. Maximum: 10MB
            </p>
          </Dragger>
        </div>

        {importLoading && (
          <Card className="mb-4">
            <div className="flex items-center space-x-3">
              <Progress
                type="circle"
                percent={100}
                status="active"
                size={50}
                showInfo={false}
              />
              <div>
                <Text strong className="text-blue-600">
                  Processing Excel file...
                </Text>
              </div>
            </div>
          </Card>
        )}

        {importResult && (
          <Card className="mb-4">
            <Alert
              type={importResult.success ? "success" : "error"}
              message={importResult.message}
              description={
                <div className="mt-2">
                  {importResult.success_count > 0 && (
                    <div className="text-green-600 mb-2">
                      ✅ Successfully imported: {importResult.success_count}{" "}
                      surveys
                    </div>
                  )}
                  {importResult.error_count > 0 && (
                    <div className="text-red-600 mb-2">
                      ❌ Errors: {importResult.error_count} records
                    </div>
                  )}
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div>
                      <Text strong className="text-red-600">
                        Error Details:
                      </Text>
                      <List
                        size="small"
                        bordered
                        dataSource={importResult.errors.slice(0, 5)}
                        renderItem={(error, index) => (
                          <List.Item>
                            <Text className="text-sm text-red-600">
                              {index + 1}. {error}
                            </Text>
                          </List.Item>
                        )}
                      />
                    </div>
                  )}
                </div>
              }
            />
          </Card>
        )}

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button onClick={handleImportCancel} size="large">
            {importResult?.success ? "Close" : "Cancel"}
          </Button>
          {!importResult?.success && (
            <Button
              type="primary"
              onClick={handleImportSubmit}
              loading={importLoading}
              disabled={!uploadedFile}
              icon={<UploadOutlined />}
              size="large"
            >
              {importLoading ? "Importing..." : "Import Data"}
            </Button>
          )}
        </div>
      </Modal>
    </>
  );
};

export default Surveys;
