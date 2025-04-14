// frontend/src/components/AddStudentToClassForm/AddStudentToClassForm.js
import React, { useState } from 'react';
import * as classService from '../../services/classService';
import styles from './AddStudentToClassForm.module.css';
function AddStudentToClassForm({ classId , onSuccess}) {
    const [userId, setUserId] = useState(''); // ID hoặc username của sinh viên
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');

        try {
            await classService.addStudentToClass(classId, userId); // Thêm userId
             setUserId('');
            setMessage('Student added successfully!');
            onSuccess && onSuccess(); // Gọi callback

        } catch (error) {
            setError(error); // Hiển thị lỗi từ service
        }
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Add Student to Class</h3>
            {message && <p className={styles.message}>{message}</p>}
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit} className={styles.form}>
                <div>
                    <label htmlFor="userId">Student ID or Username:</label>
                    <input
                        type="text"
                        id="userId"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>
                <button type="submit" className={styles.button}>Add Student</button>
            </form>
        </div>
    );
}
export default AddStudentToClassForm;