// services/notificationService.js
const admin = require('firebase-admin');
const pool = require('../config/db');

// Load service account key (tải file JSON từ Firebase Console và đặt vào thư mục gốc backend)
const serviceAccount = require('../../../your-service-account-key.json'); // Thay đổi đường dẫn

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.sendNotification = async (registrationToken, title, body, data) => {
    //data là một object, có thể truyền thêm các thông tin khác vào đây, VD như classId
  const message = {
    notification: {
      title: title,
      body: body,
    },
    data: data, // Dữ liệu tùy chọn
    token: registrationToken, // Hoặc tokens (mảng)
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error; // Hoặc xử lý lỗi tùy theo ứng dụng
  }
};
 // Hàm để lưu token của user vào database, khi user đăng nhập hoặc cài app
exports.saveRegistrationToken = async (userId, token) => {
    try{
        await pool.query('UPDATE users SET fcm_token = $1 WHERE id = $2', [token, userId]);

    }
    catch(error)
    {
        console.error("Error save Resgistration Token", error);
        throw error;
    }

}

//Ví dụ sử dụng:

//Trong một controller nào đó (ví dụ: attendanceController.js):
/*
 const notificationService = require('../services/notificationService');

 exports.createAttendance = async (req, res) => {
    // ... (logic điểm danh)
      // Sau khi điểm danh thành công, gửi thông báo
      const registrationToken = '...'; // Lấy token của user từ database (ví dụ)
      try{
            await notificationService.sendNotification(
            registrationToken, // Lấy từ database, liên kết với user
            'Điểm danh thành công',
            'Bạn đã điểm danh thành công lớp IT101 lúc 10:00 AM',
            { classId: '123' } // Dữ liệu tùy chọn
            );
            res.status(201).json(newAttendance);

      }
      catch(error)
      {
            // Không nên dừng quá trình điểm danh nếu gửi thông báo lỗi,
            // Có thể log lỗi ra và xử lý sau.
             console.error('Failed to send notification:', error);
            res.status(201).json(newAttendance); // Vẫn trả về kết quả điểm danh
      }
 }
*/