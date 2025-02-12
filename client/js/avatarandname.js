let tempName = "";
let tempAvatar = "";
let tempDescription = "";

document.addEventListener('DOMContentLoaded', () => {
    syncProfileData();
    initEventListeners();
});

function syncProfileData() {
    const accountName = document.querySelector('#account-panel .account-name').textContent;
    const avatarSrc = document.querySelector('#account-panel .avatar').src;

    document.getElementById('account-name').textContent = accountName;
    document.getElementById('avatar').src = avatarSrc + '?t=' + Date.now(); // Добавляем timestamp для кеша
}

function initEventListeners() {
    document.getElementById('edit-button').addEventListener('click', enterEditMode);
    document.getElementById('avatar-upload').addEventListener('change', handleFileSelect);
    document.getElementById('save-button').addEventListener('click', async (e) => {
        e.preventDefault();
        await handleSave();
    });
    document.getElementById('cancel-button').addEventListener('click', resetUI);
}

function toggleElements(editMode) {
    document.getElementById('edit-name').style.display = editMode ? 'inline' : 'none';
    document.getElementById('edit-description').style.display = editMode ? 'inline' : 'none';
    document.getElementById('account-name').style.display = editMode ? 'none' : 'inline';
    document.getElementById('description').style.display = editMode ? 'none' : 'flex';
    document.getElementById('edit-button').style.display = editMode ? 'none' : 'inline';
    document.getElementById('save-button').style.display = editMode ? 'inline' : 'none';
    document.getElementById('cancel-button').style.display = editMode ? 'inline' : 'none';
    document.getElementById('name-error').style.display = 'none';
}

function enterEditMode() {
    tempName = document.getElementById('account-name').textContent;
    tempDescription = document.getElementById('account-name').textContent;
    tempAvatar = document.getElementById('avatar').src;

    document.getElementById('edit-name').value = tempName;
    toggleElements(true);
    document.getElementById('avatar').addEventListener('click', handleAvatarClick);
}

function exitEditMode() {
    toggleElements(false);
    document.getElementById('avatar').removeEventListener('click', handleAvatarClick);
}

async function handleSave() {
    const newName = document.getElementById('edit-name').value.trim();
    const newDescription = document.getElementById('edit-description').value.trim();
    const fileInput = document.getElementById('avatar-upload');
    const hasNameChanged = newName !== tempName;
    const hasDescriptionChanged = newDescription !== tempDescription;
    const hasAvatarChanged = !!fileInput.files[0];

    if (hasNameChanged || hasAvatarChanged || hasDescriptionChanged) {
        // Есть изменения, ничего не делаем
      } else {
        exitEditMode();
        return;
      }

    try {
        if (hasNameChanged && !(await validateName(newName))) return;
        if (hasDescriptionChanged && !(await DescriptionValidate(newDescription))) return;

        const formData = new FormData();
        formData.append('action', 'updateprofile');
        formData.append('login_key', localStorage.getItem('game_login_key'));
        
        if (hasNameChanged) {
            formData.append('username', newName);
        }
        
        if (hasAvatarChanged) {
            formData.append('avatar', fileInput.files[0]);
        }

        if (hasDescriptionChanged) {
            formData.append('description', newDescription);
        }

        const response = await fetch('api.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        
        if (result.status !== 'ok') {
            throw new Error(result.error || 'Ошибка обновления профиля');
        }

        // Обновляем UI только при успешном ответе
        if (hasNameChanged) {
            document.querySelectorAll('.account-name').forEach(el => {
                el.textContent = newName;
            });
        }

        if (hasDescriptionChanged) {
            document.querySelectorAll('.description').forEach(el => {
                el.textContent = newDescription;
            });
        }

        if (hasAvatarChanged) {
            const newAvatarUrl = `avatars/${result.userId}.${result.extension}?t=${Date.now()}`;
            document.querySelectorAll('.avatar').forEach(el => {
                el.src = newAvatarUrl;
            });
        }

        exitEditMode();
    } catch (error) {
        console.error('Ошибка:', error);
        showError(error.message);
        resetUI();
    }
}

// Остальные функции остаются без изменений (но проверьте комментарии ниже)
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

// В функции previewAvatar добавьте:
function previewAvatar(file) {
    if (!validateFileType(file)) {
        showError("Неверный формат файла! Допустимые: .png, .jpg, .gif");
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('avatar').src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// В validateName добавьте базовые проверки:
async function validateName(name) {
    if (name.length < 3) {
        showError("Имя должно быть не короче 3 символов");
        return false;
    }
    
    if (name.length > 20) {
        showError("Имя должно быть не длиннее 20 символов");
        return false;
    }
    
    const forbiddenWords = ['admin', 'root', 'moderator'];
    if (forbiddenWords.some(word => name.toLowerCase().includes(word))) {
        showError("Имя содержит запрещенные слова!");
        return false;
    }
    
    return true;
}

async function DescriptionValidate(description) {
    if (description.length > 100) {
        showError("Описание должно быть не длиннее 100 символов");
        return false;
    }
    
    const forbiddenWords = ['admin', 'root', 'moderator'];
    if (forbiddenWords.some(word => description.toLowerCase().includes(word))) {
        showError("Имя содержит запрещенные слова!");
        return false;
    }
    
    return true;
}

function showError(message) {
    const errorElement = document.getElementById('name-error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function resetUI() {
    updateProfileData();
    fetchAvatar();
    exitEditMode();
}
