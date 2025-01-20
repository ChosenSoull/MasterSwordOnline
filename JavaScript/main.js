let translations = {}; // Глобальная переменная для переводов

loadTranslations('ru');

document.getElementById('languageSelectBtn').addEventListener('click', function () {
    const langSection = document.getElementById('Lang-section');
    langSection.classList.toggle('hidden');
});

document.querySelectorAll('#Lang-section .language-button').forEach(function (langOption) {
    langOption.addEventListener('click', function () {
        const selectedLang = this.getAttribute('data-lang');
        loadTranslations(selectedLang);
        document.getElementById('Lang-section').classList.add('hidden');
    });
});

async function loadTranslations(language) {
    try {
        const response = await fetch(`./locales/${language}.json`);
        const data = await response.json();
        translations = data; // Сохраняем переводы в глобальной переменной
        localize(); // Обновляем интерфейс
    } catch (error) {
        console.error('Ошибка при загрузке переводов:', error);
    }
}

function localize() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.dataset.i18n;
        if (translations[key] !== undefined) {
            element.textContent = translations[key];
        }
    });
}

function formatNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2) + 'млрд'; // Для чисел больше или равных миллиарду
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'млн'; // Для чисел больше или равных миллиону
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'тыс'; // Для чисел больше или равных тысяче
    } else {
        return Math.floor(num).toString(); // Для чисел меньше тысячи отображаем как целое
    }
}

function updateCount(count) {
    if (isNaN(count)) {
        console.error("Ошибка: count не является числом");
        return;
    }
    document.getElementById('count').innerText = formatNumber(Number(count));
}

let errorMessageTimeout; // Переменная для хранения ID таймаута

function showErrorMessage() {
    const errorMessage = document.getElementById('error-message');

    // Очищаем предыдущий таймаут, если есть
    clearTimeout(errorMessageTimeout);

    // Сбрасываем стили и убираем класс hide (это важно!)
    errorMessage.style.opacity = 0;
    errorMessage.style.transform = 'translateY(100%)';
    errorMessage.style.transition = 'none'; // Убираем transition чтобы не было рывков

    errorMessage.classList.remove('hide');

    // Показываем сообщение с небольшой задержкой для плавности
    setTimeout(() => {
        errorMessage.style.transition = 'transform 0.5s ease, opacity 0.5s ease'; // Включаем transition только перед анимацией
        errorMessage.style.visibility = 'visible';
        errorMessage.style.opacity = 1;
        errorMessage.style.transform = 'translateY(0)';

        // Устанавливаем таймаут для скрытия
        errorMessageTimeout = setTimeout(() => {
            errorMessage.style.transform = 'translateY(0)';
            errorMessage.style.opacity = 1;

            setTimeout(() => {
                errorMessage.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
                errorMessage.style.transform = 'translateX(500px)';
                errorMessage.style.opacity = 0;
                setTimeout(() => {
                    errorMessage.style.visibility = 'hidden';
                    errorMessage.style.transition = 'none';
                    errorMessage.style.transform = 'translateY(100%)';
                }, 500);
            }, 10);
        }, 3000);
    }, 10);
}

function checkDDNSConnection() {
    fetch('http://gameswords.ddns.net/')
        .then(response => {
            if (!response.ok) {
                console.error('Ошибка подключения к DDNS');
                showErrorMessage();
            } else {
                console.log('Подключение к DDNS установлено');
                // Можно добавить скрытие сообщения, если соединение восстановилось
                const errorMessage = document.getElementById('error-message');
                errorMessage.classList.remove('show');
                errorMessage.classList.add('hide');
                clearTimeout(errorMessageTimeout); // Очищаем таймаут, если он есть
            }
        })
        .catch(error => {
            console.error('Ошибка подключения к DDNS', error);
            showErrorMessage();
        });
}

setInterval(checkDDNSConnection, 5000);

const countElement = document.getElementById('count');
const image = document.querySelector('.image');
const clickSound = document.getElementById("clickSound");
const SERVER_URL = 'http://gameswords.ddns.net';
let currentCount = 0;

document.addEventListener('keydown', function (event) {
    if (event.code === 'Space') {
        image.classList.add('pressed');
        setTimeout(() => {
            image.classList.remove('pressed');
        }, 100);
        image.click();
        event.preventDefault();
    }
});

function updateClickCount(newCount) {
    currentCount = newCount;
    updateCount(currentCount);
}

function getClickCount() {
    fetch(`${SERVER_URL}/clicks`)
        .then(response => response.json())
        .then(data => {
            if (data.clickCount !== undefined) {
                updateClickCount(data.clickCount);
            }
        })
        .catch(error => console.error('Ошибка получения количества кликов:', error));
}

// Пример добавления таймера к элементу с id "ability-timer"
function startAbilityTimer(element, duration) {
    let remainingTime = duration;
    const timerElement = element.querySelector('.ability-timer');
    const intervalId = setInterval(() => {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        remainingTime--;

        if (remainingTime < 0) {
            clearInterval(intervalId);
            // Код для окончания действия способности
            element.classList.remove('activated-ability');
            timerElement.remove();
        }
    }, 1000);
}

let clickCountPerSecond = 0;
let lastSecondStartTime = Date.now();
const blockDurations = [20000, 300000, 900000, 1800000, 3600000, 21600000];
const maxClicksPerSecond = 15;
let isBlocked = false;
let blockStartTime = 0;
let blockDuration = 20000; // Начальная блокировка 20 секунд
let lastBlockTime = 0; // Время последней блокировки
const escalationTime = 1200000; // 20 минут в миллисекундах
let blockLevel = 0; // Уровень блокировки (0, 1, 2, 3, 4, 5)
let clickBonus = 1;

const improvements = {
    "armorAndWeapons": [
        { name: "helmet", level: 0, baseCost: 100, cost: 100, bonus: 1.25, totalBonus: 0, icon: "Textures/helmet-icon.png" },
        { name: "body", level: 0, baseCost: 200, cost: 200, bonus: 1.25, totalBonus: 0, icon: "Textures/body-icon.png" },
        { name: "pants", level: 0, baseCost: 150, cost: 150, bonus: 1.25, totalBonus: 0, icon: "Textures/pants-icon.png" },
        { name: "boots", level: 0, baseCost: 100, cost: 100, bonus: 1.25, totalBonus: 0, icon: "Textures/boots-icon.png" },
        { name: "shield", level: 0, baseCost: 300, cost: 300, bonus: 1.25, totalBonus: 0, icon: "Textures/shield-icon.png" },
        { name: "sword", level: 0, baseCost: 500, cost: 500, bonus: 1.25, totalBonus: 0, icon: "Textures/sword-icon.png" }
    ],
    "heroImprovements": [
        { name: "intellect", level: 0, baseCost: 100, cost: 100, bonus: 1.25, totalBonus: 0, icon: "Textures/intellect-icon.png" },
        { name: "courage", level: 0, baseCost: 150, cost: 150, bonus: 1.25, totalBonus: 0, icon: "Textures/courage-icon.png" },
        { name: "endurance", level: 0, baseCost: 200, cost: 200, bonus: 1.25, totalBonus: 0, icon: "Textures/endurance-icon.png" },
        { name: "confidence", level: 0, baseCost: 100, cost: 100, bonus: 1.25, totalBonus: 0, icon: "Textures/confidence-icon.png" },
        { name: "strength", level: 0, baseCost: 250, cost: 250, bonus: 1.25, totalBonus: 0, icon: "Textures/strength-icon.png" },
        { name: "life", level: 0, baseCost: 300, cost: 300, bonus: 1.25, totalBonus: 0, icon: "Textures/life-icon.png" },
        { name: "reaction", level: 0, baseCost: 200, cost: 200, bonus: 1.25, totalBonus: 0, icon: "Textures/reaction-icon.png" }
    ],
    "magic": [
        { name: "mana", level: 0, baseCost: 100, cost: 100, bonus: 1.25, totalBonus: 0, icon: "path/to/mana-icon.png" },
        { name: "regeneration", level: 0, baseCost: 150, cost: 150, bonus: 1.25, totalBonus: 0, icon: "path/to/regeneration-icon.png" },
        { name: "strength", level: 0, baseCost: 200, cost: 200, bonus: 1.25, totalBonus: 0, icon: "path/to/power-icon.png" },
        { name: "fireResistance", level: 0, baseCost: 250, cost: 250, bonus: 1.25, totalBonus: 0, icon: "path/to/fire-resistance-icon.png" },
        { name: "mainMagic", level: 0, baseCost: 300, cost: 300, bonus: 0, totalBonus: 0, icon: "path/to/main-magic-icon.png" }
    ]
};

const potions = [
    { name: "speedPotion", baseCost: 100, cost: 100, icon: "path/to/speed-potion-icon.png", unlocksAbility: "IncreasedMovementSpeed", duration: 60000, cooldown: 300000, purchased: false },
    { name: "magicResistancePotion", baseCost: 200, cost: 200, icon: "path/to/magic-resistance-potion-icon.png", unlocksAbility: "MagicResistance", duration: 60000, cooldown: 300000, purchased: false },
    { name: "teleportationPotion", baseCost: 300, cost: 300, icon: "path/to/teleportation-potion-icon.png", unlocksAbility: "Teleport", duration: 1000, cooldown: 300000, purchased: false },
    { name: "invisibilityPotion", baseCost: 400, cost: 400, icon: "path/to/invisibility-potion-icon.png", unlocksAbility: "Invisibility", duration: 60000, cooldown: 300000, purchased: false },
    { name: "berserkPotion", baseCost: 500, cost: 500, icon: "path/to/berserk-potion-icon.png", unlocksAbility: "Berserk", duration: 60000, cooldown: 300000, purchased: false },
    { name: "healingPotion", baseCost: 600, cost: 600, icon: "path/to/healing-potion-icon.png", unlocksAbility: "Healing", duration: 1000, cooldown: 60000, purchased: false }
];

const categoryNames = {
    "armorAndWeapons": "armorAndWeapons",
    "heroImprovements": "heroImprovements",
    "magic": "magic",
    "potions": "potions"
};

function upgrade(item) {
    if (currentCount >= item.cost && item.name !== "Основная Магия") {
        currentCount -= item.cost;
        item.level++;
        item.cost = Math.ceil(item.baseCost * Math.pow(1.33, item.level));

        // Обновляем бонус с повышением на 1.10
        item.bonus *= 1.10;

        // Обновляем общий бонус с учетом нового уровня
        item.totalBonus += item.bonus;
        clickBonus += item.bonus;

        updateCount(currentCount);
        displayImprovements();
    }
}

function buyPotion(potion) {
    if (currentCount >= potion.cost && !potion.purchased) {
        currentCount -= potion.cost;
        potion.purchased = true;

        // Разблокировка способности
        document.getElementById(potion.unlocksAbility).classList.add('unlocked');

        updateCount(currentCount);
        displayPotions();
    }
}

function sellPotion(potion) {
    if (potion.purchased) {
        currentCount += potion.cost * 0.5; // Продаем за половину стоимости
        potion.purchased = false;

        // Блокировка способности
        document.getElementById(potion.unlocksAbility).classList.remove('unlocked');

        updateCount(currentCount);
        displayPotions();
    }
}

let activeAbilities = {};
let timers = {};

function activateAbility(id) {
    const potion = getPotionById(id);
    const abilityElement = document.getElementById(id);
    abilityElement.classList.add('activated-ability');

    let timerElement = abilityElement.querySelector('.ability-timer');
    if (!timerElement) {
        timerElement = document.createElement('div');
        timerElement.classList.add('ability-timer');
        abilityElement.appendChild(timerElement);
    }

    if (potion && potion.purchased) {
        if (activeAbilities[id]) {
            console.log(`Способность ${id} уже активирована.`);
            return;
        }

        activeAbilities[id] = true;
        switch (id) {
            case 'IncreasedMovementSpeed':
                increaseMovementSpeed();
                break;
            case 'MagicResistance':
                increaseMagicResistance();
                break;
            case 'Teleport':
                teleportPlayer();
                break;
            case 'Invisibility':
                makePlayerInvisible();
                break;
            case 'Berserk':
                activateBerserkMode();
                break;
            case 'Healing':
                healPlayer();
                break;
            default:
                console.log(`Неизвестная способность: ${id}`);
        }
        console.log(`Способность ${id} активирована!`);
        startAbilityTimer(id, potion.duration);
        setTimeout(() => deactivateAbility(id), potion.duration);
    } else {
        console.log(`Способность ${id} не может быть активирована, так как зелье не куплено`);
    }
}

function startAbilityTimer(id, duration) {
    const timerElement = document.getElementById(id).querySelector('.ability-timer');
    let timeRemaining = duration / 1000; // Время в секундах

    if (timers[id]) {
        clearInterval(timers[id]);
    }

    timers[id] = setInterval(() => {
        timerElement.textContent = `${timeRemaining}s`;
        timeRemaining--;

        if (timeRemaining < 0) {
            clearInterval(timers[id]);
            startCooldownTimer(id);
        }
    }, 1000);
}

function startCooldownTimer(id) {
    const potion = getPotionById(id);
    const timerElement = document.getElementById(id).querySelector('.ability-timer');
    let cooldownRemaining = potion.cooldown / 1000; // Время в секундах

    if (timers[id]) {
        clearInterval(timers[id]);
    }

    timers[id] = setInterval(() => {
        timerElement.textContent = `${cooldownRemaining}s`;
        cooldownRemaining--;

        if (cooldownRemaining < 0) {
            clearInterval(timers[id]);
            timerElement.textContent = '';
        }
    }, 1000);
}

function deactivateAbility(id) {
    const abilityElement = document.getElementById(id);
    abilityElement.classList.remove('activated-ability');

    const potion = getPotionById(id);
    activeAbilities[id] = false;

    if (potion) {
        console.log(`Способность ${id} деактивирована.`);
        setTimeout(() => {
            console.log(`Способность ${id} снова доступна.`);
            activeAbilities[id] = false;
        }, potion.cooldown);
    }
}

function increaseMovementSpeed() {
    // Логика увеличения скорости передвижения игрока
    console.log('Скорость передвижения увеличена!');
}

function increaseMagicResistance() {
    // Логика увеличения сопротивления магии
    console.log('Сопротивление магии увеличено!');
}

function teleportPlayer() {
    // Логика телепортации игрока
    console.log('Игрок телепортирован!');
}

function makePlayerInvisible() {
    // Логика невидимости игрока
    console.log('Игрок невидим!');
}

let isBerserkActive = false;
let berserkCooldown = false;
let originalClickBonus; // Хранить оригинальный clickBonus

function activateBerserkMode() {
    const berserkPotion = potions.find(potion => potion.unlocksAbility === 'Berserk');
    if (!berserkPotion) {
        console.log('Зелье режима берсерка не найдено.');
        return;
    }

    const berserkDuration = berserkPotion.duration;
    const berserkCooldownTime = berserkPotion.cooldown;

    if (berserkCooldown) {
        console.log('Режим берсерка находится на перезарядке.');
        return;
    }

    if (!isBerserkActive) {
        isBerserkActive = true;
        console.log('Режим берсерка активирован! Увеличение урона на 33% на 1 минуту.');

        // Увеличиваем clickBonus на 33%
        originalClickBonus = clickBonus;
        clickBonus *= 1.33;
        // Обновить UI, если необходимо

        // Таймер на 1 минуту для окончания режима берсерка
        setTimeout(() => {
            isBerserkActive = false;
            console.log('Режим берсерка закончился. Урон восстановлен до нормального уровня.');

            // Восстанавливаем обычный clickBonus
            clickBonus = originalClickBonus;
            // Обновить UI, если необходимо

            // Устанавливаем перезарядку на 5 минут
            berserkCooldown = true;
            setTimeout(() => {
                berserkCooldown = false;
                console.log('Перезарядка режима берсерка закончилась. Способность снова доступна.');
            }, berserkCooldownTime); // Используем cooldown из const potions
        }, berserkDuration); // Используем duration из const potions
    }
}

function healPlayer() {
    // Логика исцеления игрока
    console.log('Игрок исцелен!');
}

function displayPotions() {
    const potionsContainer = document.getElementById('potions-container');
    if (!potionsContainer) {
        console.error('Element with ID "potions-container" not found');
        return;
    }

    potionsContainer.innerHTML = ""; // Очистка контейнера зелий

    const categoryContainer = document.createElement('div');
    categoryContainer.className = 'upgrades-container';
    potionsContainer.appendChild(categoryContainer);

    potions.forEach(potion => {
        const potionItem = document.createElement('div');
        potionItem.className = 'potions-item';
        if (potion.purchased) {
            potionItem.classList.add('locked');
        }
        potionItem.onclick = () => buyPotion(potion);

        const potionIcon = document.createElement('div');
        potionIcon.className = 'potions-icon';
        const iconImg = document.createElement('img');
        iconImg.src = potion.icon;
        potionIcon.appendChild(iconImg);

        const potionDetails = document.createElement('div');
        potionDetails.className = 'potions-details';

        const potionName = document.createElement('div');
        potionName.className = 'potions-name';
        potionName.innerHTML = `<span data-i18n="${potion.name}">${translations[potion.name] || potion.name}</span>`;

        const potionCost = document.createElement('div');
        potionCost.className = 'potions-cost';
        potionCost.innerHTML = `<span data-i18n="cost">Стоимость</span>: ${formatNumber(potion.cost)}`;

        potionDetails.appendChild(potionName);
        potionDetails.appendChild(potionCost);
        potionItem.appendChild(potionIcon);
        potionItem.appendChild(potionDetails);
        categoryContainer.appendChild(potionItem);
    });
    localize();
}

const potionBar = document.querySelector('.potion-bar');
if (potionBar) {
    const existingPotionElements = {}; // Объект для хранения существующих элементов

    // Собираем ссылки на существующие элементы, используя id способности как ключ
    potionBar.querySelectorAll('.potion-item').forEach(item => {
        existingPotionElements[item.id] = item;
    });

    const fragment = document.createDocumentFragment();

    potions.forEach(potion => {
        let potionElement = existingPotionElements[potion.unlocksAbility];

        if (!potionElement) {
            // Создаем новый элемент, если его нет
            potionElement = document.createElement('div');
            potionElement.className = 'potion-item';
            potionElement.id = potion.unlocksAbility;
        }

        // Создаем или обновляем контейнер иконки
        let iconContainer = potionElement.querySelector('.potion-icon-container');
        if (!iconContainer) {
            iconContainer = document.createElement('div');
            iconContainer.className = 'potion-icon-container';
            potionElement.appendChild(iconContainer);
        }

        // Создаем или обновляем иконку
        let iconImg = iconContainer.querySelector('.potion-icon');
        if (!iconImg) {
            iconImg = document.createElement('img');
            iconImg.className = 'potion-icon';
            iconContainer.appendChild(iconImg);
            iconImg.onclick = () => activateAbility(potion.unlocksAbility); // Назначаем обработчик только при создании
        }
        iconImg.src = potion.icon; // Всегда обновляем src иконки

        // Добавляем элемент в фрагмент (только если он новый)
        if (!existingPotionElements[potion.unlocksAbility]) {
            fragment.appendChild(potionElement);
        }
    });
    potionBar.appendChild(fragment); // Добавляем фрагмент в DOM (один раз)
}

function getPotionById(unlocksAbility) {
    return potions.find(potion => potion.unlocksAbility === unlocksAbility);
}

const potionanimation = document.querySelector('.potion-bar-animation');

const hammertimeoff = new Hammer(potionanimation);
const hammertime = new Hammer(potionBar);

hammertime.on('panleft', function (event) {
    potionBar.style.transition = 'transform 0.3s ease-out';
    potionBar.style.transform = 'translateX(-140%)';
});

hammertimeoff.on('panright', function (event) {
    potionBar.style.transition = 'transform 0.3s ease-out';
    potionBar.style.transform = 'translateX(0)';
});

function displayImprovements() {
    const improvementsList = document.getElementById('improvements-list');
    if (!improvementsList) {
        console.error('Element with ID "improvements-list" not found');
        return;
    }

    improvementsList.innerHTML = "";

    for (const category in improvements) {
        if (improvements.hasOwnProperty(category)) {
            const totalCategoryBonus = improvements[category].reduce((sum, item) => sum + item.totalBonus, 0);

            const categoryHeader = document.createElement('div');
            categoryHeader.style.display = 'flex';
            categoryHeader.style.justifyContent = 'space-between';

            const translatedCategory = translations[categoryNames[category]] || categoryNames[category];
            categoryHeader.innerHTML = `
                    <h3 data-i18n="${categoryNames[category]}">${translatedCategory}</h3>
                    <div>
                    <span data-i18n="CategoryTotalBonus">Общий бонус:</span> <span>${formatNumber(totalCategoryBonus)}</span>
                    </div>`;
            improvementsList.appendChild(categoryHeader);

            const categoryContainer = document.createElement('div');
            categoryContainer.className = 'upgrades-container';
            improvementsList.appendChild(categoryContainer);

            improvements[category].forEach(item => {
                const improvementItem = document.createElement('div');
                improvementItem.className = 'improvement-item';
                improvementItem.onclick = () => upgrade(item);

                const icon = document.createElement('img');
                icon.src = item.icon;
                icon.className = 'improvement-icon';

                const details = document.createElement('div');
                details.className = 'improvement-details';

                const name = document.createElement('div');
                name.className = 'improvement-name';
                name.innerHTML = `<span data-i18n="${item.name}">${translations[item.name] || item.name}</span> <span class="improvement-level"</span><span data-i18n="level"></span>${item.level}`;

                const bonus = document.createElement('div');
                bonus.className = 'improvement-bonus';
                bonus.innerHTML = `+${item.bonus.toFixed(2)} <span data-i18n="bonus"></span> <span data-i18n="totalBonus"></span>: ${formatNumber(item.totalBonus)}`;

                const cost = document.createElement('div');
                cost.className = 'improvement-cost';
                cost.innerHTML = `<span data-i18n="cost">Стоимость</span>: ${formatNumber(item.cost)}`;

                details.appendChild(name);
                details.appendChild(bonus);
                details.appendChild(cost);
                improvementItem.appendChild(icon);
                improvementItem.appendChild(details);
                categoryContainer.appendChild(improvementItem);
            });
        }
    }
    localize();
}
displayImprovements();
displayPotions();

let activeSounds = [];
let isUpdating = true; // флаг обновления сообщения

function showMessage(message) {
    const messageContainer = document.getElementById('message-container');
    messageContainer.textContent = message;
    messageContainer.style.display = 'block';
}

function hideMessage() {
    const messageContainer = document.getElementById('message-container');
    messageContainer.style.display = 'none';
}

function updateMessage() {
    const currentTime = Date.now();
    if (isBlocked) {
        image.classList.add('blocked');
        const timeLeft = (blockDuration - (currentTime - blockStartTime)) / 1000;
        const timeLeftWhole = timeLeft.toString().split('.')[0]; // Извлечение целой части времени
        if (timeLeft > 0) {
            showMessage(`Клики заблокированы! Осталось ${timeLeftWhole} секунд`);
        } else {
            isBlocked = false;
            showMessage("Блокировка снята.");
            image.classList.remove('blocked');
            setTimeout(hideMessage, 3000); // Скрыть сообщение через 3 секунды
        }
    } else {
        hideMessage();
    }
}

setInterval(updateMessage, 1000); // Обновление сообщения каждую секунду

function clickSword(event) {
    const currentTime = Date.now();

    // Проверяем, заблокированы ли клики
    if (isBlocked) {
        // Убедимся, что мы не обновляем сообщение при клике, когда блокировка активна
        return;
    }

    // Сбрасываем счетчик кликов, если прошла одна секунда
    if (currentTime - lastSecondStartTime >= 1000) {
        clickCountPerSecond = 0;
        lastSecondStartTime = currentTime;
    }

    // Проверяем, не превышено ли максимальное количество кликов в секунду
    if (clickCountPerSecond < maxClicksPerSecond) {
        currentCount += clickBonus; // Увеличиваем количество кликов с учетом бонуса
        updateCount(currentCount);
        image.classList.add('active');
        setTimeout(() => {
            image.classList.remove('active');
        }, 100);

        // Управление воспроизведением звука клика с разрешением трех кликов
        if (activeSounds.length < 6) {
            const soundClone = clickSound.cloneNode(true);
            soundClone.volume = clickSound.volume; // Установка громкости
            soundClone.muted = clickSound.muted;   // Установка мутирования
            soundClone.currentTime = 0;
            soundClone.play();
            activeSounds.push(soundClone);

            soundClone.onended = () => {
                activeSounds = activeSounds.filter(sound => sound !== soundClone);
                soundClone.remove();
            };
        } else {
            // Очистка активных звуков после трех кликов
            activeSounds.forEach(sound => {
                sound.pause();
                sound.currentTime = 0;
                sound.remove();
            });
            activeSounds = [];
        }

        clickCountPerSecond++;
    } else {
        showMessage("Слишком высокая скорость кликов! Блокировка.");

        // Проверяем, было ли нарушение за последние 20 минут
        if (currentTime - lastBlockTime < escalationTime) {
            blockLevel = Math.min(blockLevel + 1, blockDurations.length - 1); // Увеличиваем уровень, но не выше максимума
            blockDuration = blockDurations[blockLevel];
            showMessage(`Уровень блокировки повышен до ${blockLevel + 1}. Длительность: ${(blockDuration / 60000).toFixed(1)} минут`);
        } else {
            blockLevel = 0; // Сбрасываем уровень блокировки, если прошло 20 минут
            blockDuration = blockDurations[blockLevel];
            showMessage(`Блокировка сброшена до ${blockLevel + 1}. Длительность: ${(blockDuration / 1000).toFixed(1)} секунд`);
        }

        isBlocked = true;
        blockStartTime = currentTime;
        lastBlockTime = currentTime; // Запоминаем время этой блокировки
    }

    scaleBackground();
    createSparks(event);
}
// Получаем начальное количество кликов при загрузке страницы
getClickCount();
setInterval(getClickCount, 5000);

function playMusic() {
    if (!musicPlaying && musicEnabled) {
        gameMusic.play();
        musicPlaying = true;
    }
}

function stopMusic() {
    if (musicPlaying) {
        gameMusic.pause();
        musicPlaying = false;
    }
}

loadingMusicButton.addEventListener('click', () => {
    musicEnabled = true;
    playMusic();
    loadingScreen.classList.add('hidden');
})

window.addEventListener('load', () => {
    const loadingBar = document.querySelector('.loading-bar');
    loadingBar.style.width = '100%';

    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        },);
    }, 6000);
});

const overlay = document.getElementById('overlay');
let currentPanel = null;

function showPanel(panelId, event) {
    event.preventDefault();

    if (currentPanel && currentPanel !== panelId) {
        togglePanel(currentPanel);
    }

    togglePanel(panelId);
}

function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    panel.classList.toggle('active');
    overlay.classList.toggle('active');

    if (panel.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
        currentPanel = panelId; // Запоминаем ID текущей открытой панели
        overlay.addEventListener('click', closePanelOutside);
    } else {
        document.body.style.overflow = 'auto';
        currentPanel = null; // Сбрасываем ID
        overlay.removeEventListener('click', closePanelOutside); // Важно: удаляем обработчик
    }
}

function closePanelOutside(event) {
    if (event.target === overlay) { // Проверяем, что клик был именно по оверлею
        togglePanel(currentPanel); // Закрываем текущую открытую панель
    }
}

function scaleBackground() {
    if (graphicsQuality !== 'potato') {
        const bg = document.querySelector('.bg');
        bg.classList.add('scaled');
        setTimeout(() => bg.classList.remove('scaled'), 200);
    }
}

// Spark effect
let graphicsQuality = 'medium';
const sparkCounts = {
    potato: 0,
    low: 14,
    medium: 21,
    high: 28
};

function createSparks(event) {
    const count = sparkCounts[graphicsQuality];
    const swordImg = document.getElementById('sword');
    const sparkLayer = document.getElementById('spark-layer');

    if (!swordImg || !sparkLayer) return;

    const rect = swordImg.getBoundingClientRect();
    const containerRect = swordImg.parentNode.getBoundingClientRect();

    for (let i = 0; i < count; i++) {
        // Координаты относительно контейнера!
        const randomX = rect.left - containerRect.left + Math.random() * rect.width;
        const randomY = rect.top - containerRect.top + Math.random() * rect.height;

        createSpark(randomX, randomY, sparkLayer);
    }
}

function createSpark(x, y, sparkLayer) {
    // ... (код createSpark остается без изменений, он должен добавлять искру в sparkLayer)
    const spark = document.createElement('div');
    spark.className = 'spark';
    spark.style.left = x + 'px';
    spark.style.top = y + 'px';
    spark.style.width = Math.random() * 8 + 4 + 'px';
    spark.style.height = spark.style.width;

    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 50 + 50;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;

    sparkLayer.appendChild(spark); // Добавляем искру в слой!

    let posX = x;
    let posY = y;
    let life = 1;

    function animate() {
        if (life <= 0) {
            spark.remove();
            return;
        }

        posX += vx * 0.016;
        posY += vy * 0.016;
        life -= 0.016 * 2;

        spark.style.left = posX + 'px';
        spark.style.top = posY + 'px';
        spark.style.opacity = life;

        requestAnimationFrame(animate);
    }

    animate();
}

// Volume controls
const musicVolume = document.getElementById('musicVolume');
const sfxVolume = document.getElementById('sfxVolume');
const musicToggle = document.getElementById('musicToggle');
const sfxToggle = document.getElementById('sfxToggle');

musicVolume.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    gameMusic.volume = volume;
});

sfxVolume.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    clickSound.volume = volume;
});

musicToggle.addEventListener('click', () => {
    musicToggle.classList.toggle('muted');
    if (musicToggle.classList.contains('muted')) {
        gameMusic.pause();
    } else {
        gameMusic.play();
    }
});

sfxToggle.addEventListener('click', () => {
    sfxToggle.classList.toggle('muted');
    clickSound.muted = sfxToggle.classList.contains('muted');
});

// Graphics quality
document.querySelectorAll('.quality-option').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelector('.quality-option.active').classList.remove('active');
        button.classList.add('active');
        graphicsQuality = button.dataset.quality;
    });
});