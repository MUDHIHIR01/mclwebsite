import { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import axiosInstance from "../../axios";
import { toast } from "react-toastify";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();

  const validateForm = () => {
    if (!email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      toast.error("Please enter a valid email address", { position: "top-right", autoClose: 3000 });
      return false;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long", { position: "top-right", autoClose: 3000 });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const attemptLogin = async (retries = 2): Promise<void> => {
      try {
        const response = await axiosInstance.post('/api/auth/login', { email, password });
        const successMessage = response.data.message || "Login successful!";
        toast.success(successMessage, { position: "top-right", autoClose: 3000 });
        localStorage.setItem("token", response.data.token as string);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("role_id", response.data.role_id as string);
        setIsLoading(false);
        navigate("/dashboard");
      } catch (err) {
        const error = err as import("axios").AxiosError<{ message?: string }>;
        if (error.request && retries > 0) {
          toast.warn("Network issue detected, retrying...", { position: "top-right", autoClose: 1000 });
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return attemptLogin(retries - 1);
        }
        throw err;
      }
    };

    try {
      await attemptLogin();
    } catch (err) {
      setIsLoading(false);
      const error = err as import("axios").AxiosError<{ message?: string }>;
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || "An error occurred";
        switch (status) {
          case 401:
            toast.error("Invalid email or password", { position: "top-right", autoClose: 3000 });
            break;
          case 403:
            toast.error("Account is disabled or access denied", { position: "top-right", autoClose: 3000 });
            break;
          case 500:
            toast.error("Server error, please try again later", { position: "top-right", autoClose: 3000 });
            break;
          default:
            toast.error(message, { position: "top-right", autoClose: 3000 });
        }
      } else if (error.request) {
        toast.error("Failed to connect to server after retries", { position: "top-right", autoClose: 3000 });
      } else {
        console.error("Unexpected error:", error.message);
        toast.error("Something went wrong. Please try again later", { position: "top-right", autoClose: 3000 });
      }
    }
  };

  const handleCheckboxChange = (checked: boolean) => setIsChecked(checked);

  const handleLogoClick = () => navigate("/");

  return (
    <section className="flex items-center w-full justify-center h-90 px-4 py-8 min-w-[320px] sm:min-w-[900px] overflow-x-auto bg-[color:#f4f6f6] dark:bg-gray-900">
      <div className="w-full max-w-lg mx-auto">
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <button onClick={handleLogoClick} className="focus:outline-none">
            <h3 className="font-bold text-[color:#2471a3]">MCL</h3>
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[color:#1f618d] dark:text-white mb-2">
              Sign In
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <Label>
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="info@gmail.com"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 py-2.5 sm:py-3 text-sm sm:text-base"
              />
            </div>

            {/* Password Field */}
            <div>
              <Label>
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 py-2.5 sm:py-3 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeIcon className="h-5 sm:h-6 w-5 sm:w-6 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <EyeCloseIcon className="h-5 sm:h-6 w-5 sm:w-6 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Checkbox and Forgot Password */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Checkbox checked={isChecked} onChange={handleCheckboxChange} disabled={isLoading} />
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-400">
                  Keep me logged in
                </span>
              </div>
              <Link
                to="/request-for/reset-password"
                className="text-sm sm:text-base text-[color:#1f618d] hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[color:#1f618d] hover:bg-blue-700 text-white rounded-lg py-2.5 sm:py-3 text-sm sm:text-base font-semibold transition-colors duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center" aria-live="polite">
                  <svg
                    className="animate-spin h-5 sm:h-6 w-5 sm:w-6 mr-2 sm:mr-3 text-white"
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
                "Sign In"
              )}
            </Button>

            {/* Sign Up Link */}
            <p className="text-center text-sm sm:text-base text-[color:#1f618d] dark:text-gray-400 mt-4 sm:mt-6">
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500"
              >
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}