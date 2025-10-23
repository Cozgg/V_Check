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

# 1. Chuyển cấu hình app từ __init__.py sang đây
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('POSTGRES_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 2. Import db VÀ api_key TỪ 'backend' SAU KHI tạo và cấu hình app
from backend import api_key, db

# 3. Khởi tạo db với app
db.init_app(app)

# 4. Import model SAU KHI db được khởi tạo
#    Điều này là cần thiết để hàm init_db() hoạt động
from backend.model import FactCheck

genai.configure(api_key=api_key)
# Đảm bảo bạn đang dùng model được hỗ trợ, ví dụ 'gemini-1.5-flash'
model = genai.GenerativeModel('gemini-2.5-flash')

# --- ĐỊNH NGHĨA PROMPT CHO GEMINI ---
FACT_CHECK_PROMPT = """
Bạn là một trợ lý AI chuyên nghiệp có nhiệm vụ xác thực thông tin.
Văn bản cần kiểm tra: "{text_to_check}"

Hãy thực hiện các bước phân tích sau đây một cách âm thầm (không cần in ra):
1.  Phân tích tuyên bố chính trong văn bản.
2.  Tìm các nguồn uy tín (báo chí, học thuật) xác nhận hoặc bác bỏ tuyên bố này.
3.  Đánh giá bối cảnh, mục đích (ví dụ: châm biếm, ý kiến) của văn bản.

Sau khi hoàn thành phân tích, hãy chọn MỘT nhãn phù hợp nhất từ danh sách sau:
- "Đúng sự thật" (Nếu được xác nhận bởi nhiều nguồn uy tín)
- "Sai sự thật" (Nếu bị bác bỏ bởi nhiều nguồn uy tín)
- "Gây hiểu lầm" (Nếu thông tin đúng nhưng cách trình bày cố tình gây hiểu nhầm)
- "Thiếu ngữ cảnh" (Nếu thông tin đúng nhưng thiếu bối cảnh quan trọng)
- "Ý kiến cá nhân" (Nếu đây rõ ràng là quan điểm, không phải tuyên bố sự thật)
- "Châm biếm/Hài hước" (Nếu mục đích của văn bản là để đùa)
- "Không thể kiểm chứng" (Nếu không tìm thấy nguồn uy tín nào)

Hãy trả lời CHỈ BẰNG một đối tượng JSON hợp lệ với cấu trúc sau:
{{
  "label": "<Nhãn bạn đã chọn từ danh sách trên>",
  "summary": "<Bản tóm tắt (không quá 3 câu) giải thích cho lựa chọn nhãn của bạn>"
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
        cleaned_response_text = response.text.strip().replace("```json", "").replace("```", "").strip()

        try:
            result_data = json.loads(cleaned_response_text)

            if 'label' not in result_data or 'summary' not in result_data:
                raise ValueError("Thiếu key 'label' hoặc 'summary'")

            # Gửi lại dưới dạng JSON chuẩn cho frontend
            return jsonify(result_data), 200

        except (json.JSONDecodeError, ValueError) as e:
            print(f"Lỗi phân tích JSON từ Gemini: {e}")
            print(f"Dữ liệu gốc từ Gemini: {response.text}")
            return jsonify({"label": "Lỗi AI", "summary": "Lỗi xử lý phản hồi từ AI. Vui lòng thử lại."}), 500

    except Exception as e:
        print(f"Lỗi máy chủ nội bộ: {e}")
        return jsonify({"label": "Lỗi Kết Nối", "summary": f"Lỗi máy chủ nội bộ: {str(e)}"}), 500

@app.route('/api/init_db', methods=['GET'])
def init_db():
    try:
        with app.app_context():
            db.create_all()
        return "Database tables created successfully!", 200
    except Exception as e:
        return f"Error creating database: {str(e)}", 500

# Dòng này chỉ để chạy local, Vercel sẽ không dùng
if __name__ == '__main__':
    app.run(debug=True, port=5000)