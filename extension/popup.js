document.addEventListener('DOMContentLoaded', function () {
    const homeState = document.getElementById('home-state');
    const loadingState = document.getElementById('loading-state');
    const resultState = document.getElementById('result-state');

    const labelText = document.getElementById('label-text');
    const summaryText = document.getElementById('summary-text');

    const sourceSection = document.getElementById('source-section');
    const sourceElement = document.getElementById('fact-check-source');
    // Hiển thị màn hình tải ngay lập tức
    homeState.style.display = 'none';
    loadingState.style.display = 'block';

    // Kiểm tra xem có kết quả nào trong storage không
    chrome.storage.local.get(['analysisResult'], function (storage) {
        loadingState.style.display = 'none';

        if (storage.analysisResult) {
            // Nếu có, hiển thị kết quả
            updateUI(storage.analysisResult);
            resultState.style.display = 'block';

            // Xóa kết quả khỏi storage để lần sau mở popup sẽ không hiển thị lại
            chrome.storage.local.remove('analysisResult');
        } else {
            // Nếu không có, hiển thị màn hình hướng dẫn
            homeState.style.display = 'block';
        }
    });

   // --- HÀM UPDATEUI ĐÃ CẬP NHẬT ĐẦY ĐỦ ---
    function updateUI(data) {
        // 1. Cập nhật Tóm tắt
        summaryText.textContent = data.summary;

        // 2. Cập nhật Nhãn
        labelText.textContent = data.label;
        let labelClass = 'orange'; // Mặc định là màu cam

        // Logic chọn màu (ĐÃ BAO GỒM TẤT CẢ 7 NHÃN + LỖI)
        switch (data.label) {
            // Nhóm màu Xanh (Tin cậy)
            case "Đúng sự thật":
                labelClass = "green";
                break;

            // Nhóm màu Đỏ (Cảnh báo)
            case "Sai sự thật":
            case "Gây hiểu lầm":
            case "Lỗi Kết Nối": // Nhãn lỗi
            case "Lỗi AI":
                labelClass = "red";
                break;

            // Nhóm màu Cam (Cần chú ý / Trung tính)
            case "Thiếu ngữ cảnh":
            case "Ý kiến cá nhân":
            case "Châm biếm/Hài hước":
            case "Không thể kiểm chứng":
            default:
                labelClass = "orange";
                break;
        }

        labelText.className = 'label ' + labelClass;

        // 3. Cập nhật Nguồn
        if (data.source) { // Kiểm tra an toàn
            sourceElement.textContent = data.source;
            sourceElement.href = data.source;
            sourceSection.style.display = 'block'; // Hiển thị vùng nguồn
        } else {
            sourceSection.style.display = 'none'; // Ẩn nếu không có nguồn
        }
    }
});
