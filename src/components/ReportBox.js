import React, { useState, useEffect } from "react";
import { db } from "../config/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import "./ReportBox.css";

const ReportBox = () => {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  const fetchUserDetails = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchReportsAndUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "reports"));
        const reportsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const userIds = new Set();
        reportsData.forEach((report) => {
          if (report.reporterId) userIds.add(report.reporterId);
          if (report.reportToId) userIds.add(report.reportToId);
        });

        const usersData = {};
        await Promise.all(
          Array.from(userIds).map(async (userId) => {
            const userData = await fetchUserDetails(userId);
            if (userData) {
              usersData[userId] = userData;
            }
          })
        );

        setReports(reportsData);
        setUsers(usersData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchReportsAndUsers();
  }, []);

  const handleOpenModal = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
    document.body.style.overflow = "unset";
  };

  const handleAction = async (reportId, reportToId, action) => {
    try {
      if (action === "ban") {
        const userRef = doc(db, "users", reportToId);
        await updateDoc(userRef, {
          status: 2,
        });
      }

      const reportRef = doc(db, "reports", reportId);
      await updateDoc(reportRef, {
        status: "solved",
      });

      setReports(
        reports.map((report) =>
          report.id === reportId ? { ...report, status: "solved" } : report
        )
      );

      handleCloseModal();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getReportTypeLabel = (type) => {
    const types = {
      spam: "สแปม",
      inappropriate: "เนื้อหาไม่เหมาะสม",
      harassment: "การคุกคาม",
      other: "อื่นๆ",
    };
    return types[type] || type;
  };

  const getUserDisplayName = (userId) => {
    if (!userId) return "ไม่ระบุผู้ใช้";
    const user = users[userId];
    return user
      ? user.displayName || user.username || userId
      : "ไม่พบข้อมูลผู้ใช้";
  };

  const filteredReports = reports.filter((report) => {
    if (activeTab === "pending") {
      return report.status === "pending";
    } else {
      return report.status === "solved" || report.status === "rejected";
    }
  });

  const ReportTable = ({ reports }) => (
    <table className="report-table">
      <thead>
        <tr>
          <th>ผู้รายงาน</th>
          <th>ผู้ถูกรายงาน</th>
          <th>ประเภท</th>
          <th>วันที่รายงาน</th>
          <th>สถานะ</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {reports.map((report, index) => (
          <tr
            key={report.id}
            className={index % 2 === 0 ? "row-even" : "row-odd"}
          >
            <td>{getUserDisplayName(report.reporterId)}</td>
            <td>{getUserDisplayName(report.reportToId)}</td>
            <td>{getReportTypeLabel(report.reportType)}</td>
            <td>
              {new Date(report.createdAt?.toDate()).toLocaleDateString("th-TH")}
            </td>
            <td>
              <span className={`status-badge ${report.status}`}>
                {report.status === "pending"
                  ? "รอดำเนินการ"
                  : report.status === "solved"
                  ? "ดำเนินการแล้ว"
                  : "ปฏิเสธ"}
              </span>
            </td>
            <td>
              {report.status === "pending" && (
                <button
                  className="manage-button"
                  onClick={() => handleOpenModal(report)}
                >
                  จัดการ
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (loading) {
    return <div className="loading-container">กำลังโหลด...</div>;
  }

  return (
    <div className="report-container">
      <h2 className="report-title">กล่องรายงาน</h2>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          รอดำเนินการ ({reports.filter((r) => r.status === "pending").length})
        </button>
        <button
          className={`tab ${activeTab === "solved" ? "active" : ""}`}
          onClick={() => setActiveTab("solved")}
        >
          ดำเนินการแล้ว ({reports.filter((r) => r.status !== "pending").length})
        </button>
      </div>

      <div className="table-container">
        {filteredReports.length > 0 ? (
          <ReportTable reports={filteredReports} />
        ) : (
          <div className="no-reports">ไม่มีรายการ</div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>รายละเอียดการรายงาน</h3>
              <button className="close-button" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>ผู้รายงาน</label>
                <p className="info-box">
                  {getUserDisplayName(selectedReport?.reporterId)}
                </p>
              </div>

              <div className="form-group">
                <label>ผู้ถูกรายงาน</label>
                <p className="info-box">
                  {getUserDisplayName(selectedReport?.reportToId)}
                </p>
              </div>

              <div className="form-group">
                <label>ประเภท</label>
                <p className="info-box">
                  {getReportTypeLabel(selectedReport?.reportType)}
                </p>
              </div>

              <div className="form-group">
                <label>ความคิดเห็น</label>
                <p className="comment-box">{selectedReport?.reportDesc}</p>
              </div>

              {selectedReport?.imageUrl && (
                <div className="form-group">
                  <label>รูปภาพ</label>
                  <img
                    src={selectedReport.imageUrl}
                    alt="Report evidence"
                    className="evidence-image"
                  />
                </div>
              )}

              <div className="button-group">
                <button
                  className="ban-button"
                  onClick={() =>
                    handleAction(
                      selectedReport.id,
                      selectedReport.reportToId,
                      "ban"
                    )
                  }
                >
                  แบน
                </button>
                <button
                  className="dismiss-button"
                  onClick={() =>
                    handleAction(
                      selectedReport.id,
                      selectedReport.reportToId,
                      "dismiss"
                    )
                  }
                >
                  ปล่อย
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportBox;
