function calculateBossDamage(bossDamage, playerArmor, block) {
    const constant = 300;
    let armorReduction = 1 - (playerArmor / (playerArmor + constant));
    let blockReduction = 1 - block;

    let receivedDamage = bossDamage * armorReduction * blockReduction;
    return Math.max(0, Math.floor(receivedDamage));
}
