// frontend/src/pages/Profile/Profile.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as authService from '../../services/authService';
import styles from './Profile.module.css';
function ProfilePage() {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        student_id: '', // Chỉ hiển thị/cập nhật nếu là sinh viên
    });
    const [passwordData, setPasswordData] = useState(
        {
            oldPassword: '',
            newPassword: '',
            confirmNewPassword: '',
        }
    );
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    // Populate form data with current user info
    if (user) {
      setFormData({
        full_name: user.full_name,
        email: user.email,
        student_id: user.student_id || '', // Handle potential null value
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
 const handlePasswordChange = (e) => {
    setPasswordData({
        ...passwordData,
        [e.target.name]: e.target.value
    });
 }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const updatedUser = await authService.updateProfile(formData);
      setMessage('Profile updated successfully!');
      setEditing(false);
      // Có thể cập nhật lại user trong context (nếu cần)
    } catch (err) {
      setError(err);
    }
  };
    const handlePasswordSubmit = async(e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        if(passwordData.newPassword !== passwordData.confirmNewPassword)
        {
            setError("New password and confirm new password don't match");
            return;
        }
        try{
            await authService.changePassword({
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword,
            });
            setMessage("Password changed successfully");
            setChangePassword(false);
            setPasswordData(
                {
                    oldPassword: '',
                    newPassword: '',
                    confirmNewPassword: '',
                }
            );
        }
        catch(error)
        {
            setError(error);
        }
    }
    const handleLogout = () => {

        logout();
    }
  return (
    <div className={styles.container}>
      <h1>Profile</h1>
      {message && <p className={styles.message}>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}

      {editing ? (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div>
            <label htmlFor="full_name">Full Name:</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
               className={styles.input}
            />
          </div>
          {user.role === 'student' && (
            <div>
              <label htmlFor="student_id">Student ID:</label>
              <input
                type="text"
                id="student_id"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                 className={styles.input}
              />
            </div>
          )}
          <button type="submit" className={styles.button}>Save Changes</button>
          <button type="button" className={styles.cancelButton} onClick={() => setEditing(false)}>Cancel</button>
        </form>
      ) : (
        <>
        <div className={styles.profileInfo}>

            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Full Name:</strong> {user.full_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
             {user.role === 'student' && (
                <p><strong>Student ID:</strong> {user.student_id}</p>
            )}
                <p><strong>Role: </strong>{user.role}</p>
          </div>
          <button className={styles.editButton} onClick={() => setEditing(true)}>Edit Profile</button>
          </>
      )}

        <button className={styles.changePasswordButton} onClick={()=> setChangePassword(true)}>Change Password</button>
        {changePassword && (
             <form className={styles.form} onSubmit={handlePasswordSubmit}>
             <div>
               <label htmlFor="oldPassword">Old Password:</label>
               <input
                 type="password"
                 id="oldPassword"
                 name="oldPassword"
                 value={passwordData.oldPassword}
                 onChange={handlePasswordChange}
                 required
                 className={styles.input}
              />
            </div>
            <div>
              <label htmlFor="newPassword">New Password:</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                className={styles.input}
              />
            </div>
             <div>
              <label htmlFor="confirmNewPassword">Confirm New Password:</label>
              <input
                type="password"
                id="confirmNewPassword"
                name="confirmNewPassword"
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordChange}
                required
                className={styles.input}
              />
            </div>
            <button type="submit" className={styles.button}>Change Password</button>
             <button type="button" className={styles.cancelButton} onClick={() => setChangePassword(false)}>Cancel</button>
           </form>
        )}
        <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default ProfilePage;