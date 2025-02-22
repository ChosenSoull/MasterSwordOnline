document.addEventListener('DOMContentLoaded', () => {
    const attackButton = document.getElementById('sword');
    maxHP = 450;
    const playerHPBar = createHPBar('player-hp-bar', maxHP);
    let currentBoss = null;
    let gameRunning = false;
    let bossHPBar;
    let originalResistance = 0;


    playerBaseDamage = 1;
    playerArmor = 0;
    playerBlock = 0;
    regenerationInterval = null;
    regenerationAmount = 0;
    dodgeChance = 0;
    playerVulnerability = 0;
    
    function startRegeneration() {
        regenerationInterval = setInterval(() => {
            // Логика регенерации HP
            playerHPBar.currentHP = Math.min(playerHPBar.maxHP, playerHPBar.currentHP + regenerationAmount);
            updateHPBar(playerHPBar, playerHPBar.currentHP);
        }, 600);
    }
    
    function stopRegeneration() {
        clearInterval(regenerationInterval);
        regenerationInterval = null;
    }
    
    function resetGame() {
        gameRunning = false;
        if (bossHPBar) {
            bossHPBar.currentHP = bossHPBar.maxHP;
            updateHPBar(bossHPBar, bossHPBar.currentHP);
        }
        playerHPBar.currentHP = playerHPBar.maxHP;
        updateHPBar(playerHPBar, playerHPBar.currentHP);
        document.querySelectorAll('.count').forEach(element => {
            element.classList.remove('boss');
        });
        document.getElementById('player-hp-bar').classList.remove('active');
        document.getElementById('boss-hp-bar').classList.remove('active');
        document.querySelectorAll('.boss').forEach(boss => boss.classList.remove('active'));
        stopRegeneration();
    
        // Восстанавливаем исходное значение сопротивления босса
        if (currentBoss) {
            bossesData[currentBoss].resistance = originalResistance;
            console.log(`Boss resistance reset to: ${bossesData[currentBoss].resistance}`);
        }
    
        currentBoss = null;
    }
    

    function boss1(hp, armor, resistance, damage) {
        this.hp = hp;
        this.armor = armor;
        this.resistance = resistance;
        this.damage = damage;
        this.specialAbility = function () {
        }
    }

    function boss2(hp, armor, resistance, damage) {
        this.hp = hp;
        this.armor = armor;
        this.resistance = resistance;
        this.damage = damage;
        this.specialAbility = function () {
        }
    }
    function boss3(hp, armor, resistance, damage) {
        this.hp = hp;
        this.armor = armor;
        this.resistance = resistance;
        this.damage = damage;
        this.specialAbility = function () {
        }
    }
    function boss4(hp, armor, resistance, damage) {
        this.hp = hp;
        this.armor = armor;
        this.resistance = resistance;
        this.damage = damage;
        this.specialAbility = function () {
        }
    }
    function boss5(hp, armor, resistance, damage) {
        this.hp = hp;
        this.armor = armor;
        this.resistance = resistance;
        this.damage = damage;
        this.specialAbility = function () {
        }
    }
    function boss6(hp, armor, resistance, damage) {
        this.hp = hp;
        this.armor = armor;
        this.resistance = resistance;
        this.damage = damage;
        this.specialAbility = function () {
        }
    }
    function boss7(hp, armor, resistance, damage) {
        this.hp = hp;
        this.armor = armor;
        this.resistance = resistance;
        this.damage = damage;
        this.specialAbility = function () {
        }
    }
    function boss8(hp, armor, resistance, damage) {
        this.hp = hp;
        this.armor = armor;
        this.resistance = resistance;
        this.damage = damage;
        this.specialAbility = function () {
        }
    }
    function boss9(hp, armor, resistance, damage) {
        this.hp = hp;
        this.armor = armor;
        this.resistance = resistance;
        this.damage = damage;
        this.specialAbility = function () {
        }
    }
    function boss10(hp, armor, resistance, damage) {
        this.hp = hp;
        this.armor = armor;
        this.resistance = resistance;
        this.damage = damage;
        this.specialAbility = function () {
        }
    }
    function boss11(hp, armor, resistance, damage) {
        this.hp = hp;
        this.armor = armor;
        this.resistance = resistance;
        this.damage = damage;
        this.specialAbility = function () {
        }
    }
    function boss12(hp, armor, resistance, damage) {
        this.hp = hp;
        this.armor = armor;
        this.resistance = resistance;
        this.damage = damage;
        this.specialAbility = function () {
        }
    }


    const bossesData = {
        'boss-1': new boss1(2000, 50,20, 20),
        'boss-2': new boss2(3000, 75,30, 30),
        'boss-3': new boss3(4000, 100,40, 40),
        'boss-4': new boss4(5000, 125,50, 50),
        'boss-5': new boss5(6000, 150,60, 60),
        'boss-6': new boss6(7000, 175,70, 70),
        'boss-7': new boss7(8000, 200,80, 80),
        'boss-8': new boss8(9000, 225,90, 90),
        'boss-9': new boss9(10000, 250,100, 100),
        'boss-10': new boss10(15000, 275,110, 110),
        'boss-11': new boss11(20000, 300,120, 120),
        'boss-12': new boss12(35000, 325,130, 130),
    };

    attackButton.addEventListener('click', () => {
        if (gameRunning && currentBoss) {
            let playerDamage = calculatePlayerDamage(playerBaseDamage, clickBonus, bossesData[currentBoss].armor, bossesData[currentBoss].resistance);
            let newBossHP = bossHPBar.currentHP - playerDamage;
            updateHPBar(bossHPBar, Math.max(0, newBossHP));
            if (bossHPBar.currentHP <= 0) {
                alert("Вы победили босса!");
                resetGame();
            }
        }
    });

    function summonBoss(bossId) {
        if (!gameRunning) {
            createHPBar('player-hp-bar', maxHP);
            resetGame();
            currentBoss = bossId;
            document.getElementById('player-hp-bar').classList.add('active');
            document.getElementById('boss-hp-bar').classList.add('active');
            document.querySelectorAll('.count').forEach(element => {
                element.classList.add('boss');
            });
            startRegeneration();
            document.getElementById(bossId).classList.add('active');
            bossHPBar = createHPBar('boss-hp-bar', bossesData[bossId].hp);
    
            // Сохраняем исходное значение сопротивления
            originalResistance = bossesData[bossId].resistance;
    
            // Уменьшаем сопротивление босса на значение уязвимости игрока
            bossesData[bossId].resistance -= playerVulnerability;
            console.log(`Boss resistance reduced to: ${bossesData[bossId].resistance}`);
    
            gameRunning = true;
            let intervalId = setInterval(() => {
                if (gameRunning && currentBoss) {
                    bossAttack(playerHPBar, playerArmor, playerBlock, dodgeChance, bossesData[currentBoss].damage);
                    if (playerHPBar.currentHP <= 0) {
                        alert("Вы проиграли");
                        gameRunning = false;
                        clearInterval(intervalId);
                        resetGame();
                    }
                } else {
                    clearInterval(intervalId);
                }
            }, 1000);
        }
    }

    document.getElementById('summon-boss-1').addEventListener('click', () => summonBoss('boss-1'));
    document.getElementById('summon-boss-2').addEventListener('click', () => summonBoss('boss-2'));
    document.getElementById('summon-boss-3').addEventListener('click', () => summonBoss('boss-3'));
    document.getElementById('summon-boss-4').addEventListener('click', () => summonBoss('boss-4'));
    document.getElementById('summon-boss-5').addEventListener('click', () => summonBoss('boss-5'));
    document.getElementById('summon-boss-6').addEventListener('click', () => summonBoss('boss-6'));
    document.getElementById('summon-boss-7').addEventListener('click', () => summonBoss('boss-7'));
    document.getElementById('summon-boss-8').addEventListener('click', () => summonBoss('boss-8'));
    document.getElementById('summon-boss-9').addEventListener('click', () => summonBoss('boss-9'));
    document.getElementById('summon-boss-10').addEventListener('click', () => summonBoss('boss-10'));
    document.getElementById('summon-boss-11').addEventListener('click', () => summonBoss('boss-11'));
    document.getElementById('summon-boss-12').addEventListener('click', () => summonBoss('boss-12'));
});