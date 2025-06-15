import { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import axiosInstance from "../../axios";
import { toast } from "react-toastify";

export default function SignUpForm() {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
  }>({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/api/auth/add-user', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role_id: 2,
        status: "active", // Sent as "active", but backend forces "is_active"
      });

      setIsLoading(false);
      toast.success("Sign-up successful! Check your email for confirmation.", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/sign-in");
    } catch (err) {
      setIsLoading(false);
      const error = err as import("axios").AxiosError<{ message?: string }>;

      if (error.response) {
        toast.error(error.response.data?.message || "Sign-up failed", {
          position: "top-right",
          autoClose: 3000,
        });
      } else if (error.request) {
        toast.error("No response from server", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("An unexpected error occurred", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  const handleLogoClick = () => navigate("/");

  return (
    <div className="flex shadow-md flex-col flex-1 items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div style={{ display: "flex", justifyContent: "center" }}>
          <h3 className="font-bold text-[color:white]">MCL</h3>
        </div>
      </div>

      <div
        className="w-full max-w-md p-8 py-4 bg-white rounded-lg dark:bg-gray-800"
        style={{
          boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px",
        }}
      >
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Sign Up
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create your account to get started!
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <Label>
                Name <span className="text-error-500">*</span>
              </Label>
              <Input
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                name="name"
              />
            </div>

            <div>
              <Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                placeholder="info@gmail.com"
                value={formData.email}
                onChange={handleChange}
                name="email"
              />
            </div>

            <div>
              <Label>
                Password <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  name="password"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </span>
              </div>
            </div>

            <div>
              <Button
                className="w-full relative bg-[color:#1f618d]"
                size="sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Loading...
                  </div>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </div>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
              Already have an account?{" "}
              <Link to="/" className="text-blue-600 hover:text-blue-700">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}