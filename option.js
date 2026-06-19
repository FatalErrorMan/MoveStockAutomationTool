// ========================================
// セーブ/ロード
// ========================================
function save() {
    chrome.storage.sync.set({
        "waitTimeMsec": document.querySelector("input#waitTimeMsec").value,
        "retryCount":  document.querySelector("input#retryCount").value
        }, () => {});
}

function load() {
    chrome.storage.sync.get(["waitTimeMsec", "retryCount"], (value) => {
        document.querySelector("input#waitTimeMsec").value = value.waitTimeMsec ? value.waitTimeMsec : "";
        document.querySelector("input#retryCount").value = value.retryCount ? value.retryCount : "";
        
        // ------------------------------
        // 設定の入力がある場合にはテキストボックスにフォーカス
        // ------------------------------
        if(document.querySelector("input#retryCount").value.length != 0) {
            document.querySelector("input#retryCount").focus();
        }
        if(document.querySelector("input#waitTimeMsec").value.length != 0) {
            document.querySelector("input#waitTimeMsec").focus();
        }
    });
}


// ========================================
// イベントリスナー：オプションページが読み込まれた時
// ========================================
document.addEventListener("DOMContentLoaded", () => {
    
    // ------------------------------
    // 設定値のロード
    // ------------------------------
    load();
});


// ========================================
// イベントリスナー：入力フォームイベント設定
// ========================================
Array.from(document.querySelectorAll(".text-float-textbox")).forEach((target) => {
    target.addEventListener("blur", (e) => {
        if(e.target.value.length === 0) {
            e.target.nextElementSibling.classList.remove("focus");
        }
    });
});

Array.from(document.querySelectorAll(".text-float-textbox")).forEach((target) => {
    target.addEventListener("focus", (e) => {
        e.target.nextElementSibling.classList.add("focus");
    });
});

Array.from(document.querySelectorAll(".text-float-label")).forEach((target) => {
    target.addEventListener("focus", (e) => {
        e.target.previousElementSibling.focus();
    });
});


// ========================================
// イベントリスナー：ボタンが押された時
// ========================================
document.querySelector("button#save").addEventListener("click", () => {
    alert("設定値を保存しました");
    save();
});


