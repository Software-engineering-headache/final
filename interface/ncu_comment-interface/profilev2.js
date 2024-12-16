// 定義 API URL
const API_URL = "http://127.0.0.1:8000/api/profile";

// DOM 元素
// const dataContainer = document.getElementById("dataContainer");

// 定義函數來抓取資料
async function fetchData() {
    try {
        // 顯示載入中提示
        // dataContainer.innerHTML = `<p style="color: blue;">Loading data, please wait...</p>`;

        // 發送 API 請求
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        // 解析返回的 JSON 數據
        const data = await response.json();

        // 清空容器
        // dataContainer.innerHTML = "";

        // 如果沒有數據，顯示提示
        // if (data.length === 0) {
        //     dataContainer.innerHTML = `<p style="color: gray;">No favorite courses found.</p>`;
        //     return;
        // }
        document.getElementById('accountType').value = data.accountType || '';
        document.getElementById('chineseName').value = data.chineseName || '';
        document.getElementById('englishName').value = data.englishName || '';
        document.getElementById('gender').value = data.gender || '';
        document.getElementById('birthday').value = data.birthday || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('studentId').value = data.studentId || '';
        // // 建立表格結構
        // const table = document.createElement("table");
        // table.style.width = "100%";
        // table.style.borderCollapse = "collapse";
        // table.style.marginTop = "20px";
        // table.innerHTML = `
        //     <thead>
        //         <tr style="background-color: #d2e8f2;"> <!-- 淺藍色背景 -->
        //             <th style="border: 1px solid #ddd; padding: 8px;">姓名</th>
        //             <th style="border: 1px solid #ddd; padding: 8px;">課程代碼</th>
        //             <th style="border: 1px solid #ddd; padding: 8px;">課程名稱</th>
        //             <th style="border: 1px solid #ddd; padding: 8px;">學分數</th>
        //             <th style="border: 1px solid #ddd; padding: 8px;">操作</th>
        //         </tr>
        //     </thead>
        //     <tbody>
        //     </tbody>
        // `;

        // const tbody = table.querySelector("tbody");

        // 將數據動態插入表格
        // data.forEach((item, index) => {
        //     const row = document.createElement("tr");
        //     row.style.backgroundColor = index % 2 === 0 ? "#f9f9f9" : "#ffffff"; // 淺灰與白色交替
        //     row.innerHTML = `
        //         <td style="border: 1px solid #ddd; padding: 8px;">${item.user_name}</td>
        //         <td style="border: 1px solid #ddd; padding: 8px;">${item.course_id}</td>
        //         <td style="border: 1px solid #ddd; padding: 8px;">${item.course_name}</td>
        //         <td style="border: 1px solid #ddd; padding: 8px;">${item.course_info}</td>
        //         <td style="border: 1px solid #ddd; padding: 8px;">
        //             <button class="btn" style="margin-right: 5px;" onclick="viewComment('${item.course_id}')">查看評論</button>
        //             <button class="btn" style="background-color: #ff6666;" onclick="removeFromFavorites('${item.favorite_id}')">取消收藏</button>
        //         </td>
        //     `;
        //     tbody.appendChild(row);
        // });

        // 將表格插入到容器中
        // dataContainer.appendChild(table);
    } catch (error) {
        console.error("Fetch Error:", error);
        dataContainer.innerHTML = `<p style="color: red;">Failed to fetch data. Please check the API and try again.</p>`;
    }
}

// 查看評論功能
function viewComment(courseId) {
    alert(`查看課程 ${courseId} 的評論`);
    // 可以跳轉到評論頁面或顯示評論
}

// 取消收藏功能
function removeFromFavorites(favoriteId) {
    alert(`已將收藏 ID ${favoriteId} 從收藏中移除`);
    // 可以調用後端 API 執行取消收藏操作
}

// 當頁面載入時自動執行抓取資料函數
window.addEventListener("load", fetchData);