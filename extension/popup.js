document.addEventListener('DOMContentLoaded', function () {
    const homeState = document.getElementById('home-state');
    const loadingState = document.getElementById('loading-state');
    const resultState = document.getElementById('result-state');

    const scoreValue = document.getElementById('score-value');
    const scoreCircle = document.getElementById('score-circle');
    const summaryText = document.getElementById('summary-text');

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

    function updateUI(data) {
        summaryText.textContent = data.summary;
        labelText.textContent = data.label; // Hiển thị nhãn

        let labelClass = 'orange'; // Mặc định

        // Logic chọn màu giống hệt content.js
        switch (data.label) {
            case "Đúng sự thật":
                labelClass = "green";
                break;
            case "Sai sự thật":
            case "Gây hiểu lầm":
            case "Lỗi Kết Nối":
            case "Lỗi AI":
                labelClass = "red";
                break;
            default: // "Thiếu ngữ cảnh", "Ý kiến cá nhân", v.v.
                labelClass = "orange";
                break;
        }

        // Xóa class màu cũ và thêm class màu mới
        labelText.className = 'label ' + labelClass;
    }
});