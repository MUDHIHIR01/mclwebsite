import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// --- REFINEMENT: Import the logo as a module ---
// Place your logo.png inside your `src/assets` folder.
// Adjust the path '../../assets/logo.png' if your file structure is different.
import mclLogo from '../../assets/logo.png';

// --- Interfaces ---
interface NavItem {
  label: string;
  path: string;
  dropdown?: Array<{ label: string; path: string }>;
}

interface DropdownMenuProps {
  isOpen: boolean;
  items: Array<{ label: string; path: string }>;
  onClose: () => void;
}

interface MobileMenuProps {
  isOpen: boolean;
  navItems: NavItem[];
  onClose: () => void;
}

// --- Constant Data ---
const companyMenuItems: NavItem[] = [
  { label: "NMG-Group", path: "/company/mcl-group" },
  { label: "Leadership", path: "/company/leadership" },
  { label: "Diversity and Inclusion", path: "/company/diversity-and-inclusion" },
  { label: "Sustainability", path: "/company/sustainability" },
  { label: "Giving Back", path: "/company/giving-back" },
  { label: "MCL Pink 130", path: "/company/pink-130" },
  { label: "Our Standards", path: "/company/our-standards" },
];

const careersMenuItems: NavItem[] = [
  { label: "Vacancies", path: "https://careers.mcl.co.tz" },
  { label: "What We Do", path: "/careers/what-we-do" },
  { label: "Life At MCL Blog", path: "/careers/mcl-blog" },
  { label: "Benefits", path: "/careers/benefits" },
  { label: "Values", path: "/careers/values" },
  { label: "Early Careers", path: "/careers/early-careers" },
  { label: "Join Our Talent Community", path: "/careers/stay-connected" },
];

const navItems: NavItem[] = [
  { label: "About Us", path: "/" },
  { label: "Company", path: "/company/home", dropdown: companyMenuItems },
  { label: "Services", path: "/company/services" },
  { label: "Careers", path: "/careers/what-we-do", dropdown: careersMenuItems },
  { label: "News", path: "/company/news" },
  { label: "Contact", path: "/company/contact-us" },
];

const navLinkClass = "relative no-underline font-semibold text-base uppercase text-white transition-opacity duration-200 tracking-tight hover:underline hover:underline-offset-8 hover:opacity-100";


// --- Sub-Components ---
const DropdownMenu: React.FC<DropdownMenuProps> = ({ isOpen, items, onClose }) => (
  <motion.div
    className={`absolute left-0 mt-2 w-56 bg-[#0A51A1] rounded-lg z-50 ${isOpen ? "block" : "hidden"}`}
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -10 }}
    transition={{ duration: 0.3 }}
  >
    <div className="py-2 max-h-96 overflow-y-auto">
      {items.map((item) => {
        const isExternal = item.path.startsWith("http");
        const itemClasses = "block relative no-underline px-4 py-2 text-xs font-semibold uppercase text-white hover:opacity-100 opacity-90 hover:underline transition-all duration-200 text-left rounded-md mx-2";

        return isExternal ? (
          <a key={item.label} href={item.path} className={itemClasses} target="_blank" rel="noopener noreferrer" onClick={onClose}>
            {item.label}
          </a>
        ) : (
          <Link key={item.label} to={item.path} className={itemClasses} onClick={onClose}>
            {item.label}
          </Link>
        );
      })}
    </div>
  </motion.div>
);

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, navItems, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.nav
        className="absolute top-full left-0 w-full bg-[#0A51A1] lg:hidden p-6 max-h-[calc(100vh-5.5rem)] overflow-y-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {navItems.map((item) => (
          <div key={item.label} className="relative py-3 text-center">
            <NavLink
              to={item.path}
              className={({ isActive }) => `${navLinkClass} block ${isActive ? "opacity-100" : "opacity-80"}`}
              onClick={onClose}
            >
              {item.label}
            </NavLink>
            {item.dropdown && (
              <div className="mt-4 space-y-3 bg-white/5 rounded-lg p-3">
                {item.dropdown.map((subItem) => {
                  const isExternal = subItem.path.startsWith("http");
                  const subItemClasses = "block relative no-underline text-sm font-semibold uppercase text-white/80 hover:text-white hover:underline";
                  
                  return isExternal ? (
                    <a key={subItem.label} href={subItem.path} className={subItemClasses} target="_blank" rel="noopener noreferrer" onClick={onClose}>
                      {subItem.label}
                    </a>
                  ) : (
                    <Link key={subItem.label} to={subItem.path} className={subItemClasses} onClick={onClose}>
                      {subItem.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </motion.nav>
    )}
  </AnimatePresence>
);


// --- Main Header Component ---
const Header: React.FC = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <motion.header
      className="sticky top-0 z-50 w-full bg-[#0A51A1]"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-16 lg:px-15 py-4">
        <div className=" flex items-center justify-start gap-x-12">
          {/* Logo container */}
          <Link to="/" className="flex-shrink-0 lg:px-9">
            {/* --- REFINEMENT: Use the imported logo variable --- */}
            <img src={mclLogo} alt="MCL Logo" className="h-16 md:h-20 w-auto object-contain" />
          </Link>

          {/* Navigation links container */}
          <nav className="items-center hidden gap-12 lg:flex">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.dropdown && setOpenDropdown(item.label)}
                onMouseLeave={() => item.dropdown && setOpenDropdown(null)}
              >
                <div>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `${navLinkClass} text-center ${isActive ? "opacity-100" : "opacity-80"}`}
                  >
                    {item.label}
                  </NavLink>
                </div>
                {item.dropdown && (
                  <DropdownMenu
                    isOpen={openDropdown === item.label}
                    items={item.dropdown}
                    onClose={() => setOpenDropdown(null)}
                  />
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Mobile menu button */}
        <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2">
          <button
            className="lg:hidden text-white z-50"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      <MobileMenu
        isOpen={isMobileMenuOpen}
        navItems={navItems}
        onClose={() => setMobileMenuOpen(false)}
      />
    </motion.header>
  );
};

export default Header;