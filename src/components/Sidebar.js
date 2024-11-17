import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  AlertCircle,
  Crown,
  ChevronRight,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/user-list", icon: Users, label: "รายการผู้ใช้งาน" },
    { path: "/post-list", icon: FileText, label: "รายการโพสต์" },
    { path: "/report-box", icon: AlertCircle, label: "กล่องรายงาน" },
    { path: "/vip-list", icon: Crown, label: "คำขอ VIP" },
  ];

  return (
    <div className="h-screen fixed top-0 left-0 overflow-y-auto bg-gradient-to-b from-orange-500 to-orange-600 w-64 text-white transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-8">Admin Dashboard</h2>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-lg transition-all duration-200 hover:bg-white/20 ${
                      isActive ? "bg-white/10 shadow-md" : ""
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="flex-grow text-sm font-medium">
                      {item.label}
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
