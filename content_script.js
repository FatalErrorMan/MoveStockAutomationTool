// ========================================
// イベントリスナー：backgroundからのメッセージ受信
// ========================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    
    (async () => {
        // ------------------------------------------------------------
        // ローカルストレージから設定値を読み出す
        // ------------------------------------------------------------
        const settings = await chrome.storage.sync.get(["waitTimeMsec", "retryCount"]);
        if (isNotAssinedValue(settings.waitTimeMsec)) settings.waitTimeMsec = 300;
        if (isNotAssinedValue(settings.retryCount)) settings.retryCount = 10;
        
        // ------------------------------------------------------------
        // 検索欄に"ほげほげ"と打ち込んで検索
        // ※実際は製薬メーカー名が入りますが、社内規約に抵触する可能性があるため伏せています。
        // ------------------------------------------------------------
        document.querySelector("input.comTblSearchTextBox").value = "ほげほげ";
        document.querySelector("input.ComHnmSearchBtn").click();
        
        // ------------------------------------------------------------
        // 検索ヒットしないため、中間検索をクリック
        // ------------------------------------------------------------
        try {
            await retry("span#searchsl a:nth-of-type(2)", settings.waitTimeMsec, settings.retryCount);
        }
        catch {
            alert("指定の時間内に画面遷移が行われませんでした\nオプションで待機時間を調整してください");  
            return;
        }
        document.querySelector("span#searchsl a:nth-of-type(2)").dispatchEvent(new Event("click"));
        
        // ------------------------------------------------------------
        // 検索結果の中から薬品名マスタに一致するものをクリック
        // ------------------------------------------------------------
        try {
            await retry("tr#layitem0", settings.waitTimeMsec, settings.retryCount);
        }
        catch {
            alert("指定の時間内に画面遷移が行われませんでした\nオプションで待機時間を調整してください");
            return;
        }        
        let stockTableNodes = document.querySelectorAll("table.msobjTbl td.tdHnm")
        await checkStockList(stockTableNodes, stockMasterList);
        
        // ------------------------------------------------------------
        // 選択ボタンをクリック
        // ------------------------------------------------------------
        document.querySelector("a#selectbtn").dispatchEvent(new Event("click"));
    })();
    sendResponse(message);
    return true;
});


// ========================================
// メーカー名検索結果チェック
// ========================================
const checkStockList = (targetNodes, masterList) => new Promise(resolve => {
    
    // 抽出した行ノードの中から、薬品名部分を抜き出したリストを生成
    const targetList = Array.from(targetNodes).map(node => node.innerText);
    
    // マスターの要素を1つずつ存在確認、存在する場合は該当のチェックボックスにチェック
    masterList.forEach((master) => {
        if (targetList.includes(master)) {
            targetNodes[targetList.indexOf(master)].parentNode.dispatchEvent(new Event("click"));
        }
    });
    resolve();
});


// ========================================
// 待機用関数
// ========================================
// スリープ
const sleep = (waitTimeMsec) => new Promise(resolve => {
    setTimeout(() => resolve(), waitTimeMsec);
});

// リトライ
const retry = (targetCssSelector, waitTimeMsec, retryCount) => new Promise((resolve, reject) => {
    let count = 1;
    const interval = setInterval(() => {
        if (document.querySelector(targetCssSelector) != null) {
            clearInterval(interval);
            resolve();
        }
        else if (count === retryCount) {
            clearInterval(interval);
            reject();
        }
        count++;
    }, waitTimeMsec);
});


// ========================================
// 無効値判定関数
// ========================================
const isNotAssinedValue = (value) => value === undefined || value === null || value === "";
