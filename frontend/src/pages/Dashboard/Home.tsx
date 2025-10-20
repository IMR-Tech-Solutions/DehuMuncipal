import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Dehu | Municipal Survey Dashboard"
        description="View and manage municipal survey data easily"
      />
      <div className="col-span-12">
        <EcommerceMetrics />
      </div>
      <div className="grid grid-cols-12 gap-4 md:gap-6 py-4">
        <div className="col-span-12 space-y-6 xl:col-span-6">
          <MonthlyTarget />
        </div>
        <div className="col-span-12 space-y-6 xl:col-span-6">
          <MonthlySalesChart />
        </div>
      </div>
    </>
  );
}
