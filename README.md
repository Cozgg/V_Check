
#  V_Check — AI phát hiện & cảnh báo thông tin sai lệch tiếng Việt

Một tiện ích mở rộng (browser extension) sử dụng AI để **phát hiện, gắn nhãn và cảnh báo thông tin sai lệch tiếng Việt**, hướng đến việc **tôn trọng quyền tự do ngôn luận** trong khi vẫn giúp người dùng đưa ra quyết định thông tin sáng suốt.

 Dự án được phát triển trong khuôn khổ **Giải pháp phần mềm 2025 - Chủ đề 6**:  
*“Nhiều người chia sẻ thông tin chưa được kiểm chứng về sức khỏe, chính trị, hay sản
phẩm. Việc kiểm duyệt thủ công là bất khả thi do khối lượng nội dung quá lớn.
Làm thế nào để phát hiện, gắn nhãn hoặc cảnh báo thông tin sai lệch bằng AI ngôn ngữ và xử lý văn bản tiếng Việt, mà vẫn đảm bảo tôn trọng quyền tự do ngôn luận?”*

---

##  Mục lục
- [1. Giới thiệu tổng quan](#1-giới-thiệu-tổng-quan)
  - [1.1. Bối cảnh](#11-bối-cảnh)
  - [1.2. Mục tiêu dự án](#12-mục-tiêu-dự-án)
- [2. Mô tả giải pháp và Tính năng](#2-mô-tả-giải-pháp-và-tính-năng)
  - [2.1. Giai đoạn 1: MVP - Tích hợp Gemini API](#21-giai-đoạn-1-mvp---tích-hợp-gemini-api)
  - [2.2. Giai đoạn 2: Huấn luyện mô hình tùy chỉnh](#22-giai-đoạn-2-huấn-luyện-mô-hình-tùy-chỉnh)
  - [2.3. Tính năng chính](#23-tính-năng-chính)
- [3. Cấu trúc thư mục](#3-cấu-trúc-thư-mục)
- [4. Hướng dẫn cài đặt & sử dụng](#4-hướng-dẫn-cài-đặt--sử-dụng)
- [5. Công nghệ & Thư viện](#5-công-nghệ--thư-viện)
- [6. Dữ liệu tham khảo](#6-dữ-liệu-tham-khảo)
- [7. Demo & Hướng phát triển](#7-demo--hướng-phát-triển)
- [8. Giấy phép](#8-giấy-phép)

---

## 1. Giới thiệu tổng quan

### 1.1. Bối cảnh  
Trong thời đại số, thông tin sai lệch (misinformation/disinformation) lan truyền nhanh chóng trên mạng xã hội, gây ảnh hưởng tiêu cực đến xã hội.  
Việc **kiểm duyệt thủ công là bất khả thi** do khối lượng nội dung tiếng Việt khổng lồ được tạo ra mỗi ngày.

### 1.2. Mục tiêu dự án  
Xây dựng **một công cụ dạng tiện ích mở rộng trình duyệt (browser extension)**, cho phép người dùng:
- Chủ động kiểm tra độ tin cậy của một đoạn văn bản bất kỳ.
- Nhận được **cảnh báo và gợi ý xác thực từ AI**.  
Giải pháp **không kiểm duyệt hay gỡ bỏ nội dung**, mà **gắn nhãn và cung cấp cảnh báo**, đảm bảo **tự do ngôn luận** trong khi hỗ trợ người dùng **nhận diện thông tin sai lệch**.

---

## 2. Mô tả giải pháp và Tính năng

Giải pháp được thiết kế gồm **2 giai đoạn** nhằm đảm bảo tính khả thi và mở rộng trong tương lai.

### 2.1. Giai đoạn 1: MVP - Tích hợp Gemini API
- Người dùng **bôi đen đoạn văn bản** và nhấn nút kiểm tra.
- Extension gửi nội dung đến **Google Gemini API** thông qua backend Flask.
- Gemini phân tích & trả về kết quả xác thực (mức độ tin cậy, cảnh báo, trích dẫn).
- Kết quả hiển thị trực quan ngay trong giao diện extension.
- **Dữ liệu (văn bản, kết quả, URL)** được lưu trữ trên **AWS S3** để phục vụ giai đoạn huấn luyện.

### 2.2. Giai đoạn 2: Huấn luyện mô hình tùy chỉnh
- **Thu thập dữ liệu**: Dùng BeautifulSoup để crawl, xác nhận đường dẫn và làm sạch các URL đã lưu;
- **Fine-tuning**: Tinh chỉnh mô hình **PhoBERT** để phân loại mức độ tin cậy của văn bản tiếng Việt.
- **Triển khai & cập nhật**: Extension được cập nhật để gọi mô hình PhoBERT trước, Gemini sau (nếu cần).

### 2.3. Tính năng chính
- **Phân tích thông minh**: Kiểm tra nội dung văn bản trực tiếp trên trang web.  
- **AI Xác thực**: Sử dụng LLM (Gemini / PhoBERT) để phân tích và đánh giá độ tin cậy.  
- **Gắn nhãn rõ ràng**: "Độ tin cậy cao" – "Cần kiểm chứng" – "Có khả năng sai lệch".  
- **Học tăng cường**: Hệ thống lưu dữ liệu để cải thiện độ chính xác qua thời gian.

---

## 3. Cấu trúc thư mục

```bash
V_Check/
├── backend/
│   ├── app.py
│   ├── model.py
│   ├── requirements.txt
├── extension/
│   ├── manifest.json
│   ├── background.js
│   ├── popup.html
│   ├── popup.js
│   ├── popup.css
│   └── icons/
└── README.md
```

## 4. Hướng dẫn cài đặt & sử dụng

### Yêu cầu
- Trình duyệt: Chrome/Edge/Firefox
- Python 3.9+
- Một file `.env` chứa các biến: `GEMINI_API_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET` (tùy chọn)

### Cài đặt extension (dành cho dev)
1. Clone repository:

```bash
git clone https://github.com/Cozgg/V_Check.git
```

2. Mở Chrome/Edge và truy cập `chrome://extensions`.
3. Bật "Developer mode".
4. Chọn "Load unpacked" và trỏ đến thư mục `extension/` trong repo.

### Cài đặt Backend (local)
Windows (PowerShell):

```powershell
python -m venv venv
venv\Scripts\activate
pip install -r backend/requirements.txt
```

Thiết lập file `.env` với các khóa cần thiết, sau đó chạy server API (ví dụ Flask):

```powershell
python backend/app.py
```

> Lưu ý: Ở Giai đoạn 1, bạn có thể cấu hình extension để gọi trực tiếp Gemini API từ frontend, nhưng cách an toàn hơn là gọi qua backend để bảo vệ API key và kiểm soát logging.

---

## 5. Công nghệ & Thư viện

- Frontend (Extension): JavaScript, HTML, CSS
- Backend: Python (Flask)
- Giai đoạn 1 AI: Google Gemini API
- Giai đoạn 2 AI: PhoBERT (PyTorch, Transformers)
- Scraping & Xử lý dữ liệu: BeautifulSoup, requests
- Lưu trữ: AWS S3

---

## 6. Dữ liệu tham khảo

Trong Giai đoạn 2, để huấn luyện và fine-tune mô hình PhoBERT, dự án sẽ tham khảo bộ dữ liệu **VIETNAMESE FAKE NEWS DATASET (VFND)**.

BibTeX:

```bibtex
@misc{ho_quang_thanh_2019_2578917,
  author = {Ho Quang Thanh and ninh-pm-se},
  title = {{thanhhocse96/vfnd-vietnamese-fake-news-datasets: Tập hợp các bài báo tiếng Việt và các bài post Facebook phân loại 2 nhãn Thật \\& Giả (228 bài)}},
  month = feb,
  year = 2019,
  doi = {10.5281/zenodo.2578917},
  url = {https://doi.org/10.5281/zenodo.2578917}
}
```

---

## 7. Demo & Hướng phát triển

- Tạo demo extension, quay video ngắn hướng dẫn (30–60s) thao tác bôi đen và nhận kết quả.  
- Tích hợp explainability để giải thích tại sao AI đánh giá một nội dung là "Cần kiểm chứng".

---

## 8. Giấy phép

Dự án này được phát hành dưới giấy phép **MIT**.

---

### Liên hệ tác giả

- Nhóm tham dự cuộc thi: NGU (Never Give Up)
- Gmail : nguyenhuucong295@gmail.com
- Thành viên trong nhóm: Xem thêm trong [contributors](https://github.com/Cozgg/V_Check/graphs/contributors)
- Repository: https://github.com/Cozgg/V_Check

---

