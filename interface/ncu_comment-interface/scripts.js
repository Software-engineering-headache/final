// 目前還在測試中，因為資料到介面就不見了，但是API是有丟資料的
API_URL1 = "http://127.0.0.1:8000/courses/info";
API_URL2 = "http://127.0.0.1:8000/courses/comments";
API_URL3 = "http://localhost:8000/api/profile";
const ADD_FAVORITE_URL = "http://127.0.0.1:8000/favorites/add";
const FAVORITES_DETAILS_URL = "http://127.0.0.1:8000/favorites/details";
const LOGS_API_URL = "http://127.0.0.1:8000/settings/logs";

let currentStudentId = null;
let course_id = null
let charCountLimit = 1500; // 預設評論字數限制

// Fetch the latest char_count from system settings logs
async function fetchCharCountLimit() {
    try {
        const response = await fetch(LOGS_API_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch system settings logs: ${response.statusText}`);
        }
        const logs = await response.json();

        if (logs.length > 0) {
            charCountLimit = logs[0].char_count; // Use the latest char_count value
            console.log(`Character count limit fetched: ${charCountLimit}`);
        }
    } catch (error) {
        console.error("Error fetching char_count limit:", error);
    }
}

// 當頁面載入完成後，從 URL 取得課程名稱，並呼叫 fetchComments 函式
window.addEventListener("DOMContentLoaded", async () => {
    console.log("DOMContentLoaded...");
    await fetchCharCountLimit(); // 取得評論字數限制

    const isLoggedIn = await checkLoginStatus();
    console.log("使用者已登入:", isLoggedIn, " currentStudentId:", currentStudentId);

    // 動態更新 HTML 顯示的字數限制
    document.getElementById("char-limit-label").textContent = charCountLimit;
    document.getElementById("char-limit-warning").textContent = charCountLimit;

    const params = new URLSearchParams(window.location.search);
    const courseName = params.get("course_name");
    console.log("Course_name get!");

    if (courseName) {
        try {
            await fetchCourseInfo(courseName);
            await fetchComments(courseName);
            // 初始化收藏按鈕
            initializeFavoriteButton(course_id, courseName);
        } catch (error) {
            console.error("Error fetching course data:", error);
        }
    }
});

async function checkLoginStatus() {
    console.log("checkLoginStatus start...");
    const memberButton = document.querySelector('.dropdown-button-member');
    const adminButton = document.querySelector('.dropdown-button-admin');

    memberButton.style.display = 'none';
    adminButton.style.display = 'none';

    try {
        const profileResponse = await fetch(API_URL3, {
            credentials: "include",
        });
        console.log('hi2');

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
        return currentStudentId !== null;  // 回傳是否登入

    } catch (error) {
        console.error('檢查登入狀態失敗：', error);
        currentStudentId = null;
        return false;
    }
}

// 初始化收藏按鈕
function initializeFavoriteButton(courseId, courseName) {
    const favoriteButton = document.querySelector('.add-favorite-btn');
    if (!favoriteButton) return;

    favoriteButton.setAttribute('data-course-id', courseId);
    favoriteButton.setAttribute('data-course-name', courseName);

    favoriteButton.addEventListener('click', async (e) => {
        if (!window.currentStudentId) {
            alert("您尚未登入，請先登入後才可收藏按鈕！");
            return;
        }

        const courseId = e.target.getAttribute('data-course-id');
        const courseName = e.target.getAttribute('data-course-name');

        try {
            const favoritesResp = await fetch(FAVORITES_DETAILS_URL, { credentials: "include" });
            if (!favoritesResp.ok) {
                throw new Error(`Failed to fetch favorites: ${favoritesResp.statusText}`);
            }
            const favoritesData = await favoritesResp.json();

            const exists = favoritesData.some(fav => fav.user_id === window.currentStudentId && fav.course_id === courseId);
            if (exists) {
                alert(`「${courseName}」已存在收藏清單中！`);
                return;
            }

            const response = await fetch(ADD_FAVORITE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: window.currentStudentId, course_id: courseId })
            });

            if (!response.ok) {
                throw new Error(`Failed to add favorite: ${response.statusText}`);
            }

            await response.json();
            alert(`成功將「${courseName}」加入收藏！`);
        } catch (error) {
            console.error('Error adding to favorites:', error);
            alert('加入收藏時發生錯誤，請稍後再試。');
        }
    });
}


async function fetchCourseInfo(courseName) {
    try {
        const response = await fetch(`${API_URL1}?course_name=${encodeURIComponent(courseName)}`);
        if (!response.ok) throw new Error(`Failed to fetch course info: ${response.statusText}`);
        
        const data = await response.json();
        renderCourseInfo(courseName, data[0]); // 假設 API 返回的是列表，取第一個結果
        //console.log(data[0]);
    } catch (error) {
        console.error("Error fetching course info:", error);
    }
}

function renderCourseInfo(course_name, courseInfo) {
    const courseDetailTable = document.querySelector(".course-detail table");
    console.log(courseInfo);
    course_id = courseInfo.course_id;
    if (courseInfo) {
        document.querySelector("#course-name").textContent = course_name || "未提供";
        document.querySelector("#professor-name").textContent = courseInfo.professor_name.join(", ") || "未提供";
        document.querySelector("#department-name").textContent = courseInfo.department_name || "未提供";
        document.querySelector("#course-info").textContent = courseInfo.course_info ? String(courseInfo.course_info): "未提供" ;
        document.querySelector("#course-year").textContent = courseInfo.course_year ? String(courseInfo.course_year): "未提供" ; // 假設固定值，可替換為動態數據
    } else {
        // 如果沒有資料，設置為默認提示
        document.querySelector("#course-name").textContent = "無相關課程資訊";
        document.querySelector("#professor-name").textContent = "無相關資訊";
        document.querySelector("#department-name").textContent = "無相關資訊";
        document.querySelector("#course-info").textContent = "無相關資訊";
        document.querySelector("#course-year").textContent = "無相關資訊";
    }
}

let originalComments = []; // 原始評論列表儲存

async function fetchComments(courseName) {
    try {
        const response = await fetch(`${API_URL2}?course_name=${encodeURIComponent(courseName)}`);
        if (!response.ok) throw new Error(`Failed to fetch comments: ${response.statusText}`);
        
        const data = await response.json();
        originalComments = data; // 保存原始評論
        renderComments(data);
    } catch (error) {
        console.error("Error fetching comments:", error);
    }
}

function renderComments(comments, sortOrder = "default") {
    const commentList = document.getElementById("comment-list");
    commentList.innerHTML = ""; // 清空評論列表

    if (comments.length === 0) {
        commentList.innerHTML = "<p>目前無評論。</p>";
        return;
    }
    // 如果需要排序，進行排序
    let sortedComments = [...comments];
    if (sortOrder === "asc") {
        sortedComments.sort((a, b) => a.course_score - b.course_score); // 由小到大
        console.log("asc");
    } else if (sortOrder === "desc") {
        sortedComments.sort((a, b) => b.course_score - a.course_score); // 由大到小
        console.log("desc");
    }

    sortedComments.forEach((comment) => {
        const commentItem = document.createElement("div");
        commentItem.className = "comment-item";
        commentItem.innerHTML = `
            <p><strong>${comment.nickname}</strong> <span class="rating">${"★".repeat(comment.course_score)}</span></p>
            <p>${comment.course_content}</p>
            <p class="meta">受評教授：${comment.professor_name.join(", ")} | 日期：${comment.time}</p>
        `;
        commentList.appendChild(commentItem);
        console.log("resort");
    });
}

// 評論排序按鈕觸發
document.getElementById("sort-options").addEventListener("change", function (event) {
    const sortOrder = event.target.value; // 獲取選擇的排序方式
    renderComments(originalComments, sortOrder); // 按選擇的排序方式重新渲染評論
});


//------------------------------------------------------這裡是新增評論的部分--------------------------------------------------------------------

// 判斷登入狀態（模擬）
//const isLoggedIn = true; // 設為 true 代表已登入 false

// 開啟與關閉評論視窗
document.getElementById("review-button").addEventListener("click", function() {
    if (currentStudentId) {
        openModal();
    } else {
        alert("您尚未登入，請先登入後才可新增評論！");
        //swindow.location.href = "login.html"; // 跳轉登入頁面
    }
});

function openModal() {
    // 從 course-detail 填充資料
    document.getElementById("modal-course-name").textContent = document.getElementById("course-name").textContent;
    document.getElementById("modal-professor-name").textContent = document.getElementById("professor-name").textContent;
    document.getElementById("modal-department-name").textContent = document.getElementById("department-name").textContent;
    document.getElementById("modal-course-info").textContent = document.getElementById("course-info").textContent;
    document.getElementById("modal-course-year").textContent = document.getElementById("course-year").textContent;
    

    const textarea = document.getElementById("comment-text");
    const charLimitLabel = document.querySelector("label[for='comment-text']");

    // Update maxLength and label dynamically
    textarea.setAttribute("maxlength", charCountLimit);
    charLimitLabel.textContent = `請輸入評論（上限${charCountLimit}字）`;

    // 顯示彈出視窗
    document.getElementById("review-modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("review-modal").style.display = "none";
}

//當輸入超過1500字時
document.getElementById("comment-text").addEventListener("input", function () {
    if (this.value.length > charCountLimit) {
        document.getElementById("alert-modal").style.display = "flex";
    }
});

// 關閉字數超過警告視窗
function closeAlert() {
    document.getElementById("alert-modal").style.display = "none";
}

// 選擇評分星級
function setRating(stars) {
    const starElements = document.querySelectorAll("#rating .star");
    starElements.forEach((star, index) => {
        if (index < stars) {
            star.classList.add("selected");
        } else {
            star.classList.remove("selected");
        }
    });
    document.getElementById("rating").dataset.score = stars; // 儲存評分
}

// 送出評論
async function submitReview() {
    const commentText = document.getElementById("comment-text").value;
    const score = document.getElementById("rating").dataset.score || 0;

    // 檢查字數
    if (commentText.length > 1500) {
        document.getElementById("alert-modal").style.display = "flex"; // 顯示字數超過警告
        return;
    }

    // 檢查評分是否選擇
    if (score === 0) {
        alert("請為課程評分！");
        return;
    }

    // 準備提交的資料
    const reviewData = {
        score: score,
        content: commentText,
        course_id: course_id,
        user_id: currentStudentId, // 模擬用戶 ID，應替換為後端取得的用戶 ID
    };

    try {
        const response = await fetch("http://127.0.0.1:8000/api/write_back_comment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reviewData),
        });

        if (response.ok) {
            alert("評論提交成功！");
            closeModal(); // 關閉彈窗
            location.reload(); // 刷新頁面顯示更新評論
        } else {
            throw new Error("提交失敗！");
        }
    } catch (error) {
        console.error("提交錯誤：", error);
        alert("提交失敗，請稍後再試！");
    }

    //if (commentText.length > 1500) {
        //document.getElementById("alert-modal").style.display = "flex";
    //} 
    //else {
        // 提交評論的邏輯可放在這裡（如使用 AJAX 提交到後端）
        //closeModal();
    //}
}

// 關閉警告視窗
function closeAlert() {
    document.getElementById("alert-modal").style.display = "none";
}
