// --- Bước 1: Tạo cấu trúc HTML cho Pop-up khi trang được tải ---

const overlay = document.createElement('div');
overlay.id = 'fact-check-overlay';

// Lấy URL của icon từ extension
const iconURL = chrome.runtime.getURL('icons/icon4.png');

// Cập nhật HTML để chứa cả hai trạng thái: loading và result
overlay.innerHTML = `
  <div id="fact-check-popup">
    <button id="fact-check-close">&times;</button>
    
    <div id="fact-check-loading-view">
        <img src="${iconURL}" class="icon" alt="Analyzing Icon">
        <h3>Đang kiểm tra sự thật<span class="ellipsis-container"><span>.</span><span>.</span><span>.</span></span></h3>
        <blockquote id="fact-check-text-loading"></blockquote>
    </div>

    <div id="fact-check-result-view">
        
        <div id="fact-check-label-container">
            </div>
        
        <div class="result-section">
            <h3 class="result-title">Tóm tắt</h3>
            <p id="fact-check-summary"></p>
        </div>

        <div class="result-section" id="source-section">
            <h3 class="result-title">Nguồn tham khảo</h3>
            <a id="fact-check-source" href="#" target="_blank" rel="noopener noreferrer"></a>
        </div>

    </div>
  </div>
`;

document.body.appendChild(overlay);

// Lấy các element để điều khiển sau này
const loadingView = document.getElementById('fact-check-loading-view');
const resultView = document.getElementById('fact-check-result-view');
const loadingTextElement = document.getElementById('fact-check-text-loading');
const closeButton = document.getElementById('fact-check-close');

// Elements cho kết quả
const labelContainer = document.getElementById('fact-check-label-container');
const summaryElement = document.getElementById('fact-check-summary');
const sourceElement = document.getElementById('fact-check-source');
const sourceSection = document.getElementById('source-section');


// Thêm sự kiện cho nút đóng
closeButton.addEventListener('click', () => {
  overlay.classList.remove('show');
  // Reset về trạng thái loading khi đóng
  setTimeout(() => {
    loadingView.style.display = 'block';
    resultView.style.display = 'none';
    labelContainer.innerHTML = ''; // Xóa nhãn cũ
  }, 300); // Chờ hiệu ứng mờ dần hoàn tất
});


// --- Bước 2: Lắng nghe thông điệp từ background.js ---

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  // Hiển thị popup loading
  if (request.action === "showLoadingPopup") {
    // Đảm bảo các view ở trạng thái ban đầu
    loadingView.style.display = 'block';
    resultView.style.display = 'none';

    if (loadingTextElement && overlay) {
      loadingTextElement.textContent = request.text;
      overlay.classList.add('show');
    }
    return true; // Giữ kết nối mở
  }

  // Hiển thị kết quả (NHÃN - TÓM TẮT - NGUỒN)
  if (request.action === "showResult") {
    const data = request.data;

    let labelText = data.label; // Lấy nhãn trực tiếp
    let labelClass = "orange"; // Mặc định là màu cam

    // Dựa vào nhãn để chọn màu
    switch (labelText) {
        case "Đúng sự thật":
            labelClass = "green"; // Xanh
            break;
        case "Sai sự thật":
        case "Gây hiểu lầm":
        case "Lỗi Kết Nối": // Nhãn lỗi cũng màu đỏ
        case "Lỗi AI":
            labelClass = "red"; // Đỏ
            break;
        case "Thiếu ngữ cảnh":
        case "Ý kiến cá nhân":
        case "Châm biếm/Hài hước":
        case "Không thể kiểm chứng":
        default:
            labelClass = "orange"; // Cam
            break;
    }

    // 1. Cập nhật Nhãn
    labelContainer.innerHTML = `<span class="label ${labelClass}">${labelText}</span>`;
    // 2. Cập nhật Tóm tắt
    summaryElement.textContent = data.summary;

    // 3. Cập nhật Nguồn
    if (data.source && data.source.trim() !== "") {
      sourceElement.textContent = data.source;
      sourceElement.href = data.source;
      sourceSection.style.display = 'block'; // Hiển thị vùng nguồn
    } else {
      sourceSection.style.display = 'none'; // Ẩn nếu không có nguồn
    }

    // Chuyển đổi view (Ẩn loading, hiện kết quả)
    loadingView.style.display = 'none';
    resultView.style.display = 'block';

    return true;
  }
});