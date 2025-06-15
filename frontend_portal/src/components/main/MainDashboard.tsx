import { useState, useEffect } from "react";
import axiosInstance from "../../axios";
import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";

export default function Dashboard() {
  const [roleId, setRoleId] = useState<number | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axiosInstance.get("/api/user/profile");
          setRoleId(Number(response.data.role_id));
        }
      } catch (err) {
        console.error("Error fetching role:", err);
      }
    };
    fetchRole();
  }, []);

  if (roleId === null) return <div>Loading...</div>;

  return roleId === 1 ? <AdminDashboard /> : <UserDashboard />;
}