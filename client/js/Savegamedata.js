const DataManager = {
    deepMerge(target, source) {
      if (typeof target !== 'object' || typeof source !== 'object') return source;
      
      if (Array.isArray(target) && Array.isArray(source)) {
        return this.mergeArrays(target, source);
      }
  
      for (const key of Object.keys(source)) {
        if (target.hasOwnProperty(key)) {
          target[key] = this.deepMerge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
      return target;
    },
  
    mergeArrays(target, source, keyField = 'name') {
      const sourceMap = new Map(source.map(item => [item[keyField], item]));
      
      return target.map(item => {
        const sourceItem = sourceMap.get(item[keyField]);
        return sourceItem ? this.deepMerge({...item}, sourceItem) : item;
      });
    },
  
    loadPrimitives(savedData) {
      const primitives = [
        'isBlocked', 'blockStartTime', 'blockDuration', 'lastBlockTime',
        'blockLevel', 'currentCount', 'maxHP', 'playerBaseDamage',
        'playerArmor', 'playerBlock', 'regenerationAmount',
        'dodgeChance', 'playerVulnerability'
      ];
  
      primitives.forEach(key => {
        if (savedData[key] !== undefined) {
          window[key] = savedData[key];
        }
      });
    }
  };
  
  // Функции работы с аккаунтом и сохранениями
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
          console.error('Account creation failed:', error);
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
          improvements: JSON.parse(JSON.stringify(improvements)),
          potions: JSON.parse(JSON.stringify(potions)),
          activeAbilities: {...activeAbilities},
          cooldownTimers: {...cooldownTimers},
          timers: {...timers},
          isBlocked,
          blockStartTime,
          blockDuration,
          lastBlockTime,
          blockLevel,
          currentCount,
          maxHP,
          playerBaseDamage,
          playerArmor,
          playerBlock,
          regenerationAmount,
          dodgeChance,
          playerVulnerability
        };
  
        await fetch('api.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch (error) {
        console.error('Save failed:', error);
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
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const savedData = await response.json();
        
        // Восстановление сложных структур
        if (savedData.improvements) {
          Object.keys(improvements).forEach(category => {
            improvements[category] = DataManager.mergeArrays(
              improvements[category],
              savedData.improvements[category] || []
            );
          });
        }
  
        if (savedData.potions) {
          DataManager.deepMerge(potions, savedData.potions);
        }
  
        // Восстановление активных способностей
        activeAbilities = Object.entries(savedData.activeAbilities || {}).reduce((acc, [key, value]) => {
          acc[key] = {...value};
          return acc;
        }, {});
  
        // Восстановление таймеров
        cooldownTimers = {...savedData.cooldownTimers};
        timers = {...savedData.timers};
  
        // Восстановление простых значений
        DataManager.loadPrimitives(savedData);
        
      } catch (error) {
        console.error('Load failed:', error);
        // Можно добавить восстановление по умолчанию
      }
    }
  };
  
  // Инициализация игры
  window.addEventListener('load', async () => {
    try {
      await GameStorage.initAccount();
      await GameStorage.loadGameState();
      
      // Автосохранение каждые 30 секунд
      setInterval(() => GameStorage.saveGameState(), 5000);
      
      // Восстановление таймеров после загрузки
      Object.entries(timers).forEach(([key, endTime]) => {
        const remaining = endTime - Date.now();
        if (remaining > 0) {
          setTimeout(() => this.handleTimerEnd(key), remaining);
        }
      });
      
    } catch (error) {
      console.error('Game initialization failed:', error);
      alert('Failed to initialize game. Please try reloading the page.');
    }
  });
  