import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  getDocs,
  getFirestore,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { Search, Eye, Users, Trash } from "lucide-react";
import "./PostList.css";

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const itemsPerPage = 10;
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const getGroupType = (type) => {
    switch (type) {
      case 1:
        return "โอนก่อน";
      case 2:
        return "จ่ายหลังนัดรับ";
      default:
        return "ไม่ระบุ";
    }
  };

  const handleDeletePost = async (postId) => {
    setPostToDelete(postId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeletePost = async () => {
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "groups", postToDelete));
      setShowDeleteConfirmation(false);
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };
  const cancelDeletePost = () => {
    setShowDeleteConfirmation(false);
    setPostToDelete(null);
  };

  const getGroupStatus = (status) => {
    switch (status) {
      case "1":
        return "กำลังยืนยันการแชร์";
      case 2:
        return "กำลังยืนยันการซื้อ";
      case 3:
        return "กำลังดำเนินการนัดรับ";
      case 4:
        return "นัดรับสำเร็จแล้ว";
      default:
        return "ไม่ระบุสถานะ";
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "1":
        return "tag-pending";
      case 2:
        return "tag-confirming";
      case 3:
        return "tag-processing";
      case 4:
        return "tag-completed";
      default:
        return "tag-draft";
    }
  };

  const fetchUserData = async (userId) => {
    try {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        return userDoc.data().username || userId;
      }
      return userId;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return userId;
    }
  };

  const fetchPosts = async () => {
    try {
      const db = getFirestore();
      const groupsQuery = query(collection(db, "groups"));
      const querySnapshot = await getDocs(groupsQuery);
      const groupsData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setPosts(groupsData);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupMembers = async (groupId) => {
    try {
      const db = getFirestore();
      const membersQuery = query(collection(db, `groups/${groupId}/userlist`));
      const querySnapshot = await getDocs(membersQuery);

      // Fetch all member data in parallel
      const membersPromises = querySnapshot.docs.map(async (doc) => {
        const userData = await fetchUserData(doc.id);
        return {
          userId: doc.id,
          username: userData,
          ...doc.data(),
        };
      });

      const membersData = await Promise.all(membersPromises);
      setGroupMembers(membersData);
    } catch (error) {
      console.error("Error fetching group members:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(
    (post) =>
      post.groupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.groupDesc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.groupCate?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPosts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);

  const handleViewMembers = (group) => {
    setSelectedGroup(group);
    fetchGroupMembers(group.id);
  };

  return (
    <div className="post-list-container">
      {/* Search Bar */}
      <div className="search-container">
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="ค้นหากลุ่ม..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <Search
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#999",
            }}
            size={20}
          />
        </div>
      </div>

      {/* Posts Table */}
      <div className="post-table">
        <table>
          <thead>
            <tr>
              <th>รูปกลุ่ม</th>
              <th>ชื่อกลุ่ม</th>
              <th>หมวดหมู่</th>
              <th>รายละเอียด</th>
              <th>ประเภท</th>
              <th>สถานะ</th>
              <th>จำนวนสมาชิก</th>
              <th>ดูสมาชิก</th>
              <th>ลบกลุ่ม</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((post) => (
              <tr key={post.id}>
                <td>
                  <img
                    src={post.groupImage || "/api/placeholder/40/40"}
                    alt={post.groupName}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                </td>
                <td>{post.groupName}</td>
                <td>{post.groupCate}</td>
                <td>{post.groupDesc}</td>
                <td>{getGroupType(post.groupType)}</td>
                <td>
                  <span className={getStatusTag(post.groupStatus)}>
                    {getGroupStatus(post.groupStatus)}
                  </span>
                </td>
                <td>{post.groupSize}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={() => handleViewMembers(post)}
                    >
                      <Users size={20} />
                    </button>
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="delete-btn"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <Trash size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            style={{
              margin: "0 4px",
              padding: "4px 8px",
              border: "1px solid #d9d9d9",
              borderRadius: "2px",
              background: currentPage === i + 1 ? "#1890ff" : "#fff",
              color: currentPage === i + 1 ? "#fff" : "#000",
              cursor: "pointer",
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Members Modal */}
      {selectedGroup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "4px",
              width: "400px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3>สมาชิกในกลุ่ม {selectedGroup.groupName}</h3>
              <button
                onClick={() => setSelectedGroup(null)}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              {groupMembers.map((member) => (
                <div
                  key={member.userId}
                  style={{
                    padding: "8px 0",
                    borderBottom: "1px solid #e8e8e8",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 500 }}>
                      {member.username}
                    </p>
                    {member.role && (
                      <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                        {member.role}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirmation && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "4px",
              width: "400px",
            }}
          >
            <h3>ยืนยันการลบกลุ่มนี้?</h3>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "16px",
              }}
            >
              <button
                onClick={cancelDeletePost}
                style={{
                  marginRight: "8px",
                  padding: "8px 16px",
                  border: "1px solid #d9d9d9",
                  borderRadius: "2px",
                  background: "#fff",
                  color: "#000",
                  cursor: "pointer",
                }}
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDeletePost}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "2px",
                  background: "#ff4d4f",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostList;
