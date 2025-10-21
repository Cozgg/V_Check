// Tạo menu chuột phải khi extension được cài đặt
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "factCheckSelection",
    title: "Fact Check với Pino Clone", // Dòng chữ hiển thị khi chuột phải
    contexts: ["selection"] // Chỉ hiện ra khi người dùng bôi đen văn bản
  });
});

// Lắng nghe sự kiện khi người dùng nhấp vào menu chuột phải
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "factCheckSelection" && info.selectionText) {
    if (tab && tab.id) {
      try {
        chrome.tabs.sendMessage(tab.id, {
          action: "showLoadingPopup",
          text: info.selectionText
        });
      } catch (e) {
        console.warn("Không thể gửi tin nhắn đến content script. Có thể trang chưa sẵn sàng hoặc cần được tải lại.");
        console.warn(e);
      }
      callFactCheckingAPI(info.selectionText, tab.id);
    }
  }
});

// Hàm gọi API phân tích và gửi kết quả về lại content script
async function callFactCheckingAPI(text, tabId) {

  // Địa chỉ API Flask của bạn
  const API_URL = "http://127.0.0.1:5000/api/check";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text }), // Gửi văn bản trong body
    });

    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }

    const resultData = await response.json();

    // 3. LƯU KẾT QUẢ VÀO STORAGE
    // tệp popup.js của bạn sẽ tự động đọc từ đây
    chrome.storage.local.set({ analysisResult: resultData }, () => {
      console.log("Đã lưu kết quả phân tích vào storage.");
    });

    // 4. (Tùy chọn) Gửi tin nhắn cho content.js để ẩn loading
    // Hiện tại, popup.js của bạn đang xử lý việc này khi mở popup
    // Nhưng nếu bạn muốn ẩn loading overlay ngay lập tức, bạn có thể thêm:
    // chrome.tabs.sendMessage(tabId, { action: "hideLoadingPopup" });
    // (Bạn sẽ cần thêm code xử lý "hideLoadingPopup" trong content.js)

  } catch (error) {
    console.error("Lỗi khi gọi API Flask:", error);

    // Nếu lỗi, lưu thông báo lỗi vào storage để popup.js hiển thị
    const errorResult = {
        score: "?", // Hiển thị dấu "?" thay vì điểm số
        summary: "Không thể kết nối đến máy chủ phân tích. Vui lòng đảm bảo backend (Flask) đang chạy và thử lại."
    };
    chrome.storage.local.set({ analysisResult: errorResult });
  }
}