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

    let damage = calculateBossDamage(bossDamage, playerArmor, block);
    updateHPBar(playerHPBar, playerHPBar.currentHP - damage);
}
