import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  getDocs,
  updateDoc,
  doc,
  setDoc,
  deleteDoc,
  Timestamp,
  collectionGroup,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { AlertCircle, CheckCircle, XCircle, X, Users, Ban } from "lucide-react";

// Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  username,
}) => {
  if (!isOpen) return null;

  const messages = {
    approve: {
      title: "ยืนยันการอนุมัติ",
      message: `คุณแน่ใจหรือไม่ที่จะอนุมัติคำขอ VIP ของ ${username}?`,
      confirmText: "อนุมัติ",
      confirmClass: "bg-green-600 hover:bg-green-700",
    },
    reject: {
      title: "ยืนยันการปฏิเสธ",
      message: `คุณแน่ใจหรือไม่ที่จะปฏิเสธคำขอ VIP ของ ${username}?`,
      confirmText: "ปฏิเสธ",
      confirmClass: "bg-red-600 hover:bg-red-700",
    },
    cancel: {
      title: "ยืนยันการยกเลิก VIP",
      message: `คุณแน่ใจหรือไม่ที่จะยกเลิกสถานะ VIP ของ ${username}?`,
      confirmText: "ยกเลิก VIP",
      confirmClass: "bg-red-600 hover:bg-red-700",
    },
  };

  const currentAction = messages[action];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">{currentAction.title}</h3>
          <p className="text-gray-600 mb-6">{currentAction.message}</p>

          <div className="flex justify-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${currentAction.confirmClass}`}
            >
              {currentAction.confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ImageModal = ({ image, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8"
      onClick={onClose}
    >
      <div className="relative w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
        <button
          onClick={onClose}
          className="absolute -top-8 right-0 sm:-right-8 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="h-4 w-4 sm:h-6 sm:w-6" />
        </button>
        <div className="bg-white rounded-lg overflow-hidden w-full">
          <img
            src={image}
            alt="สลิปการโอนเงินเต็มจอ"
            className="w-full h-auto max-h-[80vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, children, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2
      ${
        active
          ? "bg-blue-100 text-blue-700"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      }`}
  >
    {Icon && <Icon className="h-4 w-4" />}
    {children}
  </button>
);

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const labels = {
    pending: "รอดำเนินการ",
    approved: "อนุมัติแล้ว",
    rejected: "ปฏิเสธแล้ว",
  };

  return (
    <span
      className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};

const VipUserCard = ({ user, onCancelVip }) => {
  const now = new Date();
  const isExpired = user.expiredAt.toDate() < now;

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 flex items-center space-x-4">
        <img
          src={user.imageUrl || "/default-avatar.png"}
          alt={user.username}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {user.username}
          </h3>
          <p className="text-xs text-gray-500">
            เริ่มต้น: {user.startedAt.toDate().toLocaleDateString("th-TH")}
          </p>
          <p className="text-xs text-gray-500">
            หมดอายุ: {user.expiredAt.toDate().toLocaleDateString("th-TH")}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              isExpired
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {isExpired ? "หมดอายุ" : "กำลังใช้งาน"}
          </span>
          <button
            onClick={() => onCancelVip(user)}
            className="p-1 rounded-full hover:bg-red-100 text-red-600 transition-colors"
            title="ยกเลิก VIP"
          >
            <Ban className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export function VipList() {
  const [vipRequests, setVipRequests] = useState([]);
  const [vipUsers, setVipUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [vipFilter, setVipFilter] = useState("all"); // "all", "active", "expired"
  const [processingVipCancel, setProcessingVipCancel] = useState(false);
  // Add confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    action: null,
    request: null,
  });
  const handleCancelVip = async (user) => {
    setConfirmationModal({
      isOpen: true,
      action: "cancel",
      request: { username: user.username, userId: user.userId },
    });
  };

  const fetchVIPRequests = async () => {
    try {
      const q = query(collection(db, "vip"));
      const querySnapshot = await getDocs(q);
      const requests = [];
      querySnapshot.forEach((doc) => {
        requests.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate(),
          processedAt: doc.data().processedAt?.toDate(),
        });
      });
      requests.sort((a, b) => b.timestamp - a.timestamp);
      setVipRequests(requests);
    } catch (err) {
      setError("Failed to fetch VIP requests");
      console.error(err);
    }
  };

  const fetchVIPUsers = async () => {
    try {
      const vipStatusQuery = query(collectionGroup(db, "vipstatus"));
      const vipStatusSnapshot = await getDocs(vipStatusQuery);

      const vipUsersData = [];

      for (const vipDoc of vipStatusSnapshot.docs) {
        const userId = vipDoc.ref.parent.parent.id;
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          vipUsersData.push({
            userId,
            username: userDocSnap.data().username,
            imageUrl: userDocSnap.data().imageUrl,
            startedAt: vipDoc.data().startedAt,
            expiredAt: vipDoc.data().expiredAt,
          });
        }
      }

      vipUsersData.sort((a, b) => b.startedAt.toDate() - a.startedAt.toDate());
      setVipUsers(vipUsersData);
    } catch (err) {
      setError("Failed to fetch VIP users");
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "vipUsers") {
          await fetchVIPUsers();
        } else {
          await fetchVIPRequests();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  // Modified handlers to include confirmation
  const handleApproveClick = (request) => {
    setConfirmationModal({
      isOpen: true,
      action: "approve",
      request,
    });
  };

  const handleRejectClick = (request) => {
    setConfirmationModal({
      isOpen: true,
      action: "reject",
      request,
    });
  };

  const handleConfirmAction = async () => {
    const { action, request } = confirmationModal;

    if (action === "approve") {
      await handleApprove(request);
    } else if (action === "reject") {
      await handleReject(request);
    } else if (action === "cancel") {
      await handleCancelVipConfirmed(request);
    }

    setConfirmationModal({ isOpen: false, action: null, request: null });
  };
  const handleCancelVipConfirmed = async (request) => {
    setProcessingVipCancel(true);
    try {
      // Update user status
      const userRef = doc(db, "users", request.userId);
      await updateDoc(userRef, {
        status: "1",
      });
      const vipStatusRef = doc(
        db,
        "users",
        request.userId,
        "vipstatus",
        request.userId
      );
      await deleteDoc(vipStatusRef);

      // Add notification
      const pendingnotiRef = doc(
        db,
        "users",
        request.userId,
        "pendingnoti",
        request.userId
      );
      await setDoc(pendingnotiRef, {
        groupName: "",
        pendingcom: "สถานะ VIP ของคุณถูกยกเลิก",
        timestamp: Timestamp.now(),
      });

      // Refresh VIP users list
      await fetchVIPUsers();
    } catch (err) {
      setError("Failed to cancel VIP status");
      console.error(err);
    } finally {
      setProcessingVipCancel(false);
    }
  };

  const handleCloseConfirmation = () => {
    setConfirmationModal({ isOpen: false, action: null, request: null });
  };

  const handleApprove = async (request) => {
    setProcessingId(request.id);
    try {
      const userRef = doc(db, "users", request.userId);
      await updateDoc(userRef, {
        status: "2",
      });

      const expiredAt = new Date();
      expiredAt.setMonth(expiredAt.getMonth() + 1);

      const vipStatusRef = doc(
        db,
        "users",
        request.userId,
        "vipstatus",
        request.userId
      );
      await setDoc(vipStatusRef, {
        expiredAt: Timestamp.fromDate(expiredAt),
        startedAt: Timestamp.now(),
      });

      const pendingnotiRef = doc(
        db,
        "users",
        request.userId,
        "pendingnoti",
        request.userId
      );
      await setDoc(pendingnotiRef, {
        groupName: "",
        pendingcom: "รายการคำขอ Vip ของคุณถูกอนุมัติแล้ว",
        timestamp: Timestamp.now(),
      });

      const vipRef = doc(db, "vip", request.id);
      await updateDoc(vipRef, {
        status: "approved",
        processedAt: Timestamp.now(),
      });

      await fetchVIPRequests();
    } catch (err) {
      setError("Failed to approve VIP request");
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request) => {
    setProcessingId(request.id);
    try {
      const vipRef = doc(db, "vip", request.id);
      await updateDoc(vipRef, {
        status: "rejected",
        processedAt: Timestamp.now(),
      });
      const pendingnotiRef = doc(
        db,
        "users",
        request.userId,
        "pendingnoti",
        request.userId
      );
      await setDoc(pendingnotiRef, {
        groupName: "",
        pendingcom: "รายการคำขอ Vip ของคุณถูกปฏิเสธ",
        timestamp: Timestamp.now(),
      });

      await fetchVIPRequests();
    } catch (err) {
      setError("Failed to reject VIP request");
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };
  const filteredVipUsers = vipUsers.filter((user) => {
    const now = new Date();
    const isExpired = user.expiredAt.toDate() < now;

    if (vipFilter === "active") return !isExpired;
    if (vipFilter === "expired") return isExpired;
    return true;
  });

  const filteredRequests = vipRequests.filter((request) => {
    if (activeTab === "pending") return request.status === "pending";
    if (activeTab === "processed")
      return request.status === "approved" || request.status === "rejected";
    return false;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mx-4 sm:mx-6 mt-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span className="font-semibold">Error</span>
        </div>
        <p className="mt-1 ml-7">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        จัดการสมาชิก VIP
      </h1>

      <div className="flex gap-2 mb-4 border-b">
        <TabButton
          active={activeTab === "pending"}
          onClick={() => setActiveTab("pending")}
        >
          รายการรอดำเนินการ
        </TabButton>
        <TabButton
          active={activeTab === "processed"}
          onClick={() => setActiveTab("processed")}
        >
          ประวัติการดำเนินการ
        </TabButton>
        <TabButton
          active={activeTab === "vipUsers"}
          onClick={() => setActiveTab("vipUsers")}
          icon={Users}
        >
          รายชื่อสมาชิก VIP
        </TabButton>
      </div>

      {activeTab === "vipUsers" && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setVipFilter("all")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              vipFilter === "all"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setVipFilter("active")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              vipFilter === "active"
                ? "bg-green-100 text-green-700"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            กำลังใช้งาน
          </button>
          <button
            onClick={() => setVipFilter("expired")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              vipFilter === "expired"
                ? "bg-red-100 text-red-700"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            หมดอายุ
          </button>
        </div>
      )}

      {activeTab === "vipUsers" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVipUsers.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              ไม่พบรายชื่อสมาชิก VIP
              {vipFilter !== "all" && " ในหมวดที่เลือก"}
            </div>
          ) : (
            filteredVipUsers.map((user) => (
              <VipUserCard
                key={user.userId}
                user={user}
                onCancelVip={handleCancelVip}
              />
            ))
          )}
        </div>
      ) : (
        <div>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {activeTab === "pending"
                ? "ไม่มีคำขอสมัครสมาชิก VIP ที่รอดำเนินการ"
                : "ไม่มีประวัติการดำเนินการ"}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="relative bg-white border rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="p-3 sm:p-4 border-b">
                    <h3 className="font-semibold text-sm sm:text-base">
                      ผู้ใช้: {request.username}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      วันที่ส่งคำขอ:{" "}
                      {request.timestamp?.toLocaleString("th-TH")}
                    </p>
                    {request.processedAt && (
                      <p className="text-xs sm:text-sm text-gray-500">
                        วันที่ดำเนินการ:{" "}
                        {request.processedAt?.toLocaleString("th-TH")}
                      </p>
                    )}
                  </div>

                  <div
                    className="aspect-video bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(request.slipImage)}
                  >
                    <img
                      src={request.slipImage}
                      alt="สลิปการโอนเงิน"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="p-3 sm:p-4 bg-gray-50 flex items-center justify-between">
                    <StatusBadge status={request.status} />
                    {activeTab === "pending" && (
                      <div className="flex gap-1 sm:gap-2">
                        <button
                          onClick={() => handleRejectClick(request)}
                          disabled={processingId === request.id}
                          className="p-1.5 sm:p-2 rounded-full hover:bg-red-100 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="ปฏิเสธ"
                        >
                          <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                        <button
                          onClick={() => handleApproveClick(request)}
                          disabled={processingId === request.id}
                          className="p-1.5 sm:p-2 rounded-full hover:bg-green-100 text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="อนุมัติ"
                        >
                          <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                      </div>
                    )}
                  </div>

                  {processingId === request.id && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                  {processingVipCancel && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                        <span>กำลังยกเลิกสถานะ VIP...</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmAction}
        action={confirmationModal.action}
        username={confirmationModal.request?.username}
      />

      <ImageModal
        image={selectedImage}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}

export default VipList;
