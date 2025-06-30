import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axiosInstance from "../axios";
import { ChevronDownIcon } from "../icons";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline"; // Correct icon
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";

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

const getNavItemsForRole = (roleId: number) => {
  console.log('getNavItemsForRole called with roleId:', roleId);
  const baseNavItems: NavItem[] = [
    {
      icon: (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white">
          📊 {/* Chart icon for dashboard */}
        </span>
      ),
      name: "Dashboard",
      subItems: [{ name: "Go to dashboard", path: "/dashboard" }],
    },
    {
      icon: (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white">
          👤 {/* User icon for profile */}
        </span>
      ),
      name: "User Profile",
      path: "/profile",
    },
  ];

  const role1NavItems: NavItem[] = [
    ...baseNavItems,
    {
      name: "User Roles",
      icon: (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white">
          🛡️ {/* Shield icon for roles/authority */}
        </span>
      ),
      subItems: [{ name: "Roles", path: "/user-roles" }],
    },
    {
      name: "Users",
      icon: (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-600 text-white">
          👥 {/* Group icon for users/community */}
        </span>
      ),
      subItems: [{ name: "Users", path: "/users" }],
    },
    {
      name: "User Logs",
      icon: (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white">
          📜 {/* Scroll icon for logs/history */}
        </span>
      ),
      subItems: [{ name: "View Logs", path: "/user-logs" }],
    },
     {
      name: "Brands",
      icon: (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-600 text-white">
          ℹ️ {/* Info icon for about us */}
        </span>
      ),
      subItems: [{ name: "Our Brand", path: "/brands" }],
    },
    {
      name: "About Us",
      icon: (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-600 text-white">
          ℹ️ {/* Info icon for about us */}
        </span>
      ),
      subItems: [{ name: "Home Page", path: "/about" }],
    },
    {
      name: "Company",
      icon: (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-pink-600 text-white">
          🏢
        </span>
      ),
      subItems: [
        { name: "Home Page", path: "/company" },
        {
          name: "MCL Group",
          path: "/company/mcl-group",
          subItems: [
            { name: "Home page", path: "/mcl-group/home" },
            { name: "MCL-Group", path: "/mcl-group" }
          ],
        },
        { name: "Leadership", 
          path: "/company/leadership",
           subItems: [
            { name: "Home page", path: "/leadership/home" },
            { name: "Leadership", path: "/leadership" }
          ],
         },
         

          { name: "Our Standards", path: "/company/standards",
              subItems: [
              { name: "Home  page", path: "/our-standards/home" },
            { name: "Our Standards", path: "/our_standards" }
          ],
        },

          { name: "Giving Back", path: "/sustainability/home",
              subItems: [
            { name: "Home page", path: "/giving-back" },
            { name: "Giving Back", path: "/giving/back" }
          ],
        },
        { name: "MCL Pink 130", path: "/company/mcl-pink-10",
              subItems: [
             { name: "Home page", path: "/mcl-pink-130-home" },
            { name: "MCL Pink 130", path: "/pink-130" }
          ],
        },
        { name: "Sustainability", 
          path: "/company/sustainability",
               subItems: [
            { name: "Home  page", path: "/sustainability/home" },
            { name: "Sustainability", path: "/sustainability" }
          ],
         },

        { name: "Diversity and Inclusion",
           path: "/company/diversity-inclusion" ,
             subItems: [
            { name: "Home page", path: "/diversity-and-inclusion" },
            { name: "Diversity and Inclusion", path: "/diversityInclusion" }
          ],
          },
         
        
      ],
    },
    {
      name: "Services",
      icon: (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white">
          ⚙️ {/* Gear icon for services */}
        </span>
      ),
      subItems: [{ name: "Home page", path: "/services/home" },
        { name: "Services", path: "/services" }
      ],
    },
    {
      name: "Careers",
      icon: (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-600 text-white">
          💼 {/* Briefcase icon for careers */}
        </span>
      ),
      subItems: [
         { name: "Life at Mcl Blog", path: "",
           subItems: [{ name: "Home page", path: "/blog/home" },
         { name: "Blogs", path: "/blogs" },
         { name: "Sub-Blogs", path: "/sub-blogs" }
      ],
         },
        { name: "What We Do", path: "",
          subItems: [{ name: "Home page", path: "/what-we-do" },
        { name: "Categories", path: "/we-do" },
         { name: "Sub-Categories", path: "/subcategories/we-do" }
      ],
         },
          { name: "Early Careers", path: "/careers/early-careers" ,
            subItems: [
          { name: "Home page", path: "/earycare/home" },
         { name: "Eary careers", path: "/early-careers" },
         ],
        },
         { name: "Values", path: "/careers/values",
            subItems: [{ name: "Home page", path: "/value/home" },
         { name: "Values", path: "/values" },
         ],
         },
         // **** FIX 1: ADDED COMMA HERE ****
        { name: "Benefits", path: "/benefits/home",
            subItems: [
              // **** FIX 2: Corrected typo from "benefities" to "benefits" ****
              { name: "Home page", path: "/benefits/home" },
              { name: "Benefits", path: "/benefits" },
            ],
         },
       
            { name: "Join Our Talent Community", path: "/",
           subItems: [
              { name: "Home page", path: "/stay-connected/home" },
              { name: "Stay connected", path: "/stay-connected" },
            ],
         },
      ],
    },
    {
      name: "News",
      icon: (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white">
          📰 {/* Newspaper icon for news */}
        </span>
      ),
      subItems: [{ name: "Home  page", path: "/news/home" },
               { name: "News", path: "/news" },
                { name: "Sub-News", path: "/sub-news" }
      ],
    },

     {
      name: "Events",
      icon: (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white">
          📰 {/* Newspaper icon for news */}
        </span>
      ),
      subItems: [{ name: "Manage", path: "/our-events" },
      ],
    },

    
    {
      name: "Contact",
      icon: (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white">
          📞 {/* Phone icon for contact */}
        </span>
      ),
      subItems: [{ name: "Home page", path: "/contact/home" },
                 { name: "Contact-us", path: "/contact-us" },
                 { name: "Contact Info", path: "/contact-us/info" }
      ],
    },
  ];

  const role2NavItems: NavItem[] = [
    ...baseNavItems,
    {
      name: "Attempt Questions",
      icon: (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-pink-500 text-white">
          ❓ {/* Question mark icon for questions */}
        </span>
      ),
      subItems: [{ name: "Attempt Questions", path: "/attemp-questions" }],
    },
  
  ];

  const role3NavItems: NavItem[] = [
    ...baseNavItems,
    {
      name: "Attempt Question",
      icon: (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-pink-500 text-white">
          ❓ {/* Question mark icon for questions */}
        </span>
      ),
      subItems: [{ name: "Attempt Questions", path: "/user/attemp-questions" }],
    },
    {
      name: "KIP Results",
      icon: (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500 text-white">
          🏆 {/* Trophy icon for results */}
        </span>
      ),
      subItems: [{ name: "View KIP Results", path: "/user-marks" }],
    },
  ];

  switch (roleId) {
    case 1:
      console.log('Returning role1NavItems');
      return role1NavItems;
    case 2:
      console.log('Returning role2NavItems');
      return role2NavItems;
    case 3:
      console.log('Returning role3NavItems');
      return role3NavItems;
    default:
      console.log('Returning baseNavItems for roleId:', roleId);
      return baseNavItems;
  }
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const [navItems, setNavItems] = useState<NavItem[]>(getNavItemsForRole(0));
  const [openSubmenu, setOpenSubmenu] = useState<{ type: "main" | "others"; index: number; subIndex?: number } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token);

      if (!token) {
        console.log('No token found, setting default navigation');
        setNavItems(getNavItemsForRole(0));
        setErrorMessage('Please log in to access full navigation.');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching profile with axiosInstance');
        const response = await axiosInstance.get('/api/user/profile');
        console.log('Profile response:', response.data);
        const userData = response.data;

        if (!userData.role_id) {
          console.error('No role_id in response data:', userData);
          throw new Error('Invalid user data structure');
        }

        const roleIdNumber = Number(userData.role_id);
        console.log('Converted role_id to number:', roleIdNumber);

        setNavItems(getNavItemsForRole(roleIdNumber));
      } catch (err: any) {
        console.error('Fetch profile error:', err);
        const message = err.response?.status === 401
          ? 'Session expired. Please log in again.'
          : 'Unable to load user profile. Please try again later.';
        setErrorMessage(message);
        setNavItems(getNavItemsForRole(0));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    let submenuMatched = false;
    ["main"].forEach((menuType) => {
      navItems.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem, subIndex) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type: menuType as "main" | "others", index, subIndex });
              submenuMatched = true;
            }
            if (subItem.subItems) {
              subItem.subItems.forEach((nestedItem) => {
                if (isActive(nestedItem.path)) {
                  setOpenSubmenu({ type: menuType as "main" | "others", index, subIndex });
                  submenuMatched = true;
                }
              });
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, navItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}${openSubmenu.subIndex !== undefined ? `-${openSubmenu.subIndex}` : ''}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others", subIndex?: number) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index &&
        prevOpenSubmenu.subIndex === subIndex
      ) {
        return null;
      }
      return { type: menuType, index, subIndex };
    });
  };

  const renderSubItems = (subItems: SubItem[], menuType: "main" | "others", parentIndex: number, depth: number = 1) => (
    <ul className={`mt-2 space-y-1 ml-${depth * 9}`}>
      {subItems.map((subItem, subIndex) => (
        <li key={subItem.name}>
          {subItem.subItems ? (
            <>
              <button
                onClick={() => handleSubmenuToggle(parentIndex, menuType, subIndex)}
                className={`menu-dropdown-item ${
                  isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"
                } hover:shadow-md flex items-center w-full`}
              >
                {subItem.name}
                <span className="flex items-center gap-1 ml-auto">
                  {subItem.new && (
                    <span
                      className={`ml-auto ${
                        isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"
                      } menu-dropdown-badge`}
                    >
                      new
                    </span>
                  )}
                  {subItem.pro && (
                    <span
                      className={`ml-auto ${
                        isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"
                      } menu-dropdown-badge`}
                    >
                      pro
                    </span>
                  )}
                  <ChevronDownIcon
                    className={`ml-2 w-5 h-5 transition-transform duration-200 ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === parentIndex &&
                      openSubmenu?.subIndex === subIndex
                        ? "rotate-180 text-brand-500"
                        : ""
                    }`}
                  />
                </span>
              </button>
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${parentIndex}-${subIndex}`] = el;
                }}
                className="overflow-hidden transition-all duration-300 shadow-inner"
                style={{
                  height:
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === parentIndex &&
                    openSubmenu?.subIndex === subIndex
                      ? `${subMenuHeight[`${menuType}-${parentIndex}-${subIndex}`]}px`
                      : "0px",
                }}
              >
                {renderSubItems(subItem.subItems, menuType, parentIndex, depth + 1)}
              </div>
            </>
          ) : (
            <Link
              to={subItem.path}
              className={`menu-dropdown-item ${
                isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"
              } hover:shadow-md`}
            >
              {subItem.name}
              <span className="flex items-center gap-1 ml-auto">
                {subItem.new && (
                  <span
                    className={`ml-auto ${
                      isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"
                    } menu-dropdown-badge`}
                  >
                    new
                  </span>
                )}
                {subItem.pro && (
                  <span
                    className={`ml-auto ${
                      isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"
                    } menu-dropdown-badge`}
                  >
                    pro
                  </span>
                )}
              </span>
            </Link>
          )}
        </li>
      ))}
    </ul>
  );

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <>
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                } shadow-sm hover:shadow-md`}
              >
                <span
                  className={`menu-item-icon-size ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      openSubmenu?.type === menuType && openSubmenu?.index === index
                        ? "rotate-180 text-brand-500"
                        : ""
                    }`}
                  />
                )}
              </button>
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300 shadow-inner"
                style={{
                  height:
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : "0px",
                }}
              >
                {nav.subItems && renderSubItems(nav.subItems, menuType, index)}
              </div>
            </>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                } shadow-sm hover:shadow-md`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
        </li>
      ))}
    </ul>
  );

  if (loading) {
    return (
      <aside className="fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 shadow-lg w-[290px]">
        <div className="py-8 flex justify-start">
          <h1>MCL</h1>
        </div>
        <div>Loading sidebar...</div>
      </aside>
    );
  }

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 shadow-lg
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}
      >
        <Link to="/dashboard">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <h1 className="dark:hidden shadow-sm">MCL</h1>
              <h1 className="hidden dark:block shadow-sm">MCL</h1>
            </>
          ) : (
            <h1>MCL</h1>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        {errorMessage && (
          <div className="text-red-500 p-2 mb-4 text-sm">{errorMessage}</div>
        )}
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <EllipsisHorizontalIcon className="h-6 w-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
        {(isExpanded || isHovered || isMobileOpen) && (
          <div className="shadow-md">
            <SidebarWidget />
          </div>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;