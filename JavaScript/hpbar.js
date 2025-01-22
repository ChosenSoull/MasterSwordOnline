function createHPBar(elementId, maxHP) {
    const hpBar = document.getElementById(elementId);
    hpBar.style.width = '300px';
    hpBar.style.height = '45px';
    hpBar.style.border = '4px solid rgb(209, 23, 39)';
    hpBar.style.margin = '10px auto';
    hpBar.style.position = 'relative';
    hpBar.maxHP = maxHP;
    hpBar.currentHP = maxHP;
    hpBar.inner = hpBar.querySelector('.hp-inner');
    hpBar.counter = hpBar.querySelector('.hp-counter');
    return hpBar;
}

function updateHPBar(hpBar, currentHP) {
    hpBar.currentHP = currentHP;
    const percentage = (currentHP / hpBar.maxHP) * 100;
    hpBar.inner.style.width = percentage + '%';
    if(percentage < 100){
        hpBar.inner.classList.add("low");
    } else {
        hpBar.inner.classList.remove("low");
    }
    if(percentage < 25) hpBar.inner.style.backgroundColor = 'red';
    else if (percentage < 50) hpBar.inner.style.backgroundColor = 'orange';
    else hpBar.inner.style.backgroundColor = '#00a800';
    hpBar.counter.textContent = currentHP;
}