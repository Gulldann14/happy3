document.addEventListener("DOMContentLoaded", () => {
    
    // === 1. АНИМАЦИЯ ПОЯВЛЕНИЯ ПРИ СКРОЛЛЕ ===
    const reveals = document.querySelectorAll('.reveal');
    const revealOptions = { threshold: 0.15 };
    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, revealOptions);
    reveals.forEach(reveal => revealOnScroll.observe(reveal));

    // === 2. ЭФФЕКТ ПЕЧАТНОЙ МАШИНКИ ===
    const letterText = "Дорогая мама! Я хочу сказать тебе спасибо за всё. За твою любовь, за терпение, за то, что ты всегда верила в меня, даже когда я сам в себя не верил. Ты — мой самый близкий и родной человек. Я очень тебя люблю и желаю тебе крепкого здоровья, счастья и чтобы каждый твой день был наполнен радостью.";
    const typewriterElement = document.getElementById("typewriter");
    let charIndex = 0;
    let typingStarted = false;

    const letterSection = document.querySelector('.letter-section');
    const startTypingObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !typingStarted) {
            typingStarted = true;
            typeLetter();
        }
    }, { threshold: 0.5 });
    startTypingObserver.observe(letterSection);

    function typeLetter() {
        if (charIndex < letterText.length) {
            typewriterElement.textContent += letterText.charAt(charIndex);
            charIndex++;
            setTimeout(typeLetter, 40);
        }
    }

    // === 3. ФОНОВЫЕ ЧАСТИЦЫ (CANVAS) ===
    const canvas = document.getElementById("bg-canvas");
    const ctx = canvas.getContext("2d");
    let width, height;
    let particles = [];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.5;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.opacity = Math.random() * 0.5 + 0.1;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
        }
        draw() {
            ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < 100; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();

    // === 4. КНОПКА САЛЮТ ===
    const btn = document.getElementById("celebrate-btn");
    const surpriseText = document.getElementById("surprise-text");

    btn.addEventListener("click", () => {
        btn.style.display = 'none';
        surpriseText.innerHTML = "Я тебя очень сильно люблю! ❤️";
        surpriseText.style.opacity = "1";
        
        for(let i = 0; i < 50; i++) {
            let p = new Particle();
            p.x = width / 2;
            p.y = height / 2;
            p.speedX = (Math.random() - 0.5) * 15;
            p.speedY = (Math.random() - 0.5) * 15;
            p.size = Math.random() * 4 + 1;
            p.opacity = 1;
            particles.push(p);
            setTimeout(() => particles.splice(particles.indexOf(p), 1), 2000);
        }
    });

    // === 5. ИГРА 3 В РЯД ===
    const boardElement = document.getElementById('game-board');
    const scoreElement = document.getElementById('score');
    const resetBtn = document.getElementById('reset-game');
    
    const rows = 6;
    const cols = 6;
    const emojis = ['💎', '💖', '⭐', '🌸', '🍀', '🌙'];
    let board = [];
    let score = 0;
    let selectedTile = null;
    let isProcessing = false; // Защита от кликов во время падения

    function createBoard() {
        board = [];
        for (let r = 0; r < rows; r++) {
            let row = [];
            for (let c = 0; c < cols; c++) {
                row.push(emojis[Math.floor(Math.random() * emojis.length)]);
            }
            board.push(row);
        }
        
        // Убираем начальные совпадения
        let safetyCounter = 0;
        while (checkAllMatches().length > 0 && safetyCounter < 50) {
            board = [];
            for (let r = 0; r < rows; r++) {
                let row = [];
                for (let c = 0; c < cols; c++) {
                    row.push(emojis[Math.floor(Math.random() * emojis.length)]);
                }
                board.push(row);
            }
            safetyCounter++;
        }
    }

    function renderBoard() {
        boardElement.innerHTML = '';
        board.forEach((row, r) => {
            row.forEach((emoji, c) => {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                tile.innerText = emoji;
                tile.dataset.r = r;
                tile.dataset.c = c;
                
                if (selectedTile && selectedTile.r === r && selectedTile.c === c) {
                    tile.classList.add('selected');
                }

                tile.addEventListener('click', () => handleTileClick(r, c));
                boardElement.appendChild(tile);
            });
        });
    }

    function handleTileClick(r, c) {
        if (isProcessing) return;

        if (!selectedTile) {
            selectedTile = { r, c };
            renderBoard();
        } else {
            if (selectedTile.r === r && selectedTile.c === c) {
                selectedTile = null;
                renderBoard();
                return;
            }

            const isAdjacent = Math.abs(selectedTile.r - r) + Math.abs(selectedTile.c - c) === 1;

            if (isAdjacent) {
                const r1 = selectedTile.r, c1 = selectedTile.c;
                swapTiles(r1, c1, r, c);
                selectedTile = null;
                renderBoard();

                setTimeout(() => {
                    if (checkAllMatches().length > 0) {
                        isProcessing = true;
                        processMatches(checkAllMatches());
                    } else {
                        // Если нет совпадений, меняем обратно
                        swapTiles(r1, c1, r, c);
                        renderBoard();
                    }
                }, 200);
            } else {
                selectedTile = { r, c };
                renderBoard();
            }
        }
    }

    function swapTiles(r1, c1, r2, c2) {
        const temp = board[r1][c1];
        board[r1][c1] = board[r2][c2];
        board[r2][c2] = temp;
    }

    function checkAllMatches() {
        let matches = new Set();
        
        // Горизонтальные
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols - 2; c++) {
                if (board[r][c] && board[r][c] === board[r][c+1] && board[r][c] === board[r][c+2]) {
                    matches.add(`${r},${c}`); matches.add(`${r},${c+1}`); matches.add(`${r},${c+2}`);
                }
            }
        }
        
        // Вертикальные
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows - 2; r++) {
                if (board[r][c] && board[r][c] === board[r+1][c] && board[r][c] === board[r+2][c]) {
                    matches.add(`${r},${c}`); matches.add(`${r+1},${c}`); matches.add(`${r+2},${c}`);
                }
            }
        }
        return Array.from(matches).map(str => str.split(',').map(Number));
    }

// Добавляем переменные для наград
let currentMilestone = 0;
const milestones = [
    { score: 30, text: "Мама, ты просто космос! ✨" },
    { score: 100, text: "Настоящий гений комбинаций! 👑" },
    { score: 200, text: "Ты лучшая мама на свете! ❤️" }
];

function processMatches(matches) {
    score += matches.length * 10;
    scoreElement.innerText = score;

    // Проверяем, не достигла ли мама нового рубежа
    if (currentMilestone < milestones.length && score >= milestones[currentMilestone].score) {
        showReward(milestones[currentMilestone].text);
        currentMilestone++;
    }

    matches.forEach(([r, c]) => {
        const tiles = document.querySelectorAll(`.tile[data-r="${r}"][data-c="${c}"]`);
        if(tiles[0]) tiles[0].classList.add('pop');
    });

    setTimeout(() => {
        matches.forEach(([r, c]) => { board[r][c] = null; });

        for (let c = 0; c < cols; c++) {
            let emptySpaces = 0;
            for (let r = rows - 1; r >= 0; r--) {
                if (board[r][c] === null) {
                    emptySpaces++;
                } else if (emptySpaces > 0) {
                    board[r + emptySpaces][c] = board[r][c];
                    board[r][c] = null;
                }
            }
            for (let r = 0; r < emptySpaces; r++) {
                board[r][c] = emojis[Math.floor(Math.random() * emojis.length)];
            }
        }

        renderBoard();

        setTimeout(() => {
            const newMatches = checkAllMatches();
            if (newMatches.length > 0) {
                processMatches(newMatches);
            } else {
                isProcessing = false;
            }
        }, 300);

    }, 300);
}

    function resetGame() {
        score = 0;
        scoreElement.innerText = score;
        selectedTile = null;
        isProcessing = false;
        createBoard();
        renderBoard();
    }
// Функция показа награды и запуска золотого взрыва
function showReward(text) {
    let toast = document.getElementById('reward-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'reward-toast';
        toast.className = 'reward-toast';
        document.body.appendChild(toast);
    }
    
    toast.innerText = text;
    
    // Показываем плашку
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Прячем через 3.5 секунды
    setTimeout(() => toast.classList.remove('show'), 3500);

    // Запускаем золотой взрыв частиц (используем движок из нашего фона)
    for(let i = 0; i < 80; i++) {
        let p = new Particle();
        p.x = width / 2;
        p.y = height / 2;
        p.speedX = (Math.random() - 0.5) * 20;
        p.speedY = (Math.random() - 0.5) * 20;
        p.size = Math.random() * 4 + 1;
        p.opacity = 1;
        particles.push(p);
        
        // Удаляем частицы взрыва через 2 секунды, чтобы не грузить браузер
        setTimeout(() => {
            const idx = particles.indexOf(p);
            if (idx > -1) particles.splice(idx, 1);
        }, 2000);
    }
}

    resetBtn.addEventListener('click', resetGame);
    resetGame();

});
