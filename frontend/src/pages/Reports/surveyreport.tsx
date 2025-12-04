import { useCallback, useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  InputNumber,
  Row,
  Col,
  Divider,
  Tooltip,
  Checkbox,
} from "antd";
import {
  EyeOutlined,
  FilePdfOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import { toast } from "react-toastify";
import { getMiniSurveysService } from "../../services/surveyservices";
import { handleError } from "../../utils/handleError";
import {
  downloadSingle115PDF,
  downloadCombined115PDF,
  downloadFile,
} from "../../services/reportservices";

const { Search } = Input;

interface SurveyData {
  id: number;
  ward_no: number;
  property_no: string;
  created_at: string;
  created_by: string;
  zone_no?: number;
  property_owner_name?: string;
}

interface PDFBulkFormValues {
  ward_no: number;
  property_no_start?: number;
  property_no_end?: number;
  include_range: boolean;
}

const SurveyReports = () => {
  const [surveys, setSurveys] = useState<SurveyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSurveys, setTotalSurveys] = useState(0);
  const pageSize = 10;

  // ✅ FIXED: Simple search state - NO NodeJS types needed
  const [searchValue, setSearchValue] = useState("");
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  // PDF Modal States
  const [pdfBulkModalVisible, setPdfBulkModalVisible] = useState(false);
  const [pdfBulkLoading, setPdfBulkLoading] = useState(false);
  const [pdfBulkForm] = Form.useForm();
  const [includeRange, setIncludeRange] = useState(false);
  const [singlePdfLoading, setSinglePdfLoading] = useState<
    Record<number, boolean>
  >({});

  // ✅ FIXED: Proper fetchSurveys with filters and pagination
  const fetchSurveys = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const response = await getMiniSurveysService({
        page,
        search: search || undefined,
      }) as any;

      const rawData = response.results || response.data || [];
      const data: SurveyData[] = rawData.map((item: any) => ({
        id: item.id,
        ward_no: item.ward_no,
        property_no: item.property_no,
        property_owner_name: item.property_owner_name,
        created_by: item.created_by,
        created_at: item.created_at,
        zone_no: item.zone_no,
      }));

      setSurveys(data);
      setTotalSurveys(response.count || rawData.length);
      setCurrentPage(page);
    } catch (err) {
      handleError(err);
      console.error("Error fetching surveys:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSurveys(1);
  }, []);

  // ✅ FIXED: Debounced search - 100% browser compatible
  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);

    // Clear previous timeout
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }

    // Set new timeout using window.setTimeout (returns number)
    const newTimeoutId = window.setTimeout(() => {
      fetchSurveys(1, value);
    }, 500);

    setTimeoutId(newTimeoutId);
  }, [timeoutId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  // Pagination handler
  const handlePaginationChange = (page: number) => {
    fetchSurveys(page, searchValue);
  };

  const handleView = (id: number) => {
    window.open(`/survey/${id}`, "_blank");
  };

  // Single PDF
  const handleSinglePDFDownload = async (record: SurveyData) => {
    setSinglePdfLoading((prev) => ({ ...prev, [record.id]: true }));

    try {
      const blob = await downloadSingle115PDF(record.id);
      const filename = `Survey_Report_Ward_${record.ward_no}_Property_${record.property_no}.pdf`;
      downloadFile(blob, filename);
      toast.success("PDF downloaded successfully!");
    } catch (err: any) {
      handleError(err);
    } finally {
      setSinglePdfLoading((prev) => ({ ...prev, [record.id]: false }));
    }
  };

  // Combined PDF modal
  const showPdfBulkModal = () => {
    setPdfBulkModalVisible(true);
    pdfBulkForm.resetFields();
    setIncludeRange(false);
  };

  const handlePdfBulkCancel = () => {
    setPdfBulkModalVisible(false);
    pdfBulkForm.resetFields();
    setIncludeRange(false);
  };

  const handlePdfBulkSubmit = async (values: PDFBulkFormValues) => {
    if (includeRange && values.property_no_start && values.property_no_end) {
      if (values.property_no_start > values.property_no_end) {
        toast.error("Start property no should be <= end property no");
        return;
      }
    }

    setPdfBulkLoading(true);
    try {
      const payload: any = { ward_no: values.ward_no };
      if (includeRange) {
        payload.property_no_start = values.property_no_start;
        payload.property_no_end = values.property_no_end;
      }

      const blob = await downloadCombined115PDF(payload);
      const filename = includeRange
        ? `Survey_Combined_Ward_${values.ward_no}_${values.property_no_start}_to_${values.property_no_end}.pdf`
        : `Survey_Combined_Ward_${values.ward_no}_All.pdf`;

      downloadFile(blob, filename);
      toast.success("Combined PDF downloaded!");
      handlePdfBulkCancel();
    } catch (err: any) {
      handleError(err);
    } finally {
      setPdfBulkLoading(false);
    }
  };

  const columns = [
    {
      title: "Sr. No",
      key: "srno",
      width: 70,
      render: (_: any, __: SurveyData, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Ward | Property",
      key: "property_info",
      render: (record: SurveyData) => (
        <div>
          <div className="font-medium">Ward: {record.ward_no}</div>
          <div className="text-sm text-gray-500">Property: {record.property_no}</div>
        </div>
      ),
    },
    {
      title: "Owner Name",
      dataIndex: "property_owner_name",
      key: "property_owner_name",
      render: (name: string) => name || "N/A",
    },
    {
      title: "Created By",
      dataIndex: "created_by",
      key: "created_by",
      render: (createdBy: string) => createdBy || "N/A",
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
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: "right" as const,
      render: (_: any, record: SurveyData) => (
        <Space>
          <Tooltip title="View Survey">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleView(record.id)}
            />
          </Tooltip>
          <Tooltip title="Download PDF">
            <Button
              icon={<FilePdfOutlined />}
              size="small"
              type="primary"
              loading={singlePdfLoading[record.id] || false}
              onClick={() => handleSinglePDFDownload(record)}
              className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700 text-white"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageMeta
        title="Report 115"
        description="Report 115 of Property Surveys"
      />
      <PageBreadcrumb pageTitle="Report 115" />

      <ComponentCard title="Report 115 Surveys">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end">
          <Search
            placeholder="Search by property, ward or owner..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
            className="w-full"
          />
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={showPdfBulkModal}
            className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 text-white"
          >
            Combined PDF Download
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={surveys}
          loading={loading}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize,
            total: totalSurveys,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} surveys`,
            onChange: handlePaginationChange,
          }}
          scroll={{ x: 1000 }}
          className="custom-orders-table"
        />
      </ComponentCard>

      <Modal
        title={
          <div className="flex items-center">
            <FileTextOutlined className="mr-2 text-blue-600" />
            Download Combined PDF
          </div>
        }
        open={pdfBulkModalVisible}
        onCancel={handlePdfBulkCancel}
        footer={null}
        width={500}
      >
        <Divider />
        <Form
          form={pdfBulkForm}
          layout="vertical"
          onFinish={handlePdfBulkSubmit}
          initialValues={{
            include_range: false,
          }}
        >
          <Form.Item
            name="ward_no"
            label="Ward Number"
            rules={[{ required: true, message: "Enter ward number!" }]}
          >
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>

          <Form.Item name="include_range" valuePropName="checked">
            <Checkbox onChange={(e) => setIncludeRange(e.target.checked)}>
              Include Property Range
            </Checkbox>
          </Form.Item>

          {includeRange && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="property_no_start"
                  label="Property No. From"
                  rules={[{ required: true, message: "Enter start no" }]}
                >
                  <InputNumber style={{ width: "100%" }} min={1} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="property_no_end"
                  label="Property No. To"
                  rules={[{ required: true, message: "Enter end no" }]}
                >
                  <InputNumber style={{ width: "100%" }} min={1} />
                </Form.Item>
              </Col>
            </Row>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button onClick={handlePdfBulkCancel}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={pdfBulkLoading}
              icon={<FileTextOutlined />}
              className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 text-white"
            >
              {pdfBulkLoading ? "Downloading..." : "Download Combined PDF"}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default SurveyReports;
