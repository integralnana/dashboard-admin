import React, { useState } from 'react';
import { Table, Input, Divider, Tag } from 'antd';

const { Search } = Input;

const UserList = () => {
  const [users, setUsers] = useState([
    { id: 1, username: 'user1', role: 'admin', email: 'user1@example.com' },
    { id: 2, username: 'user2', role: 'user', email: 'user2@example.com' },
    { id: 3, username: 'banned_user', role: 'banned', email: 'banned@example.com' },
    { id: 4, username: 'vip_user', role: 'vip', email: 'vip@example.com' },
  ]);

  const [searchText, setSearchText] = useState('');

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchText.toLowerCase()) ||
      user.id.toString().includes(searchText)
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Role', dataIndex: 'role', key: 'role', render: (role) => <Tag color={role === 'admin' ? 'green' : role === 'vip' ? 'gold' : 'volcano'}>{role}</Tag> },
    { title: 'Email', dataIndex: 'email', key: 'email' },
  ];

  return (
    <div>
      <Search
        placeholder="Search by ID or Username"
        allowClear
        onSearch={(value) => setSearchText(value)}
        style={{ marginBottom: 16 }}
      />
      <Divider />
      <Table columns={columns} dataSource={filteredUsers} rowKey="id" />
    </div>
  );
};

export default UserList;