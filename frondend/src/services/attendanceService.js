
import api from '../utils/api';

export const getAttendanceByClassId = async (classId, limit, offset) => {
  try {
    const params = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    const response = await api.get(`/attendances/class/${classId}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to get attendance';
  }
};

export const getAttendanceByUserId = async (userId, limit, offset) => {
  try {
    const params = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    const response = await api.get(`/attendances/user/${userId}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to get attendance';
  }
};

// Tạo bản ghi điểm danh (Manual hoặc QR)
export const createAttendance = async (attendanceData) => {
  try {
      const response = await api.post('/attendance', attendanceData);
      return response.data;
  } catch (error) {
      const message = error.response?.data?.message || 'Failed to record attendance';
      //console.error("createAttendance error:", message, error.response);
      console.error(`createAttendance error: ${message}`, error?.response);

      throw new Error(message);
  }
};


export const updateAttendance = async (id, attendanceData) => {
  try {
    const response = await api.put(`/attendances/${id}`, attendanceData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update attendance';
  }
};

export const deleteAttendance = async (id) => {
  try {
    const response = await api.delete(`/attendances/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to delete attendance';
  }
};
// Tạo dữ liệu QR Code (GV)
export const generateQRCodeData = async (classId, durationMinutes = 5) => {
  try {
      const response = await api.post(`/attendance/qr/generate/${classId}`, { durationMinutes });
      return response.data; // { qrData: string, expiresAt: string }
  } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate QR code data';
      console.error("generateQRCodeData error:", message, error.response);
      throw new Error(message);
  }
};

// Lấy lịch sử điểm danh của user hiện tại (SV)
export const getAttendanceHistory = async (limit, offset) => {
    try {
        const params = {};
        if (limit) params.limit = limit;
        if (offset) params.offset = offset;
        const response = await api.get('/attendance/history', { params });
        return response.data;
    } catch (error) {
         const message = error.response?.data?.message || "Failed to get attendance history";
         console.error("getAttendanceHistory error:", message, error.response);
         throw new Error(message);
    }
};