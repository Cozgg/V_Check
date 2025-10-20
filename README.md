V_CheckĐây là dự án phát hiện và cảnh báo thông tin sai lệch Tiếng Việt, được phát triển để tham gia cuộc thi Giải pháp phần mềm 2025 nhằm giải quyết Chủ đề 6. Giải pháp của chúng tôi tập trung vào việc xây dựng một tiện ích mở rộng cho trình duyệt, sử dụng AI để phân tích và cung cấp thông tin tham khảo về độ tin cậy của nội dung mà không kiểm duyệt hay gỡ bỏ.1. Giới thiệu tổng quan và Vấn đề1.1. Bối cảnhTrong thời đại số, thông tin sai lệch (misinformation/disinformation) lan truyền trên mạng xã hội và các nền tảng nội dung đang gây ra nhiều hệ lụy tiêu cực cho xã hội. Với khối lượng nội dung Tiếng Việt khổng lồ được tạo ra mỗi ngày, việc kiểm duyệt thủ công là không khả thi. Do đó, cần có một giải pháp tự động, nhanh chóng, và hiệu quả để hỗ trợ người dùng nhận diện thông tin chưa được kiểm chứng.1.2. Mục tiêu dự ánDự án hướng tới việc xây dựng một công cụ dưới dạng Browser Extension (tiện ích mở rộng trình duyệt). Công cụ này cho phép người dùng chủ động kiểm tra một đoạn văn bản bất kỳ, nhận được cảnh báo và thông tin tham khảo từ hệ thống AI.Giải pháp không kiểm duyệt hay gỡ bỏ nội dung, mà tập trung vào việc gắn nhãn và cung cấp cảnh báo, qua đó tôn trọng quyền tự do ngôn luận trong khi vẫn trang bị cho người dùng công cụ để đưa ra quyết định sáng suốt.2. Mô tả giải pháp và Tính năngGiải pháp được thiết kế theo kiến trúc 2 giai đoạn để đảm bảo tính khả thi và phát triển bền vững.2.1. Giai đoạn 1: Tích hợp Gemini API (MVP)Ở giai đoạn đầu, extension sẽ hoạt động như một "client" thông minh, gửi yêu cầu tới một mô hình ngôn ngữ lớn có sẵn.Người dùng bôi đen văn bản và nhấn nút kiểm tra trên extension.Extension gửi văn bản (đã được bọc trong một prompt kỹ thuật) đến Google Gemini API.Gemini API trả về kết quả phân tích và xác thực.Extension hiển thị kết quả này cho người dùng một cách trực quan.Dữ liệu (văn bản, kết quả, URL nguồn) được lưu trữ vào AWS S3 để phục vụ cho Giai đoạn 2.2.2. Giai đoạn 2: Huấn luyện mô hình tùy chỉnhĐể tăng tốc độ, giảm chi phí và tăng cường độ chính xác cho văn bản Tiếng Việt, chúng tôi sẽ sử dụng dữ liệu thu thập được để huấn luyện mô hình riêng.Thu thập dữ liệu: Sử dụng BeautifulSoup để crawl và làm sạch dữ liệu từ các URL đã lưu. Bổ sung dữ liệu từ các nguồn mở uy tín như VFND.Fine-tuning: Sử dụng bộ dữ liệu Tiếng Việt đã được gán nhãn để fine-tune mô hình PhoBERT cho bài toán phân loại văn bản.Triển khai & Cập nhật: Extension sẽ được cập nhật để ưu tiên gọi mô hình PhoBERT đã được fine-tune.2.3. Các tính năng chínhQuét và Phân tích: Cho phép người dùng bôi đen văn bản trên bất kỳ trang web nào để kiểm tra.Xác thực bằng AI: Sử dụng LLM để phân tích và đưa ra kết quả xác thực ban đầu.Gắn nhãn thông minh: Hiển thị kết quả (ví dụ: "Độ tin cậy cao", "Cần kiểm chứng", "Có khả năng sai lệch").Hệ thống học tăng cường: Tự động thu thập truy vấn và kết quả để xây dựng bộ dữ liệu.3. Cấu trúc thư mụcV_Check/
├── backend/
│   ├── app.py
│   ├── model.py
│   ├── requirements.txt
│   └── __init__.py
├── extension/
│   ├── manifest.json
│   ├── background.js
│   ├── popup.html
│   ├── popup.js
│   ├── popup.css
│   └── icons/
└── README.md
4. Hướng dẫn cài đặt và sử dụng4.1. Yêu cầuTrình duyệt (Chrome, Edge, Firefox)Python 3.9+Một file .env chứa GEMINI_API_KEY và thông tin AWS_ACCESS_KEY, AWS_SECRET_KEY.4.2. Cài đặt ExtensionClone repository này:git clone [https://github.com/Cozgg/V_Check.git](https://github.com/Cozgg/V_Check.git)
Mở trình duyệt Chrome/Edge và truy cập chrome://extensions.Bật "Chế độ nhà phát triển" (Developer mode).Chọn "Tải tiện ích đã giải nén" (Load unpacked) và trỏ đến thư mục extension.4.3. Cài đặt môi trường BackendTạo và kích hoạt môi trường ảo:python -m venv venv
source venv/bin/activate  # Trên Windows: venv\Scripts\activate
Cài đặt các thư viện cần thiết:pip install -r requirements.txt
5. Các thư viện và công nghệFrontend (Extension): JavaScript, HTML, CSSAI Model (Giai đoạn 1): Google Gemini APIAI Model (Giai đoạn 2): PhoBERT (PyTorch, Transformers)Data Scraping: Python, BeautifulSoupLưu trữ dữ liệu: AWS S36. Dữ liệu tham khảoTrong Giai đoạn 2, để huấn luyện và fine-tune mô hình PhoBERT, dự án sẽ tham khảo và sử dụng bộ dữ liệu VIETNAMESE FAKE NEWS DATASET - VFND.Dẫn nguồn (BibTex):@misc{ho_quang_thanh_2019_2578917,
  author       = {Ho Quang Thanh and
                  ninh-pm-se},
  title        = {{thanhhocse96/vfnd-vietnamese-fake-news-datasets:
                   Tập hợp các bài báo tiếng Việt và các bài post
                   Facebook phân loại 2 nhãn Thật \& Giả (228 bài)}},
  month        = feb,
  year         = 2019,
  doi          = {10.5281/zenodo.2578917},
  url          = {[https://doi.org/10.5281/zenodo.2578917](https://doi.org/10.5281/zenodo.2578917)}
}
7. Các tác giảXem thêm trong contributors của dự án.8. Giấy phépDự án này được phát hành dưới Giấy phép MIT.
