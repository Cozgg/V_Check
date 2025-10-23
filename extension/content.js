
const overlay = document.createElement('div');
overlay.id = 'fact-check-overlay';

const iconURL = chrome.runtime.getURL('icons/icon4.png');

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

const loadingView = document.getElementById('fact-check-loading-view');
const resultView = document.getElementById('fact-check-result-view');
const loadingTextElement = document.getElementById('fact-check-text-loading');
const closeButton = document.getElementById('fact-check-close');


const labelContainer = document.getElementById('fact-check-label-container');
const summaryElement = document.getElementById('fact-check-summary');
const sourceElement = document.getElementById('fact-check-source');
const sourceSection = document.getElementById('source-section');


closeButton.addEventListener('click', () => {
  overlay.classList.remove('show');

  setTimeout(() => {
    loadingView.style.display = 'block';
    resultView.style.display = 'none';
    labelContainer.innerHTML = ''; // Xóa nhãn cũ
  }, 300);
});



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {


  if (request.action === "showLoadingPopup") {

    loadingView.style.display = 'block';
    resultView.style.display = 'none';

    if (loadingTextElement && overlay) {
      loadingTextElement.textContent = request.text;
      overlay.classList.add('show');
    }
    return true;
  }

  if (request.action === "showResult") {
    const data = request.data;

    let labelText = data.label;
    let labelClass = "orange";


    switch (labelText) {
        case "Đúng sự thật":
            labelClass = "green";
            break;
        case "Sai sự thật":
        case "Gây hiểu lầm":
        case "Lỗi Kết Nối":
        case "Lỗi AI":
            labelClass = "red";
            break;
        case "Thiếu ngữ cảnh":
        case "Ý kiến cá nhân":
        case "Châm biếm/Hài hước":
        case "Không thể kiểm chứng":
        default:
            labelClass = "orange";
            break;
    }


    labelContainer.innerHTML = `<span class="label ${labelClass}">${labelText}</span>`;

    summaryElement.textContent = data.summary;


    if (data.source && data.source.trim() !== "") {
      sourceElement.textContent = data.source;
      sourceElement.href = data.source;
      sourceSection.style.display = 'block';
    } else {
      sourceSection.style.display = 'none';
    }

    loadingView.style.display = 'none';
    resultView.style.display = 'block';

    return true;
  }
});