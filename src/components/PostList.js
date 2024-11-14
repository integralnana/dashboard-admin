// PostList.js
import React, { useState } from 'react';
import { Table, Input, Tag, Button } from 'antd';
import './PostList.css';

const { Search } = Input;

const PostList = () => {
  const [posts, setPosts] = useState([
    { id: 1, title: 'Post 1', status: 'published', author: 'Author 1', timestamp: '2023-04-01' },
    { id: 2, title: 'Post 2', status: 'draft', author: 'Author 2', timestamp: '2023-04-02' },
    { id: 3, title: 'Post 3', status: 'published', author: 'Author 3', timestamp: '2023-04-03' },
    { id: 4, title: 'Post 4', status: 'draft', author: 'Author 4', timestamp: '2023-04-04' },
  ]);

  const [searchText, setSearchText] = useState('');

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchText.toLowerCase()) ||
      post.author.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: '10%' },
    { title: 'Title', dataIndex: 'title', key: 'title', width: '25%' },
    { title: 'Status', dataIndex: 'status', key: 'status', width: '15%',
      render: (status) => (
        <Tag className={`tag-${status}`}>{status}</Tag>
      )
    },
    { title: 'Author', dataIndex: 'author', key: 'author', width: '25%' },
    { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp', width: '15%' },
    { title: '', dataIndex: '', key: 'action', width: '10%',
      render: () => (
        <div className="action-buttons">
          <Button type="primary" className="edit-btn">
            Edit
          </Button>
          <Button type="danger" className="delete-btn">
            Delete
          </Button>
        </div>
      )
    },
  ];

  return (
    <div className="post-list-container">
      <div className="search-container">
        <Search
          placeholder="Search by Title or Author"
          allowClear
          onSearch={(value) => setSearchText(value)}
          className="search-input"
        />
      </div>
      <Table
        columns={columns}
        dataSource={filteredPosts}
        rowKey="id"
        pagination={{ position: ['bottomCenter'], className: 'pagination' }}
        className="post-table"
      />
    </div>
  );
};

export default PostList;