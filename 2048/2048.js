import {
    auth,
    signOut,
    db,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    initializeUserData,
} from "./firebase-config.js";

var board;
var score = 0;
var rows = 4;
var columns = 4;

const removeColumnBtn = document.getElementById("removeBtn");
const scrambleBoardBtn = document.getElementById("scrambleBtn");

window.onload = async function () {
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = "login-register.html";
            return;
        }

        await initializeUserData(user);

        setGame();

        document.getElementById("logoutbtn").addEventListener("click", async () => {
            await signOut(auth);
            window.location.href = "login-register.html";
        });

        setInterval(() => {
            highScore();
            updateButtonStates();
        }, 100);
    });
};

function setGame() {
    board = Array(rows).fill().map(() => Array(columns).fill(0));

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = r + "-" + c;
            updateTile(tile, 0);
            document.getElementById("board").append(tile);
        }
    }

    setTwo();
    setTwo();
    updateButtonStates();
}

function updateTile(tile, num) {
    tile.innerText = "";
    tile.classList.value = "tile";
    if (num > 0) {
        tile.innerText = num;
        tile.classList.add(num <= 4096 ? "x" + num : "x8192");
    }
}

document.addEventListener("keyup", (e) => {
    let moved = false;

    if (e.code === "ArrowLeft") {
        slideLeft();
        moved = true;
    } else if (e.code === "ArrowRight") {
        slideRight();
        moved = true;
    } else if (e.code === "ArrowUp") {
        slideUp();
        moved = true;
    } else if (e.code === "ArrowDown") {
        slideDown();
        moved = true;
    }

    if (moved) {
        setTwo();
        document.getElementById("score").innerText = score;
        updateButtonStates();

        if (isGameOver()) {
            alert("Game Over! Your score was " + score + ". Starting a new game.");
            score = 0;
            document.getElementById("score").innerText = score;
            document.getElementById("board").innerHTML = "";
            setGame();
        }
    }
});

function filterZero(row) {
    return row.filter(num => num !== 0);
}

function slide(row) {
    row = filterZero(row);
    for (let i = 0; i < row.length - 1; i++) {
        if (row[i] === row[i + 1]) {
            row[i] *= 2;
            row[i + 1] = 0;
            score += row[i];
        }
    }
    row = filterZero(row);
    while (row.length < columns) row.push(0);
    return row;
}

function slideLeft() {
    for (let r = 0; r < rows; r++) {
        board[r] = slide(board[r]);
        for (let c = 0; c < columns; c++) {
            updateTile(document.getElementById(r + "-" + c), board[r][c]);
        }
    }
}

function slideRight() {
    for (let r = 0; r < rows; r++) {
        board[r].reverse();
        board[r] = slide(board[r]);
        board[r].reverse();
        for (let c = 0; c < columns; c++) {
            updateTile(document.getElementById(r + "-" + c), board[r][c]);
        }
    }
}

function slideUp() {
    for (let c = 0; c < columns; c++) {
        let col = [board[0][c], board[1][c], board[2][c], board[3][c]];
        col = slide(col);
        for (let r = 0; r < rows; r++) {
            board[r][c] = col[r];
            updateTile(document.getElementById(r + "-" + c), board[r][c]);
        }
    }
}

function slideDown() {
    for (let c = 0; c < columns; c++) {
        let col = [board[0][c], board[1][c], board[2][c], board[3][c]].reverse();
        col = slide(col).reverse();
        for (let r = 0; r < rows; r++) {
            board[r][c] = col[r];
            updateTile(document.getElementById(r + "-" + c), board[r][c]);
        }
    }
}

function setTwo() {
    if (!hasEmptyTile()) return;

    let found = false;
    while (!found) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        if (board[r][c] === 0) {
            board[r][c] = 2;
            updateTile(document.getElementById(r + "-" + c), 2);
            found = true;
        }
    }
}

function hasEmptyTile() {
    return board.some(row => row.includes(0));
}

function isGameOver() {
    if (hasEmptyTile()) return false;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 1; c++) {
            if (board[r][c] === board[r][c + 1]) return false;
        }
    }
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 1; r++) {
            if (board[r][c] === board[r + 1][c]) return false;
        }
    }
    return true;
}

async function highScore() {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    const highScore = userDoc.data().highScore || 0;

    if (score > highScore) {
        await updateDoc(userRef, { highScore: score });
    }

    document.getElementById("highScore").innerText = Math.max(score, highScore);
}


function updateButtonStates() {
    removeColumnBtn.disabled = score < 800;
    scrambleBoardBtn.disabled = score < 1000;
}


removeColumnBtn.addEventListener("click", () => {
    if (score < 800) {
        alert("Not enough score to remove a column!");
        return;
    }

    let col = Math.floor(Math.random() * columns);

    for (let r = 0; r < rows; r++) {
        const tile = document.getElementById(r + "-" + col);
        tile.classList.add("fade-out");
    }

    setTimeout(() => {
        for (let r = 0; r < rows; r++) {
            board[r][col] = 0;
            const tile = document.getElementById(r + "-" + col);
            updateTile(tile, 0);
            tile.classList.remove("fade-out");
        }

        score -= 800;
        document.getElementById("score").innerText = score;
        updateButtonStates();
    }, 500); 
});



scrambleBoardBtn.addEventListener("click", () => {
    if (score < 1000) {
        alert("Not enough score to scramble the board!");
        return;
    }

    let nonZero = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] !== 0) {
                nonZero.push(board[r][c]);
                board[r][c] = 0;
            }
        }
    }

    
    for (let i = nonZero.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nonZero[i], nonZero[j]] = [nonZero[j], nonZero[i]];
    }

    
    let index = 0;
    while (index < nonZero.length) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        if (board[r][c] === 0) {
            board[r][c] = nonZero[index];
            index++;
        }
    }

   
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            const tile = document.getElementById(r + "-" + c);
            updateTile(tile, board[r][c]);
            tile.classList.add("pulse");
            setTimeout(() => tile.classList.remove("pulse"), 500);
        }
    }

    score -= 1000;
    document.getElementById("score").innerText = score;
    updateButtonStates();
});
