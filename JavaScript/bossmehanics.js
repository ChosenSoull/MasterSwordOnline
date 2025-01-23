function bossAttack(playerHPBar, playerArmor, block, dodge, bossDamage) {
    let damage = calculateBossDamage(bossDamage, playerArmor, block, dodge);
    updateHPBar(playerHPBar, playerHPBar.currentHP - damage);
}