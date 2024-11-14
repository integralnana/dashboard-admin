import React from 'react';
import './UserProfile.css';

function UserProfile() {
  // Sample user data for display
  const users = [
    { username: 'user1', email: 'user1@example.com' },
    { username: 'user2', email: 'user2@example.com' },
    { username: 'user3', email: 'user3@example.com' },
    { username: 'user4', email: 'user4@example.com' }
  ];

  return (
    <div className="user-profile">
      {users.map((user, index) => (
        <div className="user-card" key={index}>
          <p><strong>username :</strong> {user.username}</p>
          <p><strong>email :</strong> {user.email}</p>
          <button className="details-button">รายละเอียด</button>
        </div>
      ))}
    </div>
  );
}

export default UserProfile;
