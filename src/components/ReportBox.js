import React, { useState } from 'react';

const ReportBox = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const mockData = [
    { id: 1, userid: 'USR001', username: 'user1', email: 'user1@example.com', date: '2024-11-15' },
    { id: 2, userid: 'USR002', username: 'user2', email: 'user2@example.com', date: '2024-11-15' },
    { id: 3, userid: 'USR003', username: 'user3', email: 'user3@example.com', date: '2024-11-15' },
    { id: 4, userid: 'USR004', username: 'user4', email: 'user4@example.com', date: '2024-11-15' },
    { id: 5, userid: 'USR005', username: 'user5', email: 'user5@example.com', date: '2024-11-15' },
    { id: 6, userid: 'USR006', username: 'user6', email: 'user6@example.com', date: '2024-11-15' },
  ];

  const handleOpenModal = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  return (
    <div className="w-full min-h-screen bg-white p-6">
      {/* Header */}
      <h2 className="text-lg font-medium mb-4">กล่องรายงาน</h2>

      {/* Table */}
      <div className="w-full border border-gray-300 rounded-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#2196F3] text-white">
              <th className="px-4 py-2 text-left border-r border-white/30 w-16">userid</th>
              <th className="px-4 py-2 text-left border-r border-white/30">username</th>
              <th className="px-4 py-2 text-left border-r border-white/30">email</th>
              <th className="px-4 py-2 text-left border-r border-white/30">วันที่รายงาน</th>
              <th className="px-4 py-2 text-left w-40"></th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((row, index) => (
              <tr key={row.id} className={index % 2 === 0 ? 'bg-[#E6E6E6]' : 'bg-[#D4D4D4]'}>
                <td className="px-4 py-2 border-r border-white/30">{row.id}</td>
                <td className="px-4 py-2 border-r border-white/30">{row.username}</td>
                <td className="px-4 py-2 border-r border-white/30">{row.email}</td>
                <td className="px-4 py-2 border-r border-white/30">{row.date}</td>
                <td className="px-4 py-2 text-right">
                  <button 
                    className="bg-[#666666] text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                    onClick={() => handleOpenModal(row)}
                  >
                    รายละเอียดเพิ่มเติม
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">หัวข้อเรื่อง</h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm">ชื่อผู้ส่ง</label>
                <input 
                  type="text" 
                  value={selectedReport?.username || ''} 
                  readOnly
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm">ชื่อผู้ถูกรายงาน</label>
                <input 
                  type="text"
                  readOnly 
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm">เนื้อหา</label>
                <textarea 
                  className="w-full p-2 border rounded h-32 resize-none"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportBox;