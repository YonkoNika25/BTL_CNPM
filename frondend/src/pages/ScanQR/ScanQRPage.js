// src/frondend/src/pages/ScanQR/ScanQRPage.js
import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode'; // Import thư viện mới
import * as attendanceService from '../../services/attendanceService';
import styles from './ScanQRPage.module.css';
import { useNavigate } from 'react-router-dom';

// ID cho phần tử div mà thư viện sẽ gắn camera vào
const QR_READER_ELEMENT_ID = "qr-code-reader";

function ScanQRPage() {
    const [scanResult, setScanResult] = useState(null); // Lưu kết quả nếu cần hiển thị
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const scannerRef = useRef(null); // Tham chiếu tới đối tượng scanner

    useEffect(() => {
        // Chỉ khởi tạo scanner nếu chưa thành công
        if (!successMessage && !scannerRef.current) {
            // Cấu hình scanner
            const config = {
                fps: 10, // Khung hình/giây để quét
                qrbox: { width: 250, height: 250 }, // Kích thước hộp quét (tùy chọn)
                rememberLastUsedCamera: true, // Nhớ camera lần trước
                supportedScanTypes: [0] // 0 là SCAN_TYPE_CAMERA
            };

            const html5QrCodeScanner = new Html5QrcodeScanner(
                QR_READER_ELEMENT_ID, // ID của div container
                config,
                /* verbose= */ false // Không ghi log chi tiết của thư viện
            );

             // Hàm xử lý khi quét thành công
            const onScanSuccess = async (decodedText, decodedResult) => {
                console.log(`Code matched = ${decodedText}`, decodedResult);
                // Dừng quét sau khi thành công
                if (scannerRef.current) {
                    try {
                         // Dừng scanner trước khi xử lý để tránh quét lại
                         await scannerRef.current.clear();
                         scannerRef.current = null; // Đánh dấu đã clear
                         console.log("Scanner cleared on success.");
                    } catch (clearError) {
                         console.error("Failed to clear scanner on success:", clearError);
                    }
                }

                 // Chỉ xử lý nếu chưa loading và chưa thành công
                if (!loading && !successMessage) {
                    setScanResult(decodedText);
                    setError('');
                    setLoading(true);

                    try {
                        const attendanceData = {
                            attendance_type: 'QR',
                            qrData: decodedText,
                        };
                        const apiResult = await attendanceService.createAttendance(attendanceData);
                        setSuccessMessage(`Successfully checked in at ${new Date(apiResult.timestamp).toLocaleTimeString()}! Redirecting...`);
                        setTimeout(() => navigate('/dashboard'), 2000);
                    } catch (err) {
                        setError(err.message || 'Failed to record attendance. Invalid or expired QR code?');
                        // Không tự động quét lại, người dùng cần F5 hoặc back
                    } finally {
                        setLoading(false);
                    }
                }
            };

            // Hàm xử lý khi quét lỗi (không phải lỗi camera)
            const onScanFailure = (scanError) => {
                // Thường bị gọi liên tục khi không tìm thấy QR, nên không nên set state lỗi ở đây
                // console.warn(`Code scan error = ${scanError}`);
            };

            // Bắt đầu quét
            html5QrCodeScanner.render(onScanSuccess, onScanFailure);
            scannerRef.current = html5QrCodeScanner; // Lưu tham chiếu
        }

        // Hàm dọn dẹp khi component unmount
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().then(() => {
                     console.log("Scanner cleared on unmount.");
                      scannerRef.current = null;
                }).catch(error => {
                    console.error("Failed to clear html5QrcodeScanner on unmount:", error);
                });
            }
        };
    // Chỉ chạy useEffect một lần khi mount (và khi successMessage thay đổi để dừng scanner)
    }, [successMessage]); // Phụ thuộc vào successMessage để dừng


    return (
        <div className={styles.container}>
            <h1>Scan Attendance QR Code</h1>

            {/* Phần tử div để thư viện html5-qrcode gắn camera vào */}
            {/* Chỉ hiển thị khu vực quét nếu chưa thành công */}
            {!successMessage && <div id={QR_READER_ELEMENT_ID} className={styles.qrReaderElement}></div>}

            {/* Hiển thị trạng thái */}
            {loading && <p className={styles.loading}>Processing...</p>}
            {error && <p className={styles.error}>{error}</p>}
            {successMessage && <p className={styles.success}>{successMessage}</p>}
            {/* {scanResult && <p>Last scan data: {scanResult}</p>} */}

             {/* Nút quay lại */}
             <button onClick={() => navigate(-1)} className={styles.backButton} disabled={loading}>
                 Back
             </button>
        </div>
    );
}

export default ScanQRPage;