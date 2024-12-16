const API_URL = "http://127.0.0.1:8000/courses/results";
const ADD_FAVORITE_URL = "http://127.0.0.1:8000/favorites/add";
const FAVORITES_DETAILS_URL = "http://127.0.0.1:8000/favorites/details"; // 檢查已收藏的資料

document.addEventListener('DOMContentLoaded', async () => {
    // 使用全域變數 window.currentStudentId （由 buttoncontroller.js 設定）
    console.log("Logged in user studentId:", window.currentStudentId);

    initializeSearchButton();
    const params = getQueryParams();
    if (params.department || params.instructor || params.keyword) {
        fillForm(params);
        fetchSearchResults(params);
    }
});

function initializeSearchButton() {
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', searchCourses);
    }
}

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        department: params.get('department'),
        instructor: params.get('instructor'),
        keyword: params.get('keyword')
    };
}

function searchCourses() {
    const department = document.getElementById('department').value;
    const instructor = document.getElementById('instructor').value;
    const keyword = document.getElementById('keyword').value;

    if (department === '選擇系所') {
        alert('請選擇系所');
        return window.location.href = 'courses.html';
    } else {
        const params = { department: department, instructor: instructor, keyword: keyword };
        fetchSearchResults(params);
    }
}

function fillForm(params) {
    document.getElementById('department').value = params.department || '選擇系所';
    document.getElementById('instructor').value = params.instructor || '';
    document.getElementById('keyword').value = params.keyword || '';
}

function fetchSearchResults(params) {
    fetch(`${API_URL}?department=${params.department}&instructor=${params.instructor}&keyword=${params.keyword}`)
        .then(response => response.json())
        .then(data => {
            console.log('Received Data:', data); 
            const courseListBody = document.getElementById('courseListBody');
            const noResultElem = document.getElementById('noneresult');
            const courseListSection = document.getElementById('courseList');

            if (!data || data.length === 0 || data.every(item => Object.values(item).every(value => value === null))) {
                // 無結果時顯示訊息並隱藏表格
                courseListBody.innerHTML = '';
                noResultElem.style.display = 'block';
                courseListSection.style.display = 'none';
                return;
            }

            // 有結果時，隱藏無結果訊息，顯示表格
            noResultElem.style.display = 'none';
            courseListSection.style.display = 'block';
            showSearchResults(data);
        })
        .catch(error => {
            console.error('Error fetching search results:', error);
            // 失敗時同樣顯示無結果訊息
            document.getElementById('noneresult').style.display = 'block';
            document.getElementById('courseList').style.display = 'none';
        });
}

function showSearchResults(results) {
    const courseListBody = document.getElementById('courseListBody');
    courseListBody.innerHTML = '';
    results.forEach(result => {
        const row = document.createElement('tr');
        const professors = result.professors.join(', ');

        row.innerHTML = `
            <td>${result.department_name}</td>
            <td>${result.course_id}</td>
            <td>${result.course_name}</td>
            <td>${professors}</td>
            <td>${result.count}</td>
            <td>
                <button class="btn" onclick="viewComments('${result.course_name}')">查看評論</button>
                <button class="btn add-favorite-btn" 
                        data-course-id="${result.course_id}" 
                        data-course-name="${result.course_name}">
                    加入收藏
                </button>
            </td>
        `;
        courseListBody.appendChild(row);
    });

    // 綁定「加入收藏」按鈕事件
    const favoriteButtons = document.querySelectorAll('.add-favorite-btn');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            console.log("Add favorite clicked, currentStudentId:", window.currentStudentId);
            if (!window.currentStudentId) {
                alert("您尚未登入，請先登入！");
                return;
            }

            const courseId = e.target.getAttribute('data-course-id');
            const courseName = e.target.getAttribute('data-course-name');

            // 檢查收藏是否已存在
            try {
                const favoritesResp = await fetch(FAVORITES_DETAILS_URL, { credentials: "include" });
                if (!favoritesResp.ok) {
                    throw new Error(`Failed to fetch favorites: ${favoritesResp.statusText}`);
                }
                const favoritesData = await favoritesResp.json();

                // 檢查該 user_id 與 course_id 是否已存在
                const exists = favoritesData.some(fav => fav.user_id === window.currentStudentId && fav.course_id === courseId);
                if (exists) {
                    alert(`「${courseName}」已存在收藏清單中！`);
                    return; // 不執行新增
                }

                // 若不存在，呼叫 /favorites/add 新增收藏
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
    });
}

function viewComments(courseName) {
    window.location.href = `newCommentv2.html?course_name=${encodeURIComponent(courseName)}`;
}
