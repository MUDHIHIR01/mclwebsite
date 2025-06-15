import { NavItem } from "./types"; // Assuming NavItem type is defined elsewhere

// Define navigation items as specified
const navItems: NavItem[] = [
  {
    name: "Company",
    icon: (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-pink-600 text-white">
        🏢
      </span>
    ),
    subItems: [
      { name: "Home Page", path: "/company" },
      { name: "FT Group", path: "/company/ft-group" },
      { name: "Leadership", path: "/company/leadership" },
      { name: "Diversity and Inclusion", path: "/company/diversity-inclusion" },
      { name: "Sustainability", path: "/company/sustainability" },
      { name: "Giving Back", path: "/company/giving-back" },
      { name: "FT Pink 130", path: "/company/ft-pink-130" },
      { name: "Our Standards", path: "/company/standards" },
    ],
  },
  {
    name: "Services",
    icon: (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white">
        ⚙️
      </span>
    ),
    subItems: [{ name: "Manage Services", path: "/services" }],
  },
  {
    name: "Careers",
    icon: (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-600 text-white">
        💼
      </span>
    ),
    subItems: [
      { name: "Vacancies", path: "/careers/vacancies" },
      { name: "What We Do", path: "/careers/what-we-do" },
      { name: "Life at FT Blog", path: "/careers/blog" },
      { name: "Benefits", path: "/careers/benefits" },
      { name: "Values", path: "/careers/values" },
      { name: "Early Careers", path: "/careers/early-careers" },
      { name: "Join Our Talent Community", path: "/careers/talent-community" },
    ],
  },
  {
    name: "News",
    icon: (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white">
        📰
      </span>
    ),
    subItems: [{ name: "Manage News", path: "/news" }],
  },
  {
    name: "Contact",
    icon: (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white">
        📞
      </span>
    ),
    subItems: [{ name: "Manage Contact", path: "/contact" }],
  },
];

// Component to render individual dashboard card
function DashboardCard({ item }: { item: NavItem }) {
  const subItemCount = item.subItems ? item.subItems.length : 0;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md flex items-center space-x-4 hover:bg-gray-50 transition">
      <div className="flex-shrink-0">{item.icon}</div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
        <p className="text-sm text-gray-600">
          {subItemCount} {subItemCount === 1 ? "Sub-Item" : "Sub-Items"}
        </p>
      </div>
    </div>
  );
}

// Main AdminDashboard component
export default function AdminDashboard() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6 bg-gray-100">
      {navItems.map((item, index) => (
        <DashboardCard key={index} item={item} />
      ))}
    </div>
  );
}