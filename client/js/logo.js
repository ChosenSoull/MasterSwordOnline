function addShrinkEffect(buttonId, url) {
    const button = document.getElementById(buttonId);
    button.addEventListener('click', () => {
        button.classList.add('shrink');
        setTimeout(() => {
            window.location.href = url;
        }, 200); // 200 миллисекунд соответствует длительности transition
    });

    button.addEventListener('transitionend', (event) => {
        if (event.propertyName === 'transform') {
            button.classList.remove('shrink'); // сброс анимации после завершения
        }
    });
}

addShrinkEffect('purpleButton', 'https://discord.gg/UG36uSMmx8');
addShrinkEffect('grayButton', 'https://github.com/ChosenSoull/MasterSwordOnline');
addShrinkEffect('blueButton', 'https://t.me/mastersword_bot');