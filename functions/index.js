const { onCall } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
// Initialize Firebase Admin once
admin.initializeApp();

// Set global options
setGlobalOptions({
  region: "asia-southeast1",
  maxInstances: 10,
  timeoutSeconds: 60,
  memory: "256MiB",
  cors: [
    "http://localhost:3000",
    "https://myproj-c6008.firebaseapp.com",
    "https://myproj-c6008.web.app",
  ],
});

// Cloud Function to disable user
exports.disableUser = onCall(
  {
    enforceAppCheck: false,
    cors: true, // Enable CORS for this function
  },
  async (request) => {
    const { data, auth } = request;

    // ตรวจสอบว่ามีการ authenticate แล้ว
    if (!auth) {
      throw new Error("ต้องทำการเข้าสู่ระบบก่อน");
    }

    // ตรวจสอบว่าเป็น admin
    const callerUid = auth.uid;
    try {
      const callerRef = await admin
        .firestore()
        .collection("users")
        .doc(callerUid)
        .get();

      if (!callerRef.exists) {
        throw new Error("ไม่พบข้อมูลผู้ใช้");
      }

      const callerData = callerRef.data();
      if (!callerData.isAdmin) {
        throw new Error("ต้องเป็น admin เท่านั้น");
      }

      const { uid } = data;
      if (!uid) {
        throw new Error("ต้องระบุ uid ของผู้ใช้");
      }

      await admin.auth().updateUser(uid, {
        disabled: true,
      });

      await admin.firestore().collection("admin_logs").add({
        action: "disable_user",
        targetUid: uid,
        adminUid: callerUid,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      await admin.firestore().collection("users").doc(uid).update({
        status: "0",
        disabledAt: admin.firestore.FieldValue.serverTimestamp(),
        disabledBy: callerUid,
      });

      return {
        success: true,
        message: "ปิดการใช้งานบัญชีผู้ใช้เรียบร้อยแล้ว",
      };
    } catch (error) {
      console.error("Error disabling user:", error);
      throw new Error(error.message);
    }
  }
);

// Cloud Function to enable user
exports.enableUser = onCall(
  {
    enforceAppCheck: false,
    cors: true, // Enable CORS for this function
  },
  async (request) => {
    const { data, auth } = request;

    if (!auth) {
      throw new Error("ต้องทำการเข้าสู่ระบบก่อน");
    }

    const callerUid = auth.uid;
    try {
      const callerRef = await admin
        .firestore()
        .collection("users")
        .doc(callerUid)
        .get();

      if (!callerRef.exists) {
        throw new Error("ไม่พบข้อมูลผู้ใช้");
      }

      const callerData = callerRef.data();
      if (!callerData.isAdmin) {
        throw new Error("ต้องเป็น admin เท่านั้น");
      }

      const { uid } = data;
      if (!uid) {
        throw new Error("ต้องระบุ uid ของผู้ใช้");
      }

      await admin.auth().updateUser(uid, {
        disabled: false,
      });

      // อัพเดทสถานะใน users collection
      await admin.firestore().collection("users").doc(uid).update({
        status: "1",
        enabledAt: admin.firestore.FieldValue.serverTimestamp(),
        enabledBy: callerUid,
      });

      await admin.firestore().collection("admin_logs").add({
        action: "enable_user",
        targetUid: uid,
        adminUid: callerUid,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        message: "เปิดใช้งานบัญชีผู้ใช้เรียบร้อยแล้ว",
      };
    } catch (error) {
      console.error("Error enabling user:", error);
      throw new Error(error.message);
    }
  }
);
