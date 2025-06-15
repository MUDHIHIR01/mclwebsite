import { Link } from "react-router";
import { motion } from "framer-motion";

interface DropdownMenuProps {
  isOpen: boolean;
  items: { label: string; path: string }[];
  onClose: () => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ isOpen, items, onClose }) => {
  return (
    <motion.div
      className={`absolute left-0 mt-2 w-48 bg-[#2980b9] rounded-md shadow-lg z-50 ${
        isOpen ? "block" : "hidden"
      }`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="py-1">
        {items.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="block px-4 py-2 text-sm text-white hover:bg-[#1f618d]"
            onClick={onClose}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default DropdownMenu;