// Tạo menu chuột phải khi extension được cài đặt
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "factCheckSelection",
    title: "Check with V_Check🤔",
    contexts: ["selection"]
  });
});

// Lắng nghe sự kiện khi người dùng nhấp vào menu chuột phải
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "factCheckSelection" && info.selectionText) {
    if (tab && tab.id) {
      try {
        // Gửi tin nhắn để HIỂN THỊ POPUP LOADING
        chrome.tabs.sendMessage(tab.id, {
          action: "showLoadingPopup",
          text: info.selectionText
        });
      } catch (e) {
        console.warn("Không thể gửi tin nhắn đến content script. Có thể trang chưa sẵn sàng hoặc cần được tải lại.");
        console.warn(e);
      }
      // Bắt đầu gọi API
      callFactCheckingAPI(info.selectionText, tab.id);
    }
  }
});

// Hàm gọi API phân tích và gửi kết quả về lại content script
async function callFactCheckingAPI(text, tabId) {
  try {
    // Giả lập thời gian chờ 3 giây của API
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Dữ liệu giả trả về (ĐÃ THÊM "source")
    const mockApiResponse = {
      score: Math.floor(Math.random() * 100), // Điểm ngẫu nhiên
      summary: "Đây là bản tóm tắt phân tích được tạo tự động. Nội dung có vẻ đáng tin cậy nhưng cần kiểm tra chéo các nguồn thông tin để có kết quả chính xác nhất.",
      source: "https://www.nguon-kiem-chung-gia-lap.com/bai-viet-abc-xyz" // Thêm nguồn
    };

    // Gửi thông điệp chứa KẾT QUẢ về cho content script
    try {
      chrome.tabs.sendMessage(tabId, {
        action: "showResult",
        data: mockApiResponse
      });
    } catch (e) {
      console.warn("Không thể gửi kết quả đến content script (có thể tab đã bị đóng):", e);
    }


  } catch (error) {
    console.error("Lỗi API:", error);
    // Gửi thông điệp báo lỗi về cho content script (nếu cần)
    try {
      chrome.tabs.sendMessage(tabId, {
        action: "showError", // Cần thêm logic xử lý lỗi này trong content.js nếu muốn
        error: "Không thể phân tích."
      });
    } catch (e) {
      // Bỏ qua nếu tab đã đóng
    }
  }
}