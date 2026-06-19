// ========================================
// 変数
// ========================================
// background <-> content_script間のメッセージパッシング用オブジェクト
let message = { state: "message" };


// ========================================
// 関数
// ========================================
// content_scriptからのレスポンスを受け取る
function recieveMessage(response) {
    message.state = response.state;
}


// ========================================
// イベントリスナー：拡張機能のクリック
// ========================================
chrome.action.onClicked.addListener(tab => {
    
    // 【処理】開始
    chrome.tabs.sendMessage(tab.id, message, response => recieveMessage(response));
});

