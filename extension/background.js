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

async function callFactCheckingAPI(text, tabId) {
  const API_URL = "http://127.0.0.1:5000/api/check";
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Gửi văn bản mà người dùng đã bôi đen
      body: JSON.stringify({ text: text })
    });

    if (!response.ok) {
      // Nếu máy chủ Flask trả về lỗi (ví dụ: 500)
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }

    const resultData = await response.json();
    console.log("ĐÃ NHẬN KẾT QUẢ TỪ FLASK:", resultData); // Dòng kiểm tra
    // Gửi thông điệp chứa KẾT QUẢ về cho content script
    try {
      chrome.tabs.sendMessage(tabId, {
        action: "showResult",
        data: resultData
      });
    } catch (e) {
      console.warn("Không thể gửi kết quả đến content script (có thể tab đã bị đóng):", e);
    }

  } catch (error) {
    console.error("Lỗi API:", error);
    // Gửi thông điệp báo lỗi về cho content script (nếu cần)
    try {
      chrome.tabs.sendMessage(tabId, {
        action: "showError",
        error: "Không thể phân tích."
      });
    } catch (e) {
      // Bỏ qua nếu tab đã đóng
    }
  }
}
