import React from 'react';
import './DashboardContent.css';

function DashboardContent() {
  return (
    <div className="dashboard-content">
      <div className="card blue">
        <p>จำนวน user</p>
        <h3>100</h3>
      </div>
      <div className="card red">
        <p>จำนวน post</p>
        <h3>500</h3>
      </div>
      <div className="card green">
        <p>จำนวนกล่องที่รายงาน</p>
        <h3>20</h3>
      </div>
      <div className="card yellow">
        <p>จำนวนผู้ใช้ที่สมัคร VIP</p>
        <h3>10</h3>
      </div>
    </div>
  );
}

export default DashboardContent;
