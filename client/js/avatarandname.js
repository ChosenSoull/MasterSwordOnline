let tempName = "";
let tempAvatar = "";

function syncProfileData() {
    document.getElementById('account-name').textContent = document.querySelector('#account-panel .account-name').textContent;
    document.getElementById('avatar').src = document.querySelector('#account-panel .avatar').src;
}

syncProfileData();

document.getElementById('edit-button').addEventListener('click', function () {
    tempName = document.getElementById('account-name').textContent;
    tempAvatar = document.getElementById('avatar').src;
    document.getElementById('edit-name').value = tempName;
    document.getElementById('edit-name').style.display = 'inline';
    document.getElementById('account-name').style.display = 'none';
    document.getElementById('save-button').style.display = 'inline';
    document.getElementById('cancel-button').style.display = 'inline';
    document.getElementById('name-error').style.display = 'none';
    this.style.display = 'none';
});

document.getElementById('save-button').addEventListener('click', async function () {
    const newName = document.getElementById('edit-name').value;
    const fileInput = document.getElementById('avatar-upload');
    const file = fileInput.files[0];
    const loginKey = localStorage.getItem('game_login_key');

    if (file && !validateFileType(file)) {
        document.getElementById('name-error').textContent = "Неверный формат файла! Допустимые: .png, .jpg, .gif";
        document.getElementById('name-error').style.display = 'block';
        return;
    }

    if (newName !== tempName || file) {
        let params = new URLSearchParams({
            action: file && newName !== tempName ? 'update_all' : file ? 'update_avatar' : 'update_name',
            login_key: loginKey
        });

        if (newName !== tempName) {
            params.append('name', newName);
        }

        if (file) {
            let formData = new FormData();
            formData.append('avatar', file);
            formData.append('login_key', loginKey);
            await sendUpdateRequest(formData);
        }

        await fetch('api.php', {
            method: 'POST',
            body: params
        });
    }

    resetUI();
});

async function sendUpdateRequest(formData) {
    try {
        const response = await fetch('api.php', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            if (data.newAvatarUrl) {
                document.getElementById('avatar').src = data.newAvatarUrl;
                document.querySelector('#account-panel .avatar').src = data.newAvatarUrl;
            }
            if (data.name) {
                document.getElementById('account-name').textContent = data.name;
                document.querySelector('#account-panel .account-name').textContent = data.name;
            }
        } else {
            document.getElementById('name-error').textContent = data.error;
            document.getElementById('name-error').style.display = 'block';
        }
    } catch (error) {
        console.error('Ошибка запроса:', error);
    }
}

function validateFileType(file) {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
    return allowedTypes.includes(file.type);
}

function resetUI() {
    document.getElementById('edit-name').style.display = 'none';
    document.getElementById('account-name').style.display = 'inline';
    document.getElementById('edit-button').style.display = 'inline';
    document.getElementById('save-button').style.display = 'none';
    document.getElementById('cancel-button').style.display = 'none';
    document.getElementById('name-error').style.display = 'none';
}

document.getElementById('cancel-button').addEventListener('click', function () {
    document.getElementById('edit-name').style.display = 'none';
    document.getElementById('account-name').style.display = 'inline';
    document.getElementById('avatar').src = tempAvatar;
    document.getElementById('edit-button').style.display = 'inline';
    document.getElementById('save-button').style.display = 'none';
    document.getElementById('cancel-button').style.display = 'none';
    document.getElementById('name-error').style.display = 'none';
});

document.getElementById('avatar').addEventListener('click', function () {
    document.getElementById('avatar-upload').click();
});

document.getElementById('avatar-upload').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file && validateFileType(file)) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('avatar').src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        document.getElementById('name-error').textContent = "Неверный формат файла! Допустимые: .png, .jpg, .gif";
        document.getElementById('name-error').style.display = 'block';
    }
});