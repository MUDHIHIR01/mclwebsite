import { useState, ChangeEvent } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import axiosInstance from "../../axios";
import { toast } from "react-toastify";
import { Link } from "react-router"; // Make sure to import this

export default function ResetPasswordRequestForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axiosInstance.post('/api/auth/request-reset', {
        email,
      });

      setIsLoading(false);
      toast.success("Reset link sent to your email!", {
        position: "top-right",
        autoClose: 3000,
      });
      
      setEmail("");

    } catch (err) {
      setIsLoading(false);
      
      const error = err as import("axios").AxiosError<{ message?: string }>;
      
      if (error.response) {
        toast.error(error.response.data?.message || "Reset request failed", {
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

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div style={{ display: "flex", justifyContent: "center" }}>
          <h3 className="font-bold text-[color:white]">MCL</h3>
        </div>
      </div>

      <div className="w-full max-w-md p-8 py-4 bg-white rounded-lg dark:bg-gray-800">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Reset Password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your email to receive a password reset link
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                placeholder="info@gmail.com"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-4">
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
                    Sending...
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
              
              <div className="text-center">
                <Link 
                  to="/sign-in" 
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  Back Home
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}