// frontend/src/components/StudentList/StudentList.js

import React, { useState, useEffect } from 'react';
import * as classService from '../../services/classService';
import styles from './StudentList.module.css';

function StudentList({ classId }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await classService.getStudentsByClassId(classId);
        setStudents(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classId]); // Dependency array: re-fetch when classId changes

  const handleRemoveStudent = async(userId) => {
    if(window.confirm('Are you sure you want to remove this student?'))
    {
        try{
            await classService.removeStudentFromClass(classId, userId);
             // Cập nhật lại danh sách sinh viên
            setStudents(prevStudents => prevStudents.filter(student => student.id !== userId));
        }
        catch(error)
        {
            setError(error.message || "Failed to remove student");
        }
    }
  }

  if (loading) {
    return <div>Loading students...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      {students.length === 0 ? (
        <p>No students in this class yet.</p>
      ) : (
        <ul className={styles.list}>
          {students.map((student) => (
            <li key={student.id} className={styles.item}>
              <span>{student.full_name} ({student.username})</span>
              <button className={styles.removeButton} onClick={()=> handleRemoveStudent(student.id)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default StudentList;