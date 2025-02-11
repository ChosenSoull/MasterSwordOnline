const GameStorage = {
  async initAccount() {
    let loginKey = localStorage.getItem('game_login_key');
    if (!loginKey) {
      try {
        const response = await fetch('api.php', {
          method: 'POST',
          body: new URLSearchParams({ action: 'create_guest' })
        });
        const data = await response.json();
        loginKey = data.login_key;
        localStorage.setItem('game_login_key', loginKey);
      } catch (error) {
        console.error('Ошибка создания аккаунта:', error);
        throw error;
      }
    }
    return loginKey;
  },

  async saveGameState() {
    try {
      const loginKey = await this.initAccount();
      const data = {
        action: 'save',
        login_key: loginKey,
        improvements: structuredClone(improvements),
        potions: structuredClone(potions),
        activeAbilities: structuredClone(activeAbilities),
        cooldownTimers: structuredClone(cooldownTimers),
        timers: structuredClone(timers),
        clickBonus: clickBonus ?? 1,
        isBlocked: isBlocked ?? false,
        blockStartTime: blockStartTime ?? 0,
        blockDuration: blockDuration ?? 0,
        lastBlockTime: lastBlockTime ?? 0,
        blockLevel: blockLevel ?? 0,
        currentCount: currentCount ?? 0,
        maxHP: maxHP ?? 450,
        playerBaseDamage: playerBaseDamage ?? 1,
        playerArmor: playerArmor ?? 0,
        playerBlock: playerBlock ?? 0,
        regenerationAmount: regenerationAmount ?? 0,
        dodgeChance: dodgeChance ?? 0,
        playerVulnerability: playerVulnerability ?? 0
      };

      console.log("✅ Автосохранение данных:", data);

      await fetch('api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

    } catch (error) {
      console.error('❌ Ошибка сохранения:', error);
    }
  },

  async loadGameState() {
    try {
      const loginKey = await this.initAccount();
      const response = await fetch('api.php', {
        method: 'POST',
        body: new URLSearchParams({
          action: 'load',
          login_key: loginKey
        })
      });

      if (!response.ok) throw new Error('Ошибка сети');

      let savedData = await response.json();
      console.log("📥 Загруженные данные с сервера:", savedData); // 🔥 Проверяем, что пришло

      // 🔹 Маппинг серверных ключей в клиентские
      const mapping = {
        improvements: "improvements",
        potions: "potions",
        click_bonus: "clickBonus",
        active_abilities: "activeAbilities",
        cooldown_timers: "cooldownTimers",
        timers: "timers",
        is_blocked: "isBlocked",
        block_start_time: "blockStartTime",
        block_duration: "blockDuration",
        last_block_time: "lastBlockTime",
        block_level: "blockLevel",
        current_count: "currentCount",
        max_hp: "maxHP",
        player_base_damage: "playerBaseDamage",
        player_armor: "playerArmor",
        player_block: "playerBlock",
        regeneration_amount: "regenerationAmount",
        dodge_chance: "dodgeChance",
        player_vulnerability: "playerVulnerability"
      };

      // 🔹 Преобразуем ключи
      let transformedData = {};
      for (let key in savedData) {
        let newKey = mapping[key] ?? key;
        transformedData[newKey] = savedData[key];
      }

      console.log("🔄 После маппинга:", transformedData); // 🔥 Проверяем, что все ключи преобразовались

      // 🔹 Применяем преобразованные данные
      if (transformedData.improvements) improvements = structuredClone(transformedData.improvements);
      if (transformedData.potions) potions = structuredClone(transformedData.potions);
      if (transformedData.activeAbilities) activeAbilities = structuredClone(transformedData.activeAbilities);
      if (transformedData.cooldownTimers) cooldownTimers = structuredClone(transformedData.cooldownTimers);
      if (transformedData.timers) timers = structuredClone(transformedData.timers);

      isBlocked = transformedData.isBlocked ?? false;
      clickBonus = transformedData.clickBonus ?? 1;
      blockStartTime = transformedData.blockStartTime ?? 0;
      blockDuration = transformedData.blockDuration ?? 0;
      lastBlockTime = transformedData.lastBlockTime ?? 0;
      blockLevel = transformedData.blockLevel ?? 0;
      currentCount = transformedData.currentCount ?? 0;
      maxHP = transformedData.maxHP ?? 450;
      playerBaseDamage = transformedData.playerBaseDamage ?? 1;
      playerArmor = transformedData.playerArmor ?? 0;
      playerBlock = transformedData.playerBlock ?? 0;
      regenerationAmount = transformedData.regenerationAmount ?? 0;
      dodgeChance = transformedData.dodgeChance ?? 0;
      playerVulnerability = transformedData.playerVulnerability ?? 0;

      displayImprovements();
      displayPotions();
      updateCount(currentCount);
      updatePotionBar();
      updateProfileData()

      console.log("✅ Данные успешно загружены и применены!", {
        improvements, potions, activeAbilities, cooldownTimers, timers,
        isBlocked, blockStartTime, blockDuration, lastBlockTime, blockLevel,
        currentCount, maxHP, playerBaseDamage, playerArmor, playerBlock,
        regenerationAmount, dodgeChance, playerVulnerability
      });

    } catch (error) {
      console.error('❌ Ошибка загрузки:', error);
    }
  }
};

async function updateProfileData() {
  let loginKey = localStorage.getItem('game_login_key');
  try {
    const response = await fetch('api.php', { // Замените 'api.php' на URL вашего сервера
      method: 'POST',
      body: new URLSearchParams({
        action: 'loadProfile',
        login_key: loginKey
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    localStorage.removeItem(data.avatar);

    // Проверяем, есть ли данные и нужные поля
    if (data && data.id && data.username && data.avatar) {
      // Обновляем ID
      document.querySelectorAll('.account-id').forEach(el => el.textContent = `ID: ${data.id}`);
      document.querySelectorAll('.account-idProfile').forEach(el => el.textContent = `ID: ${data.id}`);

      // Обновляем имя пользователя
      document.querySelectorAll('.account-name').forEach(el => el.textContent = data.username);
      document.querySelectorAll('.account-nameProfile').forEach(el => el.textContent = data.username);


      // Обновляем аватар
      document.querySelectorAll('.avatar').forEach(el => el.src = data.avatar);
      document.querySelectorAll('.avatarProfile').forEach(el => el.src = data.avatar);

    } else {
      console.error('Неверный формат данных, полученных с сервера:', data);
      // Обработка ошибки, например, вывод сообщения пользователю
    }

  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error);
    // Обработка ошибки, например, вывод сообщения пользователю
  }
}

// 🚀 Запуск игры + Автосохранение
window.addEventListener('load', async () => {
  try {
    await GameStorage.initAccount();
    await GameStorage.loadGameState();

    // 🔄 Автосохранение каждые 10 секунд
    setInterval(() => GameStorage.saveGameState(), 30000);

    // 💾 Сохранение при выходе с сайта
    window.addEventListener('beforeunload', (event) => {
      GameStorage.saveGameState();
    });

    // 👀 Сохранение при сворачивании страницы
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        GameStorage.saveGameState();
      }
    });

  } catch (error) {
    console.error('❌ Ошибка инициализации:', error);
    alert('Ошибка загрузки игры. Перезагрузите страницу.');
  }
});
