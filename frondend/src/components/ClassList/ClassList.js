// frontend/src/components/ClassList/ClassList.js
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ClassList.module.css';
function ClassList({ classes, showTeacher = false, onEdit, onDelete }) {
    return (
        <div className={styles.container}>
            {classes.length === 0 ? (
                <p>No classes found.</p>
            ) : (
                <ul className={styles.list}>
                    {classes.map((classItem) => (
                        <li key={classItem.id} className={styles.item}>
                            <Link to={`/classes/${classItem.id}`} className={styles.link}>
                                {classItem.class_name} ({classItem.class_code})
                            </Link>
                            {showTeacher && classItem.teacher && (
                                <span className={styles.teacherName}> - {classItem.teacher.full_name}</span>
                            )}

                            {onEdit && (
                                <button className={styles.editButton} onClick={()=> onEdit(classItem.id)}>Edit</button>
                            )}
                            {onDelete && (
                               <button className={styles.deleteButton} onClick={() => onDelete(classItem.id)}>Delete</button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ClassList;