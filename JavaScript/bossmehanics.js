function bossAttack(playerHPBar, playerArmor, block, dodge, regeneration, bossDamage) {
    let damage = calculateBossDamage(bossDamage, playerArmor, block, dodge, regeneration);
    updateHPBar(playerHPBar, playerHPBar.currentHP - damage);
}