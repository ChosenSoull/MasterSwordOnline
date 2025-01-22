function calculatePlayerDamage(baseDamage, clickBonus, bossArmor, bossResistance) {
    const constant = 300;
    let damageWithBonus = baseDamage + (clickBonus);
    let armorReduction = 1 / (1 + bossArmor / constant);
    let resistanceReduction = 1 - bossResistance;
    let finalDamage = damageWithBonus * resistanceReduction * armorReduction;
    return Math.max(0, Math.floor(finalDamage)); // Возвращаем целое число
}