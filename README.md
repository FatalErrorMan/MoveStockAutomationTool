<p align="center">
  <img width="1000" height="200" alt="ヘッダー" src="https://github.com/user-attachments/assets/9bdde7d9-b90b-4827-a809-b7a32fb211fb" />
</p>

<h1 align="center">
  在庫管理システム用 店間移動入力自動化ツール (MoveStockAutomationTool)
</h1>
<p align="center">
  ブラウザ上で動作する社外製の在庫管理システムにおいて、定期的な固定品目の店間移動入力を自動化するためのツール。
</p>
<br/>

# :globe_with_meridians:概要

## 使用言語
- JavaScript (Chrome拡張機能)

## 開発背景
　弊社では全店で、卸売業者が提供しているブラウザ上の在庫管理システムを導入している。また一部の製薬メーカーの薬品については、状況に応じて最小限の量を各店舗に割り振れるよう、一店舗に一旦集約し、そこからその都度、他店舗へ振り替える流れになっている。

　集約店の店長より、「店舗間移動の際に在庫管理システムに移動品の入力・登録を行うのだが、その作業に時間がとられるために他の業務がままならない。この作業を自動化できないか」との提案があり、本ツールの開発を行った。

## 開発概要
>[!NOTE]
>本アプリケーションの実行環境である在庫管理用PCは、セキュリティが厳しく設定され、外部との通信が著しく制限されていることから、できるだけ素のJavaScriptで記述する形とした。

　入力すべき医薬品は、数こそ多いものの基本的に固定された品目であるため、 **事前にリスト化** しておくことで入力を自動化できそうなことに着目した。また、在庫管理システムがWEBブラウザ上で動作しているため、Chrome拡張機能との相性がいいと考え、ワンボタンで処理が実行されるよう工夫した。

　事前にjsファイル内に薬品リストを作成し、実行時に読み出し。JavaScriptによるDOM操作とページ遷移のイベント検知で、読み出した内容の入力・登録作業を自動化している。また、オプション画面を実装し、画面遷移時のウェイトタイムなどを設定できるようにすることで、 **PCや回線スペックによる差を吸収** できるように配慮した。

## 実績
　本ツールは最初のバージョンの作成後、当該店舗とやり取りをしながら、エラーの解消、DOM解析をシンプルにすることによるレスポンスの改善などを重ねた。現在では、 **約2年間** 当該店舗で利用されており、エラーもなく動作している。

### 【改善効果】
>[!IMPORTANT]
>当該店舗への聞き取りによる推測によるところが大きい。
- 店舗間移動品登録業務 **ぶっ続けで30分～40分**  
(当該店舗はスタッフ数が非常に少なく、受付・調剤業務の傍らでやらなくてはならないため、実際はもう少し時間がかかる)

店間移動品の登録業務にかかる時間
| 導入前 | 導入後 |
| :---: | :---: |
| 30分 ～ 40分 | 5分程度 |

**30分程度の削減** に成功。  
加えて、事前に用意したリストの通りに入力されるため、 **品目の入力ミスや漏れがなくなった** ことも特筆すべき点。

<br/><br/>

# :page_with_curl:マニュアル

## オプション画面の動作イメージ
<img width="1080" height="581" alt="オプション画面動作イメージ" src="https://github.com/user-attachments/assets/91e672ce-c75e-404e-b5b7-3877c2600de3" />

## 確認済み動作環境
- Windows 10/11

## インストール方法
1. 本リポジトリをZIP形式でダウンロード。任意の場所に解凍してください。
2. Chromeブラウザの拡張機能画面を開きます。
3. 右上のデベロッパーモードの切り替えをONに変更。
4. パッケージ化されていない拡張機能を読み込むを押して、解凍した本ツールのフォルダを指定。
5. 任意で拡張機能アイコンをピン止めしてください。

## 使用方法
>[!TIP]
>事前に自動入力したい品目と個数をstock_list.js内にリスト化してください。
1. 店間移動品入力画面でChromeブラウザの拡張機能欄のボタンをクリック。
2. 自動で登録済みの品目と個数が入力されます。
3. アイコンを右クリックして表示されるメニューからオプション画面を表示可能。
<br/>

オプションでは、以下の項目が設定可能。
- 画面遷移時に次の画面が表示されたことを検知するまでの待機時間
- 画面遷移時に次の画面を検知できなかった場合のリトライ回数

<br/><br/>

# :hammer_and_wrench:技術文書

## ソース構成
background.js  
(拡張機能のサービスワーカー上で動くコード)

content_script.js  
(開いているページ上で動くコード)

option.html  
option.css  
option.js
(オプション画面の構成とオプションの読み込み/保存)

manifest.json
(拡張機能の設定)

## 技術的ハイライト
1. 非同期処理をawaitで待って設定値を確実に読み込み。
```JavaScript
  const settings = await chrome.storage.sync.get(["waitTimeMsec", "retryCount"]);
  if (isNotAssinedValue(settings.waitTimeMsec)) settings.waitTimeMsec = 300;
  if (isNotAssinedValue(settings.retryCount)) settings.retryCount = 10;
```
<br/>

2. 在庫管理システム側の実装に合わせて、 **input要素を直接click()で叩く処理** と **dispatchEvent()によって強制的にclickイベントを発火させる処理** を使い分け。
```JavaScript
  document.querySelector("input.ComHnmSearchBtn").click();
  ～
  document.querySelector("a#selectbtn").dispatchEvent(new Event("click"));
```
<br/>

3. 配列をクエリによるフィルタリングで簡潔に処理。
```JavaScript
  const targetList = Array.from(targetNodes).map(node => node.innerText);
```
<br/>

4. 非同期処理用に **スリープ関数とリトライ関数を自作** 。
```JavaScript
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
```

## ライセンス
本ツールは MIT License の元で公開されています。
