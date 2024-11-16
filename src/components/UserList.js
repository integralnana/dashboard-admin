import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Divider,
  Tag,
  Modal,
  Button,
  Rate,
  List,
  Typography,
} from "antd";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

const { Search } = Input;
const { Text } = Typography;

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reports, setReports] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("reviews");
  const [usernames, setUsernames] = useState({}); // Cache for usernames

  // ดึงข้อมูลผู้ใช้ทั้งหมด
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersCollection = collection(db, "users");
        const userQuery = query(usersCollection, orderBy("username"));
        const querySnapshot = await getDocs(userQuery);

        const usersData = querySnapshot.docs.map((doc) => ({
          key: doc.id,
          status: doc.data().status,
          ...doc.data(),
        }));

        setUsers(usersData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ฟังก์ชั่นสำหรับดึงข้อมูล username จาก userId
  const fetchUsername = async (userId) => {
    if (usernames[userId]) return usernames[userId];

    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const username = userDoc.data().username;
        setUsernames((prev) => ({ ...prev, [userId]: username }));
        return username;
      }
      return "Unknown User";
    } catch (error) {
      console.error("Error fetching username:", error);
      return "Unknown User";
    }
  };

  // ดึงข้อมูล reviews และ reports พร้อมข้อมูล username
  const fetchUserDetails = async (userId) => {
    try {
      // ดึง reviews
      const reviewsSnapshot = await getDocs(
        collection(db, `users/${userId}/reviews`)
      );
      const reviewsPromises = reviewsSnapshot.docs.map(async (doc) => {
        const reviewData = doc.data();
        const username = await fetchUsername(reviewData.userId);
        return {
          id: doc.id,
          ...reviewData,
          username,
        };
      });
      const reviewsData = await Promise.all(reviewsPromises);
      setReviews(reviewsData);

      // ดึง reports
      const reportsSnapshot = await getDocs(
        collection(db, `users/${userId}/reports`)
      );
      const reportsPromises = reportsSnapshot.docs.map(async (doc) => {
        const reportData = doc.data();
        const reporterUsername = await fetchUsername(reportData.reporterId);
        return {
          id: doc.id,
          ...reportData,
          reporterUsername,
        };
      });
      const reportsData = await Promise.all(reportsPromises);
      setReports(reportsData);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    await fetchUserDetails(user.key);
    setIsModalVisible(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.fname?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.lname?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.userId?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "โปรไฟล์",
      key: "imageUrl",
      width: 80,
      render: (_, record) => (
        <img
          src={record.imageUrl || "https://via.placeholder.com/40"}
          alt={record.username}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            objectFit: "cover",
            border: "1px solid #f0f0f0",
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/40";
          }}
        />
      ),
    },
    {
      title: "ข้อมูล",
      key: "userInfo",
      width: 200,
      render: (_, record) => (
        <div>
          <Text strong>{record.username}</Text>
          <div>
            {record.fname} {record.lname}
          </div>
          <Text type="secondary">{record.email}</Text>
        </div>
      ),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color={status === "1" ? "green" : "red"}>
          {status === "1" ? "ปกติ" : "ถูกระงับ"}
        </Tag>
      ),
    },
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      width: 200,
    },

    {
      title: "การตรวจสอบ",
      key: "actions",
      width: 50,
      render: (_, record) => (
        <Button type="primary" onClick={() => handleUserClick(record)}>
          ตรวจดูการรีวิวและรายงาน
        </Button>
      ),
    },
  ];

  const renderUserDetailsModal = () => (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <img
            src={selectedUser?.imageUrl || "https://via.placeholder.com/40"}
            alt={selectedUser?.username}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              objectFit: "cover",
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/40";
            }}
          />
          <span>{selectedUser?.username}</span>
        </div>
      }
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      width={800}
      footer={null}
    >
      <div style={{ marginBottom: 16 }}>
        <Button
          type={activeTab === "reviews" ? "primary" : "default"}
          onClick={() => setActiveTab("reviews")}
          style={{ marginRight: 8 }}
        >
          รีวิว ({reviews.length})
        </Button>
        <Button
          type={activeTab === "reports" ? "primary" : "default"}
          onClick={() => setActiveTab("reports")}
        >
          รายงาน ({reports.length})
        </Button>
      </div>

      {activeTab === "reviews" ? (
        <List
          itemLayout="vertical"
          dataSource={reviews}
          locale={{ emptyText: "ไม่มีการรีวิว" }}
          renderItem={(review) => (
            <List.Item>
              <div>
                <Rate disabled defaultValue={review.star} />
                <Text style={{ marginLeft: 8 }}>{review.comment}</Text>
                <div>
                  <Text type="secondary">รีวิวโดย : {review.username}</Text>
                </div>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <List
          itemLayout="vertical"
          dataSource={reports}
          locale={{ emptyText: "ไม่มีการรายงาน" }}
          renderItem={(report) => (
            <List.Item>
              <div>
                <div style={{ marginBottom: 8 }}>
                  <Tag
                    color={
                      report.status === "pending"
                        ? "orange"
                        : report.status === "resolved"
                        ? "green"
                        : "red"
                    }
                  >
                    {report.status}
                  </Tag>
                  <Tag>{report.reportType}</Tag>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    รายงานโดย : {report.reporterUsername}
                  </Text>
                </div>
                <Text>{report.reportDesc}</Text>
                {report.imageUrl && (
                  <div style={{ marginTop: 8 }}>
                    <img
                      src={report.imageUrl}
                      alt="Report evidence"
                      style={{ maxWidth: 200, borderRadius: 4 }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/200x150?text=Image+Not+Found";
                      }}
                    />
                  </div>
                )}
              </div>
            </List.Item>
          )}
        />
      )}
    </Modal>
  );

  return (
    <div style={{ padding: "24px" }}>
      <Search
        placeholder="Search by username, name, email or user ID"
        allowClear
        onSearch={(value) => setSearchText(value)}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <Divider />
      <Table
        columns={columns}
        dataSource={filteredUsers}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} users`,
        }}
      />
      {renderUserDetailsModal()}
    </div>
  );
};

export default UserList;
