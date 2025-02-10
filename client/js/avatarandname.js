let tempName = "";
let tempAvatar = "";

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    syncProfileData();
    initEventListeners();
});

function syncProfileData() {
    const accountName = document.querySelector('#account-panel .account-name').textContent;
    const avatarSrc = document.querySelector('#account-panel .avatar').src;
    
    document.getElementById('account-name').textContent = accountName;
    document.getElementById('avatar').src = avatarSrc;
}

function initEventListeners() {
    // Режим редактирования
    document.getElementById('edit-button').addEventListener('click', () => {
        enterEditMode();
    });
// Выбор файла
document.getElementById('avatar-upload').addEventListener('change', handleFileSelect);

// Сохранение
document.getElementById('save-button').addEventListener('click', async (e) => {
    e.preventDefault();
    await handleSave();
});

// Отмена
document.getElementById('cancel-button').addEventListener('click', resetUI);
}

function enterEditMode() {
tempName = document.getElementById('account-name').textContent;
tempAvatar = document.getElementById('avatar').src;

// Показываем элементы редактирования
document.getElementById('edit-name').value = tempName;
toggleElements(true);

// Активируем выбор файла только в режиме редактирования
document.getElementById('avatar').addEventListener('click', handleAvatarClick);
}

function exitEditMode() {
toggleElements(false);
document.getElementById('avatar').removeEventListener('click', handleAvatarClick);
}

function toggleElements(editMode) {
document.getElementById('edit-name').style.display = editMode ? 'inline' : 'none';
document.getElementById('account-name').style.display = editMode ? 'none' : 'inline';
document.getElementById('edit-button').style.display = editMode ? 'none' : 'inline';
document.getElementById('save-button').style.display = editMode ? 'inline' : 'none';
document.getElementById('cancel-button').style.display = editMode ? 'inline' : 'none';
document.getElementById('name-error').style.display = 'none';
}

async function handleSave() {
const newName = document.getElementById('edit-name').value.trim();
const fileInput = document.getElementById('avatar-upload');

try {
    // Валидация имени
    if (await validateName(newName) === false) return;

    // Подготовка данных
    const formData = new FormData();
    if (fileInput.files[0]) formData.append('avatar', fileInput.files[0]);
    if (newName !== tempName) formData.append('name', newName);
    formData.append('login_key', localStorage.getItem('game_login_key'));

    // Отправка
    const response = await fetch('api.php', {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    
    if (data.success) {
        updateProfileData(data);
        exitEditMode();
    } else {
        showError(data.error || "Ошибка обновления");
    }
} catch (error) {
    console.error('Ошибка:', error);
    showError("Сетевая ошибка");
}
}

async function validateName(name) {
if (name === tempName) return true;

// Проверка запрещенных слов (пример)
const forbiddenWords = ['admin', 'root'];
if (forbiddenWords.some(word => name.toLowerCase().includes(word))) {
    showError("Имя содержит запрещенные слова!");
    return false;
}
return true;
}

function handleAvatarClick() {
document.getElementById('avatar-upload').click();
}

function handleFileSelect(e) {
const file = e.target.files[0];
if (!file) return;

if (!validateFileType(file)) {
    showError("Неверный формат файла! Допустимые: .png, .jpg, .gif");
    return;
}

previewAvatar(file);
}

function validateFileType(file) {
return ['image/png', 'image/jpeg', 'image/gif'].includes(file.type);
}

function previewAvatar(file) {
const reader = new FileReader();
reader.onload = (e) => {
    document.getElementById('avatar').src = e.target.result;
};
reader.readAsDataURL(file);
}

function updateProfileData(data) {
if (data.name) {
    document.querySelectorAll('.account-name').forEach(el => {
        el.textContent = data.name;
    });
}
if (data.newAvatarUrl) {
    document.querySelectorAll('.avatar').forEach(el => {
        el.src = data.newAvatarUrl;
    });
}
}

function showError(message) {
const errorElement = document.getElementById('name-error');
errorElement.textContent = message;
errorElement.style.display = 'block';
}

function resetUI() {
    document.getElementById('avatar').src = tempAvatar;
    document.getElementById('edit-name').value = tempName;
    exitEditMode();
    syncProfileData();
}