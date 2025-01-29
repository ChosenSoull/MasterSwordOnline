function isDodgeSuccessful(dodgeChance) {
    const randomValue = parseFloat((Math.random() * 100).toFixed(2));
    return dodgeChance > randomValue;
}

function bossAttack(playerHPBar, playerArmor, block, dodgeChance, bossDamage) {
    if (isDodgeSuccessful(dodgeChance)) {
        console.log("Игрок успешно уклонился от атаки!");
        updateHPBar(playerHPBar, playerHPBar.currentHP - 0);
        return;
    }
    if (isPlayerInvisible) {
        updateHPBar(playerHPBar, playerHPBar.currentHP - 0);
        console.log("Игрок невидим, босс промахивается.");
        return;
    }

    let damage = calculateBossDamage(bossDamage, playerArmor, block);
    updateHPBar(playerHPBar, playerHPBar.currentHP - damage);
}
