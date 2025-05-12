// frontend/src/pages/Register/Register.js
import React, { useState } from 'react';
import * as authService from '../../services/authService';
import styles from './Register.module.css';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('student'); // Mặc định là sinh viên
    const [studentId, setStudentId] = useState(''); // Nếu là sinh viên
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        try {
            const userData = {
                username,
                password,
                email,
                full_name: fullName,
                role,
                student_id: role === 'student' ? studentId : null,
            };
            await authService.register(userData);
             navigate('/login');
            //   alert('Registration successful! Please login.');

        } catch (error) {
            setError(error);
        }
    };

    return (
        <div className={styles.container}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h2 className={styles.title}>Register</h2>
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
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>
                <div>
                    <label htmlFor="fullName">Full Name:</label>
                    <input
                        type="text"
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>
                <div>
                    <label htmlFor="role">Role:</label>
                    <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className={styles.select}>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option> {/* Nếu có role admin */}
                    </select>
                </div>
                {role === 'student' && (
                    <div>
                        <label htmlFor="studentId">Student ID:</label>
                        <input
                            type="text"
                            id="studentId"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                )}
                <button type='submit' className={styles.button}>Register</button>
            </form>
        </div>
    );
}

export default RegisterPage;