import MainDashboard from "../../components/main/MainDashboard";
import MonthlySalesChart from "../../components/main/MonthlySalesChart";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  return (
    <>
      <PageMeta
        title="FT"
        description="FT"
      />

      <div className="space-y-6 p-6">
        {/* Metrics Section - Full Width, One Per Row */}
        <div className="grid grid-cols-1 gap-4">
          <MainDashboard />
        </div>

      </div>
    </>
  );
}
