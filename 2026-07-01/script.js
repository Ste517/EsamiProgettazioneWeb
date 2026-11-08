class Game {
    constructor () {
        this.grid = [];
        for (let i = 0; i < 4; i++) {
            this.grid.push([]);
            for (let j = 0; j < 6; j++) {
                this.grid[i].push('');
            }
        }
        this.refreshTable();
        this.punteggio = 0;
    }

    refreshTable() {
        const tableBodyElem = document.getElementsByTagName('table')[0].children[0];
        for (let i = 0; i < 4; i++) {
            const row = tableBodyElem.children[i+1];
            for (let j = 0; j < 6; j++) {
                row.children[j].innerText = this.grid[i][j];
            }
        }
    }

    static getRandomEntry() {
        return ['0','1','2','3','4','5','6','7','8','9','*'][Math.floor(Math.random()*11)];
    }

    static get columns() {
        return ['a','s','d','f','g','h'];
    }

    place(col, char) {
        for (let i = 3; i >= 0; i--) {
            if (this.grid[i][col] == '') {
                let hasCleared = false;
                for (let j = 0; j < 4; j++) {
                    if (this.grid[j][col] == '') continue;
                    if (!(char === '*') && this.grid[j][col] !== char && this.grid[j][col] !== '*') break;
                    this.grid[j][col] = '';
                    hasCleared = true;
                    break;
                }
                if (hasCleared) this.punteggio++;
                else this.grid[i][col] = char;
                this.refreshTable();
                return true;
            }
        }
        this.refreshTable();
        return false;
    }
}

class GameHandler {
    constructor () {
        this.game = null;
    }

    startNewGame() {
        document.getElementById('score').innerText = '';
        this.game = new Game();
        this.nextEntry = Game.getRandomEntry();
        this.listenerFunction = (event = null) => {
            let col;
            if (event === null) {
                col = Math.floor(Math.random() * 6);
            } else {
                col = Game.columns.findIndex((val) => val === event.key);
                
                if (col != -1) {
                    clearInterval(this.interrupt);
                    this.interrupt = setInterval(this.listenerFunction, 1000);
                } else {
                    return;
                }
            }
            if (!this.game.place(col,this.nextEntry)) {
                this.endGame();
            } else {
                this.nextEntry = Game.getRandomEntry();
                document.getElementById('nextSymbol').innerText = 'Prossimo simbolo: ' + this.nextEntry;
            }
        };
        document.getElementById('nextSymbol').innerText = 'Prossimo simbolo: ' + this.nextEntry;
        this.interrupt = setInterval(this.listenerFunction, 1000);
        document.addEventListener('keypress',this.listenerFunction);
    }

    endGame() {
        clearInterval(this.interrupt);
        document.removeEventListener('keypress',this.listenerFunction);
        this.listenerFunction = null;
        document.getElementById('score').innerText = "Hai fatto " + this.game.punteggio + " punti";
        this.game = null;
    }
}

const game = new GameHandler();
document.getElementById('startButton').addEventListener('click', () => {game.startNewGame();})