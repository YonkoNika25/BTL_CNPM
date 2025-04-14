import React, { useState, useEffect } from 'react';
import * as classService from '../../services/classService';
import styles from './EditClassForm.module.css';

function EditClassForm({ classInfo, onSuccess, onCancel }) {
    const [className, setClassName] = useState('');
    const [classCode, setClassCode] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (classInfo) {
            setClassName(classInfo.class_name);
            setClassCode(classInfo.class_code);
        }
    }, [classInfo]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        try {
            const updatedClassData = {
                class_name: className,
                class_code: classCode,
            };
            await classService.updateClass(classInfo.id, updatedClassData);
            onSuccess && onSuccess(); // Gọi callback
        } catch (error) {
            setError(error);
        }
    };

    if (!classInfo) {
        return <div>Loading...</div>; // Hoặc xử lý trường hợp không có classInfo
    }

    return (
        <div className={styles.container}>
             <h3 className={styles.title}>Edit Class</h3>
            {error && <p className={styles.error}>{error}</p>}
            <form className={styles.form} onSubmit={handleSubmit}>
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
                <button type="submit" className={styles.button}>Save Changes</button>
                <button type='button' className={styles.cancelButton} onClick={onCancel}>Cancel</button>
            </form>
        </div>
    );
}

export default EditClassForm;