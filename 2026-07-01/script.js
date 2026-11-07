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
}

class GameHandler {
    constructor () {
        this.game = null;
    }

    startNewGame() {
        this.game = new Game();
        this.listenerFunction = (event) => {
            console.log(event.key);
            console.log(this.game);
        };
        document.addEventListener('keypress',this.listenerFunction);
    }

    endGame() {
        document.removeEventListener('keypress',this.listenerFunction);
        this.listenerFunction = null;
        this.game = null;
    }
}

const game = new GameHandler();