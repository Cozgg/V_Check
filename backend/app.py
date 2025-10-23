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
from backend.model import FactCheck

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

# --- ĐỊNH NGHĨA PROMPT CHO GEMINI ---
FACT_CHECK_PROMPT = """
Bạn là một trợ lý AI chuyên nghiệp có nhiệm vụ xác thực thông tin.
Văn bản cần kiểm tra: "{text_to_check}"

Hãy thực hiện các bước phân tích sau đây một cách âm thầm (không cần in ra):
1.  Phân tích tuyên bố chính trong văn bản.
2.  Tìm các nguồn uy tín (báo chí chính thống, tạp chí học thuật, tổ chức chính phủ) để xác nhận hoặc bác bỏ tuyên bố này.
3.  **Quan trọng: Tránh sử dụng Wikipedia** làm nguồn minh chứng chính vì đây là nguồn mở, có thể bị chỉnh sửa.
4.  Đánh giá bối cảnh, mục đích của văn bản.
5.  Tìm MỘT link URL minh chứng (từ các nguồn uy tín đã nêu, không phải Wikipedia) cho phân tích của bạn.

Sau khi hoàn thành phân tích, hãy chọn MỘT nhãn phù hợp nhất từ danh sách sau:
- "Đúng sự thật"
- "Sai sự thật"
- "Gây hiểu lầm"
- "Thiếu ngữ cảnh"
- "Ý kiến cá nhân"
- "Châm biếm/Hài hước"
- "Không thể kiểm chứng"

Hãy trả lời CHỈ BẰNG một đối tượng JSON hợp lệ với cấu trúc sau:
{{
  "label": "<Nhãn bạn đã chọn từ danh sách trên>",
  "summary": "<Bản tóm tắt (không quá 3 câu) giải thích cho lựa chọn nhãn của bạn>",
  "source": "<link URL minh chứng, trả về chuỗi rỗng "" nếu không tìm thấy hoặc nếu nguồn duy nhất tìm được là Wikipedia>"
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

            if 'label' not in result_data or 'summary' not in result_data or 'source' not in result_data:
                raise ValueError("Thiếu key 'label', 'summary' hoặc 'source'")

            # === BẮT ĐẦU MÃ LƯU VÀO DATABASE ===
            # Mã này được thêm vào để lưu kết quả vào DB
            try:
                new_check = FactCheck(
                    text_checked=text_to_check,
                    label=result_data['label'],
                    summary=result_data['summary'],
                    source=result_data['source']
                )
                db.session.add(new_check)
                db.session.commit()
            except Exception as e:
                print(f"Lỗi khi lưu vào DB: {e}")
                db.session.rollback() # Quan trọng: Hủy bỏ nếu có lỗi
            # === KẾT THÚC MÃ LƯU VÀO DATABASE ===

            # Gửi lại dưới dạng JSON chuẩn cho frontend
            return jsonify(result_data), 200

        except (json.JSONDecodeError, ValueError) as e:
            print(f"Lỗi phân tích JSON từ Gemini: {e}")
            print(f"Dữ liệu gốc từ Gemini: {response.text}")
            return jsonify({"label": "Lỗi AI", "summary": "Lỗi xử lý phản hồi từ AI.", "source": ""}), 500

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
