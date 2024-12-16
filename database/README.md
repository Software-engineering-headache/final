# 如何開始

首先，記得開個虛擬環境，並進入虛擬環境(venv)再run
（可能要用python3.13，不然有些東西會不合）

然後要intsall一堆東西，如下：
pip install fastapi uvicorn sqlalchemy pymysql

載完之後再來run程式（直接用vscode按run就可以跑了）

基本上會長這樣：
<img width="1076" alt="截圖 2024-11-27 下午11 53 03" src="https://github.com/user-attachments/assets/5553acdc-0209-4967-a216-0aa9c7045479">

點擊這個連結（或自己在瀏覽器打這個連結）：
http://127.0.0.1:8000 

這樣就會出現網頁了，如下：
<img width="1440" alt="截圖 2024-11-27 下午11 55 13" src="https://github.com/user-attachments/assets/a9047ccb-1072-4351-8133-d7c321842639">

或是你可以用這個連結來看有哪些method（對，我隨便寫了幾個試試看）：
http://127.0.0.1:8000/docs

會出現這樣的畫面：
<img width="1440" alt="截圖 2024-11-27 下午11 56 07" src="https://github.com/user-attachments/assets/f444ad07-af8e-4ccd-932a-bfc4477f7966">

##注意：需要改models.py（就是要修改資料庫的table內容）要跟我說一下，因為有點麻煩

參考教學影片：https://www.youtube.com/watch?v=zzOwU41UjTM

# 如果你想看有哪些table
* 使用 MySQL Workbench：打開 MySQL Workbench。
*  如果尚未安裝，請下載並安裝 MySQL Workbench.
*  建立新的連接：
  * 點擊主頁上的 "Setup New Connection"。
    * Connection Name：輸入一個名稱（例如 AWS RDS）。
    * Connection Method：選擇 Standard (TCP/IP)。
    * Hostname：輸入 AWS 提供的 RDS Endpoint（用這個：ncu-comment-database.cl8kosu00ogx.ap-southeast-2.rds.amazonaws.com）。
    * Port：輸入 3306。
    * Username：輸入你在 AWS RDS 上設定的使用者名稱（用： admin）。
* 測試連接：
  * 點擊 "Test Connection"。
  * 系統會提示你輸入密碼，輸入 AWS RDS 的使用者密碼（用： 12345678）。
  * 如果成功，你會看到 "Successfully made the MySQL connection"。
* 連接到資料庫：
  * 點擊 "OK" 完成設定，然後選擇剛剛建立的連接，點擊 "Connect"。
* 檢查資料庫：
  * 連接後，在左側面板找到 Schemas，展開可用的資料庫。
  * 然後你可以看到目前的所有table
  * 應該會像這樣：
<img width="919" alt="截圖 2024-11-28 上午12 12 41" src="https://github.com/user-attachments/assets/4d75ded7-4c27-4ac8-bb11-447e890dc047">
