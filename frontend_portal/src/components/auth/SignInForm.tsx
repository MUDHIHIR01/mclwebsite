import { useState, ChangeEvent, FormEvent, SVGProps } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../axios";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

// --- ICON COMPONENTS (Added directly into this file) ---

// The "ey icon" for showing the password
const EyeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

// The "tail icon" (closed eye) for hiding the password
const EyeCloseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243"
    />
  </svg>
);


// --- BRAND LOGO COMPONENT (Unchanged) ---
const BrandLogo = () => (
  <svg className="w-16 h-16 text-white mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
  </svg>
);


// --- MAIN SIGN-IN FORM COMPONENT ---
export default function SignInForm() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { email, password } = formData;

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
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
          case 401: toast.error("Invalid email or password"); break;
          case 403: toast.error("Account is disabled or access denied"); break;
          case 500: toast.error("Server error, please try again later"); break;
          default: toast.error(message);
        }
      } else if (error.request) {
        toast.error("Failed to connect to server after retries");
      } else {
        console.error("Unexpected error:", error.message);
        toast.error("Something went wrong. Please try again later");
      }
    }
  };

  const handleCheckboxChange = (checked: boolean) => setIsChecked(checked);
  const handleLogoClick = () => navigate("/");

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <section className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0A51A1]">
      <div className="w-full max-w-sm lg:max-w-none lg:w-[700px] lg:min-h-[620px] bg-white rounded-2xl shadow-2xl flex flex-col lg:flex-row transition-all duration-300">
        <div className="hidden lg:flex lg:w-2/5 flex-col justify-center items-center text-center p-8 text-white bg-[#0A51A1] rounded-l-2xl">
          <button onClick={handleLogoClick} className="focus:outline-none">
            <BrandLogo />
            <h2 className="text-2xl font-bold tracking-wide">Mwananchi</h2>
            <p className="text-white/80 text-sm mt-2">Communication Limited</p>
          </button>
          <p className="mt-12 text-white/90">Your trusted source for news and information, now just a login away.</p>
        </div>

        <div className="w-full lg:w-3/5 p-8 sm:p-12 flex flex-col justify-center">
          <div className="text-center lg:text-left mb-8">
            <h1 className="text-3xl font-bold text-[#0A51A1]">Sign In</h1>
            <p className="text-gray-500 mt-2">Enter your credentials to access your account.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="font-medium text-gray-700">Email Address <span className="text-red-500">*</span></Label>
              <Input name="email" placeholder="you@example.com" value={email} onChange={handleFormChange} disabled={isLoading} className="w-full mt-2 bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A51A1] focus:border-[#0A51A1] py-2.5 px-4 transition duration-200" />
            </div>

            {/* --- PASSWORD FIELD: Fixed and fully functional --- */}
            <div>
              <Label className="font-medium text-gray-700">Password <span className="text-red-500">*</span></Label>
              <div className="relative mt-2">
                <Input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••••••" 
                  value={password} 
                  onChange={handleFormChange} 
                  disabled={isLoading} 
                  className="w-full bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A51A1] focus:border-[#0A51A1] py-2.5 px-4 pr-12 transition duration-200" 
                  aria-label="Password input"
                />
                <button 
                  type="button" 
                  onClick={togglePasswordVisibility} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition" 
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {/* The correct icon is shown based on the 'showPassword' state */}
                  {showPassword ? <EyeIcon className="h-6 w-6" /> : <EyeCloseIcon className="h-6 w-6" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox checked={isChecked} onChange={handleCheckboxChange} disabled={isLoading} />
                <span className="text-sm text-gray-600">Keep me logged in</span>
              </div>
              <Link to="/request-for/reset-password" className="text-sm text-[#0A51A1] hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button className="w-full bg-[#0A51A1] text-white hover:opacity-90 rounded-lg py-3 text-base font-bold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center" aria-live="polite">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  Processing...
                </div>
              ) : ( "Sign In" )}
            </Button>

            <p className="text-center text-sm text-gray-600 pt-4">
              Don’t have an account?{" "}
              <Link to="/signup" className="font-semibold text-[#0A51A1] hover:underline">
                Sign Up Now
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}