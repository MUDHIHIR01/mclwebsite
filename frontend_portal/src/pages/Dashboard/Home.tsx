import MainDashboard from "../../components/main/MainDashboard";
// **FIX: Removed the unused import of MonthlySalesChart.**
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

        {/* If you intended to use the MonthlySalesChart, you would add it here like this: */}
        {/*
          <div className="grid grid-cols-1 gap-4">
            <MonthlySalesChart />
          </div>
        */}

      </div>
    </>
  );
}