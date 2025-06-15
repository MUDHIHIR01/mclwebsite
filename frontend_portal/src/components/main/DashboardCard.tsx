import { NavItem } from "./types";

interface DashboardCardProps {
  item: NavItem;
}

export function DashboardCard({ item }: DashboardCardProps) {
  return (
    <div className="p-6 rounded-lg shadow-lg flex items-center justify-between bg-white">
      <div className="flex items-center space-x-4">
        <div className={`p-4 rounded-xl text-white ${item.bgColor}`}>
          <span className="text-2xl">{item.icon}</span>
        </div>
        <h3 className="text-lg font-semibold">{item.title}</h3>
      </div>
      <span className="text-xl font-bold text-gray-800">{item.count}</span>
    </div>
  );
}