import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axiosInstance from "../axios"; // Ensure this path is correct
import { ChevronDownIcon } from "../icons"; // Ensure this path is correct
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { useSidebar } from "../context/SidebarContext"; // Ensure this path is correct
import SidebarWidget from "./SidebarWidget"; // Ensure this path is correct

// Define SubItem type to support nested sub-items
interface SubItem {
  name: string;
  path: string;
  pro?: boolean;
  new?: boolean;
  subItems?: SubItem[];
}

// Define NavItem type
interface NavItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubItem[];
}

// --- CORRECTED & TYPED getNavItemsForRole FUNCTION ---
const getNavItemsForRole = (roleId: number): NavItem[] => {
  const baseNavItems: NavItem[] = [
    { icon: <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white">📊</span>, name: "Dashboard", subItems: [{ name: "Go to dashboard", path: "/dashboard" }] },
    { icon: <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white">👤</span>, name: "User Profile", path: "/profile" },
  ];

  const role1NavItems: NavItem[] = [
    ...baseNavItems,
    { name: "User Roles", icon: <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white">🛡️</span>, subItems: [{ name: "Roles", path: "/user-roles" }] },
    { name: "Users", icon: <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-600 text-white">👥</span>, subItems: [{ name: "Users", path: "/users" }] },
    { name: "User Logs", icon: <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white">📜</span>, subItems: [{ name: "View Logs", path: "/user-logs" }] },
    { name: "Brands", icon: <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-600 text-white">ℹ️</span>, subItems: [{ name: "Our Brand", path: "/brands" }] },
    { name: "About Us", icon: <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-600 text-white">ℹ️</span>, subItems: [{ name: "Home Sliders", path: "/about" },{ name: "Manage About", path: "/about-mwananchi" }] },
    //  { name: "About Mwananchi", icon: <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white">ℹ️</span>, subItems: [] },
    { name: "Company", icon: <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-pink-600 text-white">🏢</span>, subItems: [
        { name: "Home Page", path: "/company" },
        // { name: "NMG Group", path: "/company/mcl-group", subItems: [{ name: "Home page", path: "/mcl-group/home" },{ name: "MCL-Group", path: "/mcl-group" }] },
        { name: "Leadership", path: "/company/leadership", subItems: [{ name: "Home page", path: "/leadership/home" },{ name: "Leadership", path: "/leadership" }] },
        // { name: "Our Standards", path: "/company/standards", subItems: [{ name: "Home page", path: "/our-standards/home" },{ name: "Our Standards", path: "/our_standards" }] },
        // { name: "Giving Back", path: "/sustainability/home", subItems: [{ name: "Home page", path: "/giving-back" },{ name: "Giving Back", path: "/giving/back" }] },
        // { name: "MCL History", path: "/company/mcl-pink-10", subItems: [{ name: "Home page", path: "/mcl-pink-130-home" },{ name: "MCL History", path: "/pink-130" }] },
        { name: "Sustainability", path: "/company/sustainability", subItems: [{ name: "Home page", path: "/sustainability/home" },{ name: "Sustainability", path: "/sustainability" }] },
        // { name: "Diversity and Inclusion", path: "/company/diversity-inclusion", subItems: [{ name: "Home page", path: "/diversity-and-inclusion" },{ name: "Diversity and Inclusion", path: "/diversityInclusion" }] },
    ]},
    // { name: "Services", icon: <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white">⚙️</span>, subItems: [{ name: "Home page", path: "/services/home" },{ name: "Services", path: "/services" }] },
    { name: "Careers", icon: <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-600 text-white">💼</span>, subItems: [
        { name: "Life at Mcl Blog", path: "", subItems: [{ name: "Home page", path: "/blog/home" },{ name: "Blogs", path: "/blogs" },{ name: "Sub-Blogs", path: "/sub-blogs" }] },
        // { name: "What We Do", path: "", subItems: [{ name: "Home page", path: "/what-we-do" },{ name: "Categories", path: "/we-do" },{ name: "Sub-Categories", path: "/subcategories/we-do" }] },
        // { name: "Early Careers", path: "", subItems: [{ name: "Home page", path: "" },{ name: "Eary careers", path: "/early-careers" }] },
        { name: "Values", path: "/careers/values", subItems: [{ name: "Values", path: "/values" }] },
        // { name: "Benefits", path: "/benefits/home", subItems: [{ name: "Home page", path: "/benefits/home" },{ name: "Benefits", path: "/benefits" }] },
        // { name: "Join Our Talent Community", path: "/", subItems: [{ name: "Home page", path: "/stay-connected/home" },{ name: "Stay connected", path: "/stay-connected" }] },
    ]},
    { name: "News", icon: <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white">📰</span>, subItems: [{ name: "Home page", path: "/news/home" },{ name: "News", path: "/news" },{ name: "Sub-News", path: "/sub-news" }] },
    { name: "Events", icon: <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white">📅</span>, subItems: [{ name: "Events", path: "/our-events" },{ name: "Sub Events", path: "/sub-events" }] },
    { name: "Subscriptions", icon: <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white">📅</span>, subItems: [{ name: "Manage", path: "/subscriptions" }] },
    { name: "Contact", icon: <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white">📞</span>, subItems: [{ name: "Home page", path: "/contact/home" },{ name: "Contact-us", path: "/contact-us" },{ name: "Contact Info", path: "/contact-us/info" }] },
  ];

  const role2NavItems: NavItem[] = [...baseNavItems, { name: "Attempt Questions", icon: <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-pink-500 text-white">❓</span>, subItems: [{ name: "Attempt Questions", path: "/attemp-questions" }] }];
  const role3NavItems: NavItem[] = [...baseNavItems, { name: "Attempt Question", icon: <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-pink-500 text-white">❓</span>, subItems: [{ name: "Attempt Questions", path: "/user/attemp-questions" }] }, { name: "KIP Results", icon: <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500 text-white">🏆</span>, subItems: [{ name: "View KIP Results", path: "/user-marks" }] }];

  switch (roleId) {
    case 1: return role1NavItems;
    case 2: return role2NavItems;
    case 3: return role3NavItems;
    default: return baseNavItems;
  }
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // REFACTOR: State to track open/closed status for multiple menus by a unique key.
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path?: string) => (path ? location.pathname === path : false), [location.pathname]);

  // Effect to fetch user profile and set navigation items
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setNavItems(getNavItemsForRole(0));
        setErrorMessage('Please log in to see navigation options.');
        setLoading(false);
        return;
      }
      try {
        const response = await axiosInstance.get('/api/user/profile');
        const roleId = Number(response.data?.role_id);
        if (isNaN(roleId)) throw new Error('Invalid user role');
        setNavItems(getNavItemsForRole(roleId));
      } catch (err) {
        setErrorMessage('Could not load user profile.');
        setNavItems(getNavItemsForRole(0)); // Fallback to default nav
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // REFACTOR: Effect to automatically open parent menus of the active link on page load/navigation.
  useEffect(() => {
    const newOpenMenus: Record<string, boolean> = {};

    const findAndSetOpen = (items: (NavItem | SubItem)[], parentKey: string): boolean => {
      let isActiveInBranch = false;
      items.forEach((item, index) => {
        const currentKey = `${parentKey}-${index}`;
        let hasActiveChild = false;
        
        if (item.subItems && item.subItems.length > 0) {
          hasActiveChild = findAndSetOpen(item.subItems, currentKey);
        }

        if (isActive(item.path) || hasActiveChild) {
          newOpenMenus[currentKey] = true;
          isActiveInBranch = true;
        }
      });
      return isActiveInBranch;
    };

    if (navItems.length > 0) {
      findAndSetOpen(navItems, "main");
      setOpenMenus(newOpenMenus);
    }
  }, [location.pathname, navItems, isActive]);

  // REFACTOR: Effect to calculate height for any menu that is opened.
  useEffect(() => {
    const newHeights: Record<string, number> = {};
    for (const key in openMenus) {
      if (openMenus[key] && subMenuRefs.current[key]) {
        newHeights[key] = subMenuRefs.current[key]!.scrollHeight;
      }
    }
    setSubMenuHeight(prev => ({ ...prev, ...newHeights }));
  }, [openMenus]);

  // REFACTOR: A single handler to toggle any menu by its unique key.
  const handleSubmenuToggle = useCallback((key: string) => {
    setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // REFACTOR: Recursive function to render sub-items.
  const renderSubItems = (subItems: SubItem[], parentKey: string): React.ReactNode => (
    <ul className="pl-6 mt-1 space-y-1">
      {subItems.map((subItem, subIndex) => {
        const key = `${parentKey}-${subIndex}`;
        const isOpen = !!openMenus[key];

        return (
          <li key={key}>
            {subItem.subItems && subItem.subItems.length > 0 ? (
              <>
                <button
                  onClick={() => handleSubmenuToggle(key)}
                  className="menu-dropdown-item hover:shadow-md flex items-center w-full"
                >
                  {subItem.name}
                  <span className="flex items-center gap-1 ml-auto">
                    <ChevronDownIcon
                      className={`ml-2 w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </span>
                </button>
                <div
                  ref={(el) => { subMenuRefs.current[key] = el; }}
                  className="overflow-hidden transition-all duration-300"
                  style={{ height: isOpen ? `${subMenuHeight[key] || 0}px` : "0px" }}
                >
                  {renderSubItems(subItem.subItems, key)}
                </div>
              </>
            ) : (
              <Link
                to={subItem.path}
                className={`menu-dropdown-item ${isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"} hover:shadow-md`}
              >
                {subItem.name}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );

  // REFACTOR: Top-level menu renderer using the new system.
  const renderMenuItems = (items: NavItem[]): React.ReactNode => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => {
        const key = `main-${index}`;
        const isOpen = !!openMenus[key];
        const isLinkActive = nav.path ? isActive(nav.path) : false;

        return (
          <li key={key}>
            {nav.subItems && nav.subItems.length > 0 ? (
              <>
                <button
                  onClick={() => handleSubmenuToggle(key)}
                  className={`menu-item group ${isOpen ? "menu-item-active" : "menu-item-inactive"} ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
                >
                  <span className={`menu-item-icon-size ${isOpen ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>{nav.icon}</span>
                  {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
                  {(isExpanded || isHovered || isMobileOpen) && <ChevronDownIcon className={`ml-auto w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />}
                </button>
                <div
                  ref={(el) => { subMenuRefs.current[key] = el; }}
                  className="overflow-hidden transition-all duration-300"
                  style={{ height: isOpen ? `${subMenuHeight[key] || 0}px` : "0px" }}
                >
                  {renderSubItems(nav.subItems, key)}
                </div>
              </>
            ) : (
              nav.path && (
                <Link to={nav.path} className={`menu-item group ${isLinkActive ? "menu-item-active" : "menu-item-inactive"}`}>
                  <span className={`menu-item-icon-size ${isLinkActive ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>{nav.icon}</span>
                  {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
                </Link>
              )
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 shadow-lg
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link to="/dashboard">
          {isExpanded || isHovered || isMobileOpen ? (
            <h1 className="text-2xl font-bold dark:text-white">MCL</h1>
          ) : (
            <h1 className="text-2xl font-bold dark:text-white">M</h1>
          )}
        </Link>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading Menu...</div>
        ) : (
          <>
            {errorMessage && <div className="text-red-500 p-2 mb-4 text-sm rounded bg-red-100 dark:bg-red-900/50">{errorMessage}</div>}
            <nav className="flex-1">
              <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                {isExpanded || isHovered || isMobileOpen ? "Menu" : <EllipsisHorizontalIcon className="h-6 w-6" />}
              </h2>
              {renderMenuItems(navItems)}
            </nav>
            {(isExpanded || isHovered || isMobileOpen) && (
              <div className="mt-auto mb-4 shadow-md">
                <SidebarWidget />
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;