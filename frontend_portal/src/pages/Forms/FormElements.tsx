import { useState, FormEvent } from "react";
import { User } from "lucide-react";

// Define the props interface
interface TailFormProps {
  name?: string;
  role_id?: string;
  department_id?: string;
  status?: string;
  email?: string;
  password?: string;
  onSubmit?: (data: FormData) => Promise<void>;
  onCancel?: () => void;
}

// Define the form data interface
interface FormData {
  name: string;
  role_id: string;
  department_id: string;
  status: string;
  email: string;
  password: string;
}

const TailForm = ({
  name = "",
  role_id = "",
  department_id = "",
  status = "active",
  email = "",
  password = "",
  onSubmit,
  onCancel,
}: TailFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    name,
    role_id,
    department_id,
    status,
    email,
    password,
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.role_id) newErrors.role_id = "Role is required";
    if (!formData.department_id) newErrors.department_id = "Department is required";
    if (!formData.status) newErrors.status = "Status is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm() || !onSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        name: "",
        role_id: "",
        department_id: "",
        status: "active",
        email: "",
        password: "",
      });
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    setFormData({
      name: "",
      role_id: "",
      department_id: "",
      status: "active",
      email: "",
      password: "",
    });
    setErrors({});
  };

  return (
    <div className="w-full">
      <div className="border border-gray-200 dark:border-gray-800 w-full lg:p-6 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl md:text-3xl  text-gray-800 mb-6 text-center">
          User Registration
        </h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div className="relative w-full">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-3 border ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter user name"
                  disabled={isSubmitting}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="relative w-full">
              <label htmlFor="role_id" className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                id="role_id"
                name="role_id"
                value={formData.role_id}
                onChange={handleChange}
                className={`w-full px-3 py-3 border ${
                  errors.role_id ? "border-red-300" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                disabled={isSubmitting}
              >
                <option value="">Select a role</option>
                <option value="1">Admin</option>
                <option value="2">User</option>
                <option value="3">Manager</option>
              </select>
              {errors.role_id && <p className="text-red-500 text-xs mt-1">{errors.role_id}</p>}
            </div>

            <div className="relative w-full">
              <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                id="department_id"
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                className={`w-full pl-3 pr-3 py-3 border ${
                  errors.department_id ? "border-red-300" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter department"
                disabled={isSubmitting}
              />
              {errors.department_id && <p className="text-red-500 text-xs mt-1">{errors.department_id}</p>}
            </div>

            <div className="relative w-full">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-3 pr-3 py-3 border ${
                  errors.email ? "border-red-300" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter email"
                disabled={isSubmitting}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="relative w-full">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-3 pr-3 py-3 border ${
                  errors.password ? "border-red-300" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter password"
                disabled={isSubmitting}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-md"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-blue-500 text-white rounded-md ${
                isSubmitting ? "bg-blue-300" : ""
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TailForm;
