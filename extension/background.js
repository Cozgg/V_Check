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
  try {
    // Giả lập thời gian chờ 2 giây của API
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Dữ liệu giả trả về
    const mockApiResponse = {
      score: Math.floor(Math.random() * 100),
      summary: "Đây là bản tóm tắt phân tích được tạo tự động. Nội dung có vẻ đáng tin cậy nhưng cần kiểm tra chéo các nguồn thông tin."
    };

    // Bước 3: Gửi thông điệp chứa KẾT QUẢ về cho content script
    // (Chúng ta sẽ hoàn thiện phần nhận kết quả này ở bước tiếp theo)
    /* chrome.tabs.sendMessage(tabId, {
        action: "showResult",
        data: mockApiResponse
    });
    */

  } catch (error) {
    console.error("Lỗi API:", error);
    // Gửi thông điệp báo lỗi về cho content script (nếu cần)
    /*
    chrome.tabs.sendMessage(tabId, {
        action: "showError",
        error: "Không thể phân tích."
    });
    */
  }
}