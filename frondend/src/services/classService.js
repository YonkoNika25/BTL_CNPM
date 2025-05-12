import api from '../utils/api';

export const getAllClasses = async (limit, offset) => {
  try {
    const params = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    const response = await api.get('/classes', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to get all classes';
  }
};

export const getClassById = async (id) => {
  try {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to get class';
  }
};

export const createClass = async (classData) => {
  try {
    const response = await api.post('/classes', classData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to create class';
  }
};

export const updateClass = async (id, classData) => {
  try {
    const response = await api.put(`/classes/${id}`, classData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update class';
  }
};

export const deleteClass = async (id) => {
  try {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to delete class';
  }
};
export const getStudentsByClassId = async (classId, limit, offset) => {
  try {
    const params = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    const response = await api.get(`/classes/${classId}/students`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to get students in class';
  }
};

export const addStudentToClass = async (classId, studentId) => { 
  try {
    // Gửi request POST đến /classes/${classId}/students
    // với studentId (được backend hiểu là userId) trong body
    const response = await api.post(`/classes/${classId}/students`, { userId: studentId });
    return response.data;
  } catch (error) {
    // Ném ra lỗi để component có thể bắt và hiển thị
    throw error.response?.data?.message || 'Failed to add student to class';
  }
};
export const removeStudentFromClass = async (classId, studentId) => {
  try {
    const response = await api.delete(`/classes/${classId}/students/${studentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to remove student from class';
  }
};

export const getClassesByTeacherId = async (teacherId, limit, offset) => {
  try {
    const params = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    // Gọi API backend tương ứng (ví dụ: GET /classes/teacher/:teacherId)
    const response = await api.get(`/classes/teacher/${teacherId}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to get classes by teacher';
  }
};