function calculateBossDamage(bossDamage, playerArmor, block, dodge, regeneration) {
    const constant = 300;
    let armorReduction = 1 - (playerArmor / (playerArmor + constant));
    let blockReduction = 1 - block;
    let dodgeReduction = 1 - dodge;

    let receivedDamage = bossDamage * armorReduction * blockReduction * dodgeReduction - regeneration;
    return Math.max(0, Math.floor(receivedDamage));
}