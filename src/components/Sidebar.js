// Sidebar.js
import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Admin Dashboard</h2>
      <ul>
        <li>
          <Link to="/">Dashboard</Link>
        </li>
        <li>
          <Link to="/user-list">รายการผู้ใช้งาน</Link>
        </li>
        <li>
          <Link to="/post-list">รายการโพสต์</Link>
        </li>
        <li>
          <Link to="/report-box">กล่องรายงาน</Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
