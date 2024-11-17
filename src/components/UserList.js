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
  collectionGroup,
  where,
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
  const [userGroups, setUserGroups] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("reviews");
  const [usernames, setUsernames] = useState({});

  const fetchUserGroups = async (userId) => {
    try {
      const userListRef = collectionGroup(db, "userlist");
      const q = query(userListRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      const groupPromises = querySnapshot.docs.map(async (doc) => {
        const groupRef = doc.ref.parent.parent;
        const groupDoc = await getDoc(groupRef);

        if (groupDoc.exists()) {
          return {
            id: groupDoc.id,
            ...groupDoc.data(),
          };
        }
        return null;
      });

      const groups = (await Promise.all(groupPromises)).filter(
        (group) => group !== null
      );
      setUserGroups(groups);
    } catch (error) {
      console.error("Error fetching user groups:", error);
    }
  };

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
    await Promise.all([
      fetchUserDetails(user.key),
      fetchUserGroups(user.userId),
    ]);
    setIsModalVisible(true);
  };
  const renderGroupStatus = (status) => {
    const statusMap = {
      1: { text: "กำลังยืนยันการแชร์", color: "orange" },
      2: { text: "กำลังดำเนินการซื้อสินค้า", color: "blue" },
      3: { text: "กำลังดำเนินการนัดรับ", color: "purple" },
      4: { text: "นัดรับสำเร็จ", color: "green" },
    };
    return (
      <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
    );
  };
  const renderGroupType = (type) => {
    return (
      <Tag color={type === 1 ? "red" : "red"}>
        {type === 1 ? "โอนก่อน" : "จ่ายหลังนัดรับ"}
      </Tag>
    );
  };

  // เพิ่มฟังก์ชั่นสำหรับแสดงประเภทการแชร์
  const renderGroupGenre = (genre) => {
    return (
      <Tag color={genre === 1 ? "blue" : "cyan"}>
        {genre === 1 ? "แชร์ซื้อสินค้า" : "สินค้าลดราคา"}
      </Tag>
    );
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
      render: (status) => {
        let color;
        let text;

        switch (status) {
          case "1":
            color = "green";
            text = "ปกติ";
            break;
          case "0":
            color = "red";
            text = "ถูกระงับ";
            break;
          case "2":
            color = "gold";
            text = "VIP";
            break;
          default:
            color = "gray";
            text = "ไม่ทราบสถานะ";
        }

        return <Tag color={color}>{text}</Tag>;
      },
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
          ตรวจดูรายการข้อมูล
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
          style={{ marginRight: 8 }}
        >
          รายงาน ({reports.length})
        </Button>
        <Button
          type={activeTab === "groups" ? "primary" : "default"}
          onClick={() => setActiveTab("groups")}
        >
          กลุ่มที่เข้าร่วม ({userGroups.length})
        </Button>
      </div>

      {activeTab === "reviews" && (
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
      )}

      {activeTab === "reports" && (
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

      {activeTab === "groups" && (
        <List
          itemLayout="vertical"
          dataSource={userGroups}
          locale={{ emptyText: "ไม่ได้เข้าร่วมกลุ่มใด" }}
          renderItem={(group) => (
            <List.Item>
              <div style={{ display: "flex", gap: "16px" }}>
                <img
                  src={group.groupImage || "https://via.placeholder.com/100"}
                  alt={group.groupName}
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/100";
                  }}
                />
                <div>
                  <Text strong style={{ fontSize: "16px" }}>
                    {group.groupName}
                  </Text>
                  <div style={{ margin: "8px 0" }}>
                    {renderGroupType(group.groupType)}
                    {renderGroupStatus(group.groupStatus)}
                    {renderGroupGenre(group.groupGenre)}
                  </div>
                  <Text type="secondary">{group.groupDesc}</Text>
                  <div style={{ marginTop: "8px" }}>
                    <Text type="secondary">จำนวนสมาชิก: {group.groupSize}</Text>
                  </div>
                </div>
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
