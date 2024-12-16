window.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:8000/api/profile', {
        credentials: "include",
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('accountType').innerText = data.accountType;
            document.getElementById('nickname').value = data.nickname;
            document.getElementById('chineseName').innerText = data.chineseName;
            document.getElementById('englishName').innerText = data.englishName;
            document.getElementById('gender').innerText = data.gender;
            document.getElementById('birthday').innerText = data.birthday;
            document.getElementById('studentId').innerText = data.studentId;
            document.getElementById('email').value = data.email;
        })
        .catch(error => console.error('Error fetching profile:', error));
});