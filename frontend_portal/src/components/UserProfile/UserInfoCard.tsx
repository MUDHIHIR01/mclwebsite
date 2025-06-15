import { useState, useEffect, ChangeEvent } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import axiosInstance from "../../axios";

interface UserProfile {
  user_id: number;
  email: string;
  name: string;
  role_id: number;
  category: string | null;
  status: string;
  nida: string;
  address: string;
  sex: string;
  date_of_birth: string;
  contact: string;
  auto_number: string;
  item_category: string | null;
}

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [modalMessage, setModalMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get("/api/user/profile");
        setUser(response.data);
        setEmail(response.data.email);
      } catch (err) {
        setModalMessage({ type: "error", text: "Unable to load user profile. Please try again later." });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setModalMessage(null);

    if (!email) {
      setModalMessage({ type: "error", text: "Email address cannot be empty" });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setModalMessage({ type: "error", text: "Please enter a valid email address" });
      return;
    }
    if (!newPassword) {
      setModalMessage({ type: "error", text: "Please enter a new password" });
      return;
    }
    if (newPassword.length < 8) {
      setModalMessage({ type: "error", text: "Password must be at least 8 characters long" });
      return;
    }
    if (!newPasswordConfirmation) {
      setModalMessage({ type: "error", text: "Please confirm your new password" });
      return;
    }
    if (newPassword !== newPasswordConfirmation) {
      setModalMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    const payload = {
      email,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    };

    try {
      await axiosInstance.post("/api/update-profile", payload);
      setModalMessage({ type: "success", text: "Profile updated successfully!" });
      setUser((prev) => prev ? { ...prev, email } : null);
      setTimeout(() => {
        closeModal();
        setNewPassword("");
        setNewPasswordConfirmation("");
        setModalMessage(null);
      }, 1500);
    } catch (err) {
      const error = err as import("axios").AxiosError<{ errors?: Record<string, string[]>; message?: string }>;
      if (error.response?.status === 422) {
        const errors = error.response.data?.errors;
        if (errors) {
          const firstError = Object.values(errors).flat()[0];
          setModalMessage({ type: "error", text: firstError });
        } else {
          setModalMessage({ type: "error", text: "Invalid input provided" });
        }
      } else if (error.response?.status === 403) {
        setModalMessage({ type: "error", text: "Email does not match your account" });
      } else if (error.response?.status === 401) {
        setModalMessage({ type: "error", text: "Please log in to update your profile" });
      } else {
        setModalMessage({ type: "error", text: "Failed to update profile. Please try again." });
      }
    }
  };

  if (loading) {
    return <div className="p-5">Loading profile...</div>;
  }

  return (
    <div className="border border-gray-200 dark:border-gray-800 lg:p-6 w-full bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col gap-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Personal Information
        </h4>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Name</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user?.name || "N/A"}</p>
          </div>
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Email address</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user?.email || "N/A"}</p>
          </div>
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Role Category</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user?.category || "N/A"}</p>
          </div>
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Item Category</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user?.item_category || "N/A"}</p>
          </div>
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Status</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user?.status || "N/A"}</p>
          </div>
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">NIDA</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user?.nida || "N/A"}</p>
          </div>
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Address</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user?.address || "N/A"}</p>
          </div>
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Sex</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user?.sex || "N/A"}</p>
          </div>
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Date of Birth</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user?.date_of_birth || "N/A"}</p>
          </div>
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Contact</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user?.contact || "N/A"}</p>
          </div>
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Auto Number</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user?.auto_number || "N/A"}</p>
          </div>
        </div>
        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:w-auto lg:self-end"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            {modalMessage && (
              <div
                className={`mb-4 p-3 rounded-lg ${
                  modalMessage.type === "success"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                }`}
              >
                {modalMessage.text}
              </div>
            )}
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Update Profile
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your email or password to keep your account secure.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                <div className="col-span-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={newPasswordConfirmation}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setNewPasswordConfirmation(e.target.value)
                    }
                    required
                    minLength={8}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}