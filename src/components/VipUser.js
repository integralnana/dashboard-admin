import React from 'react';

const ReportBox = () => {
  const mockUserData = {
    username: "johnsmith",
    userid: "USR123456",
    email: "john@example.com",
    status: "pending",
    paymentSlip: "slip_20241115.jpg",
    requestDate: "2024-11-15",
    paymentAmount: "299.00"
  };

  return (
    <div className="w-full min-h-screen bg-[#F2F2F2]">
      {/* Header */}
      <div className="p-6">
        <h1 className="text-xl font-medium mb-6">คำร้องขอสมัคร VIP</h1>
        
        {/* Content Box */}
        <div className="bg-[#E6E6E6] p-6 rounded-lg max-w-md">
          <div className="space-y-4">
            <div className="flex">
              <span className="w-24">username :</span>
              <span>{mockUserData.username}</span>
            </div>
            
            <div className="flex">
              <span className="w-24">userid :</span>
              <span>{mockUserData.userid}</span>
            </div>
            
            <div className="flex">
              <span className="w-24">email :</span>
              <span>{mockUserData.email}</span>
            </div>

            {/* Payment Slip Box */}
            <div className="mt-6">
              <div className="bg-[#999999] w-32 h-32 flex items-center justify-center text-white text-center">
                รูปสลิปโอนเงิน
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportBox;