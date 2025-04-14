// frontend/src/components/ClassForm/ClassForm.js
import React, { useState, useEffect } from 'react';
import * as classService from '../../services/classService';
import styles from './ClassForm.module.css';
//import { useAuth } from '../../context/AuthContext';

function ClassForm({ classInfo, onSuccess, onCancel }) {
    const [className, setClassName] = useState('');
    const [classCode, setClassCode] = useState('');
    const [error, setError] = useState('');
    //const { user } = useAuth();

    useEffect(() => {
        // Nếu có classInfo (đang edit), điền dữ liệu vào form
        if (classInfo) {
            setClassName(classInfo.class_name);
            setClassCode(classInfo.class_code);
        }
    }, [classInfo]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        try {
            const classData = {
                class_name: className,
                class_code: classCode,
            };

            if (classInfo) {
                // Edit
                await classService.updateClass(classInfo.id, classData);
            } else {
                // Create
              // classData.teacher_id = user.id; // Nếu cần truyền teacher_id khi tạo mới
                await classService.createClass(classData);
            }

            onSuccess && onSuccess(); // Gọi callback sau khi thành công

        } catch (error) {
            setError(error);
        }
    };

    return (
        <div className={styles.container}>
            <h3>{classInfo ? 'Edit Class' : 'Create Class'}</h3>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="className">Class Name:</label>
                    <input
                        type="text"
                        id="className"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>
                <div>
                    <label htmlFor="classCode">Class Code:</label>
                    <input
                        type="text"
                        id="classCode"
                        value={classCode}
                        onChange={(e) => setClassCode(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>
                <button type="submit" className={styles.button}>{classInfo ? 'Save Changes' : 'Create Class'}</button>
                 {onCancel && (
                    <button type="button" onClick={onCancel} className={styles.cancelButton}>
                    Cancel
                    </button>
                )}
            </form>
        </div>
    );
}

export default ClassForm;