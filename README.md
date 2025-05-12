# BTL_CNPM
# Hệ thống Điểm danh Sinh viên

Đây là dự án website hỗ trợ điểm danh sinh viên bằng mã QR và quản lý lớp học.

## Tổng quan

Dự án bao gồm:
* **Backend:** Xây dựng bằng Node.js, Express, PostgreSQL. Cung cấp API cho các chức năng xác thực, quản lý người dùng, lớp học, điểm danh, thông báo.
* **Frontend:** Xây dựng bằng React. Cung cấp giao diện người dùng cho sinh viên, giảng viên và quản trị viên.

## Công nghệ sử dụng

* **Backend:** Node.js, Express.js, PostgreSQL, JWT, Bcrypt, CORS, Dotenv, Express-Validator, pg (Node-Postgres)
* **Frontend:** React, React Router DOM, Axios, Context API, CSS Modules, html5-qrcode, qrcode.react
* **Database:** PostgreSQL

## Yêu cầu cài đặt (Prerequisites)

* [Node.js](https://nodejs.org/) (Phiên bản >= 14.x khuyến nghị)
* [npm](https://www.npmjs.com/) hoặc [yarn](https://yarnpkg.com/)
* [PostgreSQL](https://www.postgresql.org/) (Server và Client, ví dụ pgAdmin)
* [Git](https://git-scm.com/)

## Hướng dẫn Cài đặt và Chạy dự án

1.  **Clone Repository:**
    ```bash
    git clone <URL_REPO_CUA_BẠN>
    cd <TEN_THU_MUC_REPO>
    ```

2.  **Cài đặt Backend:**
    * Di chuyển vào thư mục backend:
        ```bash
        cd src/backend
        ```
    * Tạo file `.env` từ file ví dụ: Sao chép nội dung dưới đây vào file `.env` mới tạo trong thư mục `src/backend`.
        ```dotenv
        # PostgreSQL Database Configuration
        DB_USER=your_database_user        # Thay bằng user PostgreSQL của bạn
        DB_HOST=localhost                 # Hoặc địa chỉ IP/hostname của DB server
        DB_NAME=attendance_db             # Tên database bạn sẽ tạo
        DB_PASSWORD=your_database_password # Thay bằng mật khẩu PostgreSQL của bạn
        DB_PORT=5432                      # Port mặc định của PostgreSQL

        # JWT Configuration
        # Thay bằng một chuỗi ký tự ngẫu nhiên, mạnh mẽ và bí mật
        JWT_SECRET=your_very_secret_jwt_key_please_change_this

        # Server Configuration
        PORT=3001                         # Port backend sẽ chạy
        ```
        **Quan trọng:** Thay đổi các giá trị `your_...` và đặc biệt là `JWT_SECRET` thành các giá trị thực tế và an toàn.
    * Cài đặt các dependencies:
        ```bash
        npm install
        # hoặc: yarn install
        ```
    * **Thiết lập Database PostgreSQL:**
        * Đảm bảo PostgreSQL server đang chạy.
        * Sử dụng một công cụ quản lý PostgreSQL (như `psql` hoặc `pgAdmin`) để:
            * Tạo một database mới với tên bạn đã cấu hình trong `.env` (ví dụ: `attendance_db`).
            * Kết nối vào database vừa tạo.
            * Tạo các bảng dữ liệu cần thiết bằng cách chạy code sql trong file linhcnpm.sql
                ```
    * Chạy Backend Server:
        ```bash
        npm start
        ```
        Server sẽ chạy trên port đã cấu hình (mặc định là 3001).

3.  **Cài đặt Frontend:**
    * Mở một cửa sổ Terminal/Command Prompt **mới**.
    * Di chuyển vào thư mục frontend:
        ```bash
        cd đường/dẫn/tới/repo/src/frondend
        # Ví dụ: cd "C:\Điểm Danh\src\frondend"
        ```
    * Cài đặt các dependencies:
        ```bash
        npm install
        # hoặc: yarn install
        ```
    * Chạy Frontend Development Server:
        ```bash
        npm start
        ```
        Ứng dụng React sẽ tự động mở trong trình duyệt (thường là `http://localhost:3000`).

## Quy trình làm việc nhóm (Contributing)

1.  **Luôn cập nhật code mới nhất:** Trước khi bắt đầu code, chạy `git pull origin main` (hoặc tên nhánh chính).
2.  **Tạo nhánh mới:** Tạo một nhánh mới cho tính năng hoặc bug fix của bạn: `git checkout -b ten-nhanh-cua-ban` (ví dụ: `git checkout -b feature/login-page`).
3.  **Code và Commit:** Thực hiện thay đổi, sau đó commit thường xuyên với message rõ ràng:
    ```bash
    git add .
    git commit -m "Mô tả thay đổi của bạn"
    ```
4.  **Đẩy nhánh lên GitHub:**
    ```bash
    git push origin ten-nhanh-cua-ban
    ```
5.  **Tạo Pull Request:** Mở repository trên GitHub và tạo một Pull Request từ nhánh của bạn vào nhánh `main` để review và merge.

---
Chúc bạn và nhóm làm việc hiệu quả!