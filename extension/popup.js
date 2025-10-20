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
        scoreValue.textContent = `${data.score}%`;
        summaryText.textContent = data.summary;

        let color = '#ccc';
        if (data.score >= 75) {
            color = '#28a745';
        } else if (data.score >= 50) {
            color = '#ffc107';
        } else {
            color = '#dc3545';
        }
        scoreCircle.style.borderColor = color;
        scoreCircle.style.backgroundColor = color;
    }
});