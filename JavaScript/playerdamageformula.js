function calculatePlayerDamage(baseDamage, clickBonus, bossArmor, bossResistance) {
    const constant = 300;
    let damageWithBonus = baseDamage + clickBonus;
    let armorReduction = 1 / (1 + bossArmor / constant);

    // Корректируем сопротивление в диапазоне от 0 до 100 и учитываем отрицательные значения
    let resistanceReduction;
    if (bossResistance < 0) {
        resistanceReduction = 1 + Math.abs(bossResistance) / 100; // Увеличиваем урон для отрицательных значений
    } else if (bossResistance <= 100) {
        resistanceReduction = 1 - bossResistance / 100; // Уменьшаем урон для положительных значений до 100%
    } else {
        resistanceReduction = 0; // Урон полностью поглощается при сопротивлении больше 100%
    }

    let finalDamage = damageWithBonus * resistanceReduction * armorReduction;
    return Math.max(0, Math.floor(finalDamage)); // Возвращаем целое число
}

