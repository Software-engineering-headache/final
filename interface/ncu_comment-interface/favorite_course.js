// 定義 API URL
const API_URL = "http://127.0.0.1:8000/favorites/details";
const PROFILE_URL = "http://localhost:8000/api/profile";
const REMOVE_FAVORITE_URL = "http://127.0.0.1:8000/favorites/remove"; // 新增刪除收藏的API路由

// DOM 元素
const dataContainer = document.getElementById("dataContainer");

// 全域變數儲存當前使用者的學號
let currentStudentId = null;

// 使用 async/await 重構 checkLoginStatus 函式
async function checkLoginStatus() {
    console.log("checkLoginStatus start...");
    const memberButton = document.querySelector('.dropdown-button-member');
    const adminButton = document.querySelector('.dropdown-button-admin');

    memberButton.style.display = 'none';
    adminButton.style.display = 'none';

    try {
        const profileResponse = await fetch(PROFILE_URL, {
            credentials: "include",
        });

        if (!profileResponse.ok) {
            throw new Error(`HTTP error! Status: ${profileResponse.status}`);
        }

        const profileData = await profileResponse.json();
        console.log('Profile Data:', profileData);

        let showMember = false;
        let showAdmin = false;

        if (profileData.studentId && profileData.accountType) {
            showMember = true;
            currentStudentId = profileData.studentId; 
            console.log("取得登入使用者學號:", currentStudentId);
            if (profileData.accountType === 'ADMIN') {
                showAdmin = true;
            }
        }

        memberButton.style.display = showMember ? 'inline-block' : 'none';
        adminButton.style.display = showAdmin ? 'inline-block' : 'none';

        console.log("checkLoginStatus completed, currentStudentId:", currentStudentId);
        return currentStudentId !== null;

    } catch (error) {
        console.error('檢查登入狀態失敗：', error);
        currentStudentId = null;
        return false;
    }
}

// 抓取收藏課程資料
async function fetchData() {
    console.log("fetchData start... currentStudentId:", currentStudentId);

    try {
        dataContainer.innerHTML = `<p style="color: blue; margin-left: 40px;">Loading data, please wait...</p>`;

        if (!currentStudentId) {
            console.log("未取得 currentStudentId，顯示未登入訊息");
            dataContainer.innerHTML = `<p style="color: blue;margin-left: 40px;">您尚未登入，請先登入後查看收藏課程。</p>`;
            return;
        }

        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("取得收藏課程資料:", data);

        const filteredData = data.filter(item => item.user_id === currentStudentId);
        console.log("filteredData:", filteredData);

        dataContainer.innerHTML = "";

        if (filteredData.length === 0) {
            dataContainer.innerHTML = `<p style="color: blue;margin-left: 40px;">尚未將課程加入收藏！</p>`;
            return;
        }

        const table = document.createElement("table");
        table.style.width = "95%";
        table.style.margin = "20px auto";
        table.style.borderCollapse = "collapse";
        table.innerHTML = `
            <thead>
                <tr style="background-color: #d2e8f2;">
                    <th style="border: 1px solid #ddd; padding: 8px;">課程代碼</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">課程名稱</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">學分數</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">操作</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");

        filteredData.forEach((item, index) => {
            const row = document.createElement("tr");
            row.style.backgroundColor = index % 2 === 0 ? "#f9f9f9" : "#ffffff";
            row.innerHTML = `
                <td style="border: 1px solid #ddd; padding: 8px;">${item.course_id}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.course_name}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.course_info}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">
                    <button class="btn" style="margin-left: 10px; margin-right: 10px;" onclick="viewComments('${item.course_name}')">查看評論</button>
                    <button class="btn remove-favorite-btn" style="background-color: #ff6666;"
                        data-favorite-id="${item.favorite_id}"
                        data-course-id="${item.course_id}"
                        data-course-name="${item.course_name}"
                    >取消收藏</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        dataContainer.appendChild(table);

        // 綁定「取消收藏」按鈕事件
        const removeButtons = document.querySelectorAll('.remove-favorite-btn');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const favoriteId = e.target.getAttribute('data-favorite-id');
                const courseId = e.target.getAttribute('data-course-id');
                const courseName = e.target.getAttribute('data-course-name');

                // 新增確認對話框
                const confirmDelete = confirm(`是否確認將「${courseName}」從收藏清單中移除？`);
                if (!confirmDelete) {
                    return; // 使用者選擇取消，不執行後續動作
                }

                await removeFromFavorites(favoriteId, courseId, courseName);
            });
        });

        console.log("fetchData completed.");
    } catch (error) {
        console.error("Fetch Error:", error);
        dataContainer.innerHTML = `<p style="color: red;margin-left: 40px;">Failed to fetch data. Please check the API and try again.</p>`;
    }
}

function viewComments(courseName) {
    window.location.href = `newCommentv2.html?course_name=${encodeURIComponent(courseName)}`;
}



async function removeFromFavorites(favoriteId, courseId, courseName) {
    if (!currentStudentId) {
        alert("您尚未登入，請先登入！");
        return;
    }

    try {
        const response = await fetch(REMOVE_FAVORITE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentStudentId, course_id: courseId })
        });

        if (!response.ok) {
            throw new Error(`Failed to remove favorite: ${response.statusText}`);
        }

        await response.json();
        alert(`「${courseName}」已從收藏清單中移除！`);

        // 刪除成功後重新載入收藏列表
        await fetchData();

    } catch (error) {
        console.error('Error removing favorite:', error);
        alert('取消收藏時發生錯誤，請稍後再試。');
    }
}

// DOM 載入後先檢查登入，再決定是否抓取收藏資料
window.addEventListener("DOMContentLoaded", async () => {
    console.log("DOMContentLoaded...");
    const isLoggedIn = await checkLoginStatus();
    console.log("使用者已登入:", isLoggedIn, " currentStudentId:", currentStudentId);

    if (isLoggedIn) {
        console.log("使用者已登入，呼叫 fetchData...");
        await fetchData();
    } else {
        console.log("使用者未登入，不呼叫 fetchData，只顯示提示訊息");
        dataContainer.innerHTML = `<p style="color: gray;">您尚未登入，請先登入後查看收藏課程。</p>`;
    }
});
