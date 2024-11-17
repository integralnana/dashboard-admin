import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./components/Sidebar";
import DashboardContent from "./components/DashboardContent";
import UserList from "./components/UserList";
import PostList from "./components/PostList";
import ReportBox from "./components/ReportBox";
import VipList from "./components/VipBox";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-20 px-4 flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="ml-4 text-lg font-semibold text-gray-800">
            Admin Dashboard
          </h1>
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 z-40 h-full transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar onCloseSidebar={() => setIsSidebarOpen(false)} />
        </div>

        {/* Main Content */}
        <div className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<DashboardContent />} />
              <Route path="/user-list" element={<UserList />} />
              <Route path="/post-list" element={<PostList />} />
              <Route path="/report-box" element={<ReportBox />} />
              <Route path="/vip-list" element={<VipList />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;