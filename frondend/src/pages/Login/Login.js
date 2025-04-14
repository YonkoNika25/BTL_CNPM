// frontend/src/pages/Login/Login.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css'; // Import CSS Module

function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); // Reset error message
    try {
      await login({ username, password });
      // Chuyển hướng đến dashboard (đã xử lý trong AuthContext)

    } catch (error) {
      setError(error); // Hiển thị lỗi
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Login</h2>
        {error && <p className={styles.error}>{error}</p>}
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
             className={styles.input}
          />
        </div>
        <button type="submit"  className={styles.button}>Login</button>
      </form>
    </div>
  );
}

export default LoginPage;