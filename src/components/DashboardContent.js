import React, { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const DashboardContent = () => {
  const [userCount, setUserCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [vipCount, setVipCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const postsSnapshot = await getDocs(collection(db, "groups"));

      // Query VIP users (status == "2")
      const vipQuery = query(
        collection(db, "users"),
        where("status", "==", "2")
      );
      const vipSnapshot = await getDocs(vipQuery);

      setUserCount(usersSnapshot.docs.length);
      setPostCount(postsSnapshot.docs.length);
      setVipCount(vipSnapshot.docs.length);
    };

    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-2">จำนวนผู้ใช้ทั้งหมด</h3>
        <p className="text-4xl font-bold">{userCount}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-2">จำนวนโพสต์ทั้งหมด</h3>
        <p className="text-4xl font-bold">{postCount}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-2">จำนวนผู้ใช้ VIP</h3>
        <p className="text-4xl font-bold">{vipCount}</p>
      </div>
    </div>
  );
};

export default DashboardContent;
