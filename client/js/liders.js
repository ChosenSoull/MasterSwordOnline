async function loadLeaders() {
    try {
        const response = await fetch('api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'liders'
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const leadersSection = document.querySelector("#leaders-section .panel-content");
        leadersSection.innerHTML = "";

        if (!data?.length) {
            leadersSection.innerHTML = "<p class='error-message'>Нет данных о лидерах</p>";
            return;
        }

        data.forEach(leader => {
            const leaderBlock = createLeaderElement(leader);
            leadersSection.appendChild(leaderBlock);
        });
    } catch (error) {
        console.error("Ошибка загрузки лидеров:", error);
        displayErrorMessage(error.message);
    }
}

function createLeaderElement(leader) {
    const leaderBlock = document.createElement("div");
    leaderBlock.className = "leader-panel";
    leaderBlock.appendChild(createAvatarSection(leader));
    leaderBlock.appendChild(createInfoSection(leader));
    return leaderBlock;
}

function createAvatarSection(leader) {
    const avatarFrame = document.createElement("div");
    avatarFrame.className = "leader-avatar-frame";
    const avatarImg = document.createElement("img");
    avatarImg.className = "leader-avatar";
    avatarImg.src = getAvatarDataURL(leader.avatar);
    const frameImg = document.createElement("img");
    frameImg.className = "leader-frame";
    frameImg.src = "assets/textures/public/progress/6.png";
    avatarFrame.append(avatarImg, frameImg);
    return avatarFrame;
}

function createInfoSection(leader) {
    const infoDiv = document.createElement("div");
    infoDiv.className = "leader-info";
    const createParagraph = (text, className) => {
        const p = document.createElement("p");
        p.className = className;
        p.textContent = text;
        return p;
    };
    infoDiv.append(
        createParagraph(leader.username, "leader-name"),
        createParagraph(`ID: ${leader.user_id}`, "leader-id"),
        createParagraph(`Очки: ${leader.current_count}`, "leader-score")
    );
    return infoDiv;
}

function getAvatarDataURL(avatarData) {
    const mimeType = detectMimeType(avatarData);
    return `data:${mimeType};base64,${avatarData}`;
}

function detectMimeType(base64Data) {
    if (base64Data.startsWith('/9j/')) return 'image/jpeg';
    if (base64Data.startsWith('R0lGOD')) return 'image/gif';
    if (base64Data.startsWith('iVBORw')) return 'image/png';
    return 'image/png';
}

function displayErrorMessage(message) {
    const section = document.querySelector("#leaders-section .panel-content");
    section.innerHTML = `<p class="error-message">Ошибка загрузки: ${message}</p>`;
}