// --- Bước 1: Tạo cấu trúc HTML cho Pop-up khi trang được tải ---

const overlay = document.createElement('div');
overlay.id = 'fact-check-overlay';

overlay.innerHTML = `
  <div id="fact-check-popup">
    <button id="fact-check-close">&times;</button>
    
    <div id="fact-check-loading-view">
        <div class="icon"><img src="icons/icon2.png"></div>
        <h3>Đang kiểm tra sự thật...</h3>
        <blockquote id="fact-check-text"></blockquote>
    </div>

    <div id="fact-check-result-view">
        </div>
  </div>
`;

const iconURL = chrome.runtime.getURL('icons/icon4.png');

overlay.innerHTML = `
  <div id="fact-check-popup">
    <button id="fact-check-close">&times;</button>
    <div id="fact-check-loading-view">
        <img src="${iconURL}" class="icon" alt="Analyzing Icon">
        <h3>Đang kiểm tra sự thật...</h3>
        <blockquote id="fact-check-text"></blockquote>
    </div>
  </div>
`;



document.body.appendChild(overlay);

// Lấy các element để điều khiển sau này
const popupTextElement = document.getElementById('fact-check-text');
const closeButton = document.getElementById('fact-check-close');

// Thêm sự kiện cho nút đóng
closeButton.addEventListener('click', () => {
    overlay.classList.remove('show');
});


// --- Bước 2: Lắng nghe thông điệp từ background.js ---

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "showLoadingPopup") {
        const popupTextElement = document.getElementById('fact-check-text');
        const overlay = document.getElementById('fact-check-overlay');

        if (popupTextElement && overlay) {
            popupTextElement.textContent = request.text;
            overlay.classList.add('show');
        }

        // Trả về true để giữ kết nối mở cho các phản hồi không đồng bộ (nếu cần)
        return true;
    }
});