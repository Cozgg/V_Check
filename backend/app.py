import os
import json
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Tải API key từ tệp .env
load_dotenv()

# --- Cấu hình Flask ---
app = Flask(__name__)
# Cho phép extension (từ origin khác) gọi API này
CORS(app)

# --- Cấu hình Gemini API ---
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("Không tìm thấy GEMINI_API_KEY. Vui lòng tạo tệp .env.")

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')  # Bạn có thể đổi sang 'gemini-pro' nếu muốn

# --- ĐỊNH NGHĨA PROMPT CHO GEMINI ---
# Đây là "trái tim" của Giai đoạn 1.
# Prompt này yêu cầu AI trả về ĐÚNG ĐỊNH DẠNG JSON
# mà tệp popup.js của bạn đang mong đợi (score và summary)
FACT_CHECK_PROMPT = """
Tôi cần kiểm chứng tính xác thực của thông tin sau: {text_to_check}
Vui lòng cung cấp:         
1.Nguồn gốc chính thức của tuyên bố này (nếu có).      
2.Các nguồn uy tín (báo chí, học thuật, tổ chức) xác nhận thông tin này.
3.Bất kỳ nguồn uy tín nào bác bỏ hoặc đưa tin trái ngược với thông tin này.
4.Đánh giá của bạn về bối cảnh và độ tin cậy của thông tin.
Hãy trả lời CHỈ BẰNG một đối tượng JSON hợp lệ có cấu trúc như sau (không thêm bất kỳ văn bản nào trước hoặc sau JSON):
{{
  "score": <điểm số từ 0-100>,
  "summary": "<bản tóm tắt phân tích của bạn>"
}}
"""


@app.route('/api/check', methods=['POST'])
def check_fact_api():
    """
    Endpoint API để nhận văn bản từ extension,
    gửi đến Gemini và trả kết quả về.
    """
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "Không tìm thấy 'text' trong nội dung request"}), 400

        text_to_check = data['text']

        # 1. Tạo prompt hoàn chỉnh
        prompt = FACT_CHECK_PROMPT.format(text_to_check=text_to_check)

        # 2. Gọi API Gemini
        response = model.generate_content(prompt)

        # 3. Xử lý phản hồi từ Gemini
        # Gemini có thể trả về text dạng ```json\n{...}\n```
        # Chúng ta cần làm sạch nó
        cleaned_response_text = response.text.strip().replace("```json", "").replace("```", "").strip()

        # Phân tích chuỗi JSON từ Gemini
        try:
            result_data = json.loads(cleaned_response_text)

            # Đảm bảo có đủ 'score' và 'summary'
            if 'score' not in result_data or 'summary' not in result_data:
                raise ValueError("Thiếu key 'score' hoặc 'summary'")

            # Gửi lại dưới dạng JSON chuẩn cho frontend
            return jsonify(result_data), 200

        except (json.JSONDecodeError, ValueError) as e:
            print(f"Lỗi phân tích JSON từ Gemini: {e}")
            print(f"Dữ liệu gốc từ Gemini: {response.text}")
            # Trả về lỗi nếu Gemini không trả về JSON đúng định dạng
            return jsonify({"score": 0, "summary": "Lỗi xử lý phản hồi từ AI. Vui lòng thử lại."}), 500

    except Exception as e:
        print(f"Lỗi máy chủ nội bộ: {e}")
        return jsonify({"error": f"Lỗi máy chủ nội bộ: {str(e)}"}), 500


if __name__ == '__main__':
    # Chạy máy chủ Flask trên cổng 5000
    app.run(debug=True, port=5000)