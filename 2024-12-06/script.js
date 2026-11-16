const GAME_LENGTH = 20;
const GAME_CYCLE = 1;

class Game {

    constructor(playerName, callbackOnFinish = null) {
        this.score = 0;
        this.playerName = playerName;

        this.activeCell = null;
        this.callbackOnFinish = callbackOnFinish;

        this.elapsedTime = 0;

        this.handleClick = () => {
            this.score++;
        }

        this.interval = setInterval(() => {
            this.elapsedTime += GAME_CYCLE;
            if (this.elapsedTime >= GAME_LENGTH) this.terminateGame();
            this.gameLoop();
        }, GAME_CYCLE * 1000);
        this.gameLoop();
    }

    terminateGame() {
        clearInterval(this.interval);
        this.interval = null;
        if (this.activeCell) this.activeCell.classList.remove('currentCell');
        if (this.callbackOnFinish) this.callbackOnFinish();
    }

    gameLoop() {
        if (this.activeCell) {
            this.activeCell.classList.remove('currentCell');
            this.activeCell.removeEventListener('click', this.handleClick);
        }

        const celle = document.querySelectorAll("#gameArea table tr td");
        
        this.activeCell = celle[Math.floor(Math.random() * 10)];
        this.activeCell.classList.add('currentCell');
        this.activeCell.addEventListener('click', this.handleClick);
    }
}

class Partita {
    constructor(nome, punteggio) {
        this.nome = nome;
        this.punteggio = punteggio;
    }

    asTableRow() {
        const tableRow = document.createElement('tr');
        tableRow.innerHTML = '<td>'+this.nome+'</td><td>'+this.punteggio+'</td>';
        return tableRow;
    }
}

class GameHandler {
    constructor() {
        /** @type {Partita[]} */
        this.partite = [];

        this.handleInput = () => {
            document.getElementById('startGameButton').disabled = !this.checkInputValidity();
        };

        document.getElementById('dataInput').addEventListener('submit', (event) => {
            event.preventDefault();
            this.startNewGame();
        });
        
        document.querySelector('input').addEventListener('input',this.handleInput);
        this.handleInput();
        this.currentGame = null;
        this.currentPlayerName = null;
    }

    checkInputValidity() {
        const regex = /[A-Z][a-zA-Z]{2,9}/;
        const inputElem = document.querySelector('input');
        if (regex.test(inputElem.value)) {
            inputElem.setCustomValidity('');
        } else {
            inputElem.setCustomValidity('Il nome deve avere una lunghezza tra 3 e 10 caratteri e deve iniziare per una lettera maiuscola');
            return false;
        }

        for (let partita of this.partite) {
            if (partita.nome === inputElem.value) {
                inputElem.setCustomValidity('Il nome non può essere già presente');
                return false;
            }
        }
        return true;
    }

    startNewGame() {
        if (!this.checkInputValidity()) return;
        const inputElem = document.querySelector('input');
        this.currentGame = new Game(inputElem.value, () => {this.terminateOldGame();});
        document.getElementById('dataInput').classList.add('hidden');
        inputElem.value = '';
        document.getElementById('gameArea').classList.remove('hidden');
    }

    refreshScoreTable() {
        const tableBody = document.querySelector('#scoreSection table tbody');
        tableBody.innerHTML = '';
        this.partite.forEach((partita) => {
            tableBody.appendChild(partita.asTableRow());
        });
    }

    terminateOldGame() {
        if (this.currentGame === null) return;
        this.partite.push(new Partita(this.currentGame.playerName,this.currentGame.score));
        this.currentGame = null;
        document.getElementById('gameArea').classList.add('hidden');
        document.getElementById('dataInput').classList.remove('hidden');
        this.refreshScoreTable();
    }
}

const gestore = new GameHandler();