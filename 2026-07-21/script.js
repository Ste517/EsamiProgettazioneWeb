class Tournament {
    static #Game = class {
        /** @type {(winnerName: string) => void} */
        onwin = null;

        constructor(player1 = null, player2 = null, player1Game = null, player2Game = null) {
            this.player1 = player1;
            this.player2 = player2;
            this.player1Game = player1Game;
            this.player2Game = player2Game;
            this.winner = null;
        }

        startGame() {
            if (this.winner || !this.player1 || !this.player2) return;
            const bottoni = this.displayElement.querySelectorAll('button');
            
            bottoni[0].textContent = this.player1;
            bottoni[1].textContent = this.player2;
            bottoni[0].classList.remove('empty');
            bottoni[1].classList.remove('empty');
            bottoni[0].classList.add('ongoing');
            bottoni[1].classList.add('ongoing');
            bottoni[0].disabled = false;
            bottoni[1].disabled = false;

            const handleWin = (winnerIndex) => {
                const loserIndex = winnerIndex === 0 ? 1 : 0;
                this.winner = winnerIndex === 0 ? this.player1 : this.player2;

                bottoni[0].onclick = null;
                bottoni[1].onclick = null;
                bottoni[0].disabled = true;
                bottoni[1].disabled = true;
                bottoni[0].classList.remove('ongoing');
                bottoni[1].classList.remove('ongoing');
                bottoni[winnerIndex].classList.add('won');
                bottoni[loserIndex].classList.add('lost');

                if (this.onwin) {
                    this.onwin(this.winner);
                }
            };

            bottoni[0].onclick = () => handleWin(0);
            bottoni[1].onclick = () => handleWin(1);
        }

        hasFinished() {
            return this.winner !== null;
        }

        generateDisplayElement() {
            const container = document.createElement('div');
            container.classList.add('flex-container', 'col', 'small');

            const p1btn = document.createElement('button');
            const p2btn = document.createElement('button');

            p1btn.textContent = this.player1 || 'TBD';
            p2btn.textContent = this.player2 || 'TBD';

            if (!this.player1) p1btn.classList.add('empty');
            if (!this.player2) p2btn.classList.add('empty');

            p1btn.disabled = true;
            p2btn.disabled = true;

            container.append(p1btn, p2btn);
            this.displayElement = container;
            return container;
        }
    };

    #games = null;

    #buildTree(level = 0) {
        if (level < 0 || level >= this.treeSize) return null;

        if (level === this.treeSize - 1) {
            return new Tournament.#Game(
                this.players[this.currentPlayer++],
                this.players[this.currentPlayer++]
            );
        }

        const game = new Tournament.#Game();
        game.player1Game = this.#buildTree(level + 1);
        game.player1Game.onwin = (winner) => {
            game.player1 = winner;
            this.#checkPlayableLevel(this.#games);
        };
        game.player2Game = this.#buildTree(level + 1);
        game.player2Game.onwin = (winner) => {
            game.player2 = winner;
            this.#checkPlayableLevel(this.#games);
        };
        return game;
    }

    #buildTreeVisualElement(rootElement, game, level = 0) {
        if (level < 0 || level >= this.treeSize || game === null) return;
        this.#buildTreeVisualElement(rootElement, game.player1Game, level + 1);
        rootElement.childNodes[this.treeSize - 1 - level].appendChild(game.generateDisplayElement());
        this.#buildTreeVisualElement(rootElement, game.player2Game, level + 1);
    }

    #checkPlayableLevel(tree) {
        if (tree === null) return 0;
        let unfinishedGames = 0;
        if (tree.player1Game) unfinishedGames += this.#checkPlayableLevel(tree.player1Game);
        if (tree.player2Game) unfinishedGames += this.#checkPlayableLevel(tree.player2Game);
        if (unfinishedGames === 0) tree.startGame();
        unfinishedGames += !tree.hasFinished() ? 1 : 0;
        return unfinishedGames;
    }

    /** @param {string[]} players */
    constructor(players) {
        if (!Array.isArray(players) || players.length < 2) {
            throw new Error('Players must be an array with at least 2 players');
        }

        const treeSize = Math.log2(players.length);
        if (!Number.isInteger(treeSize)) {
            throw new Error('Number of players must be a power of two');
        }

        this.treeSize = treeSize;
        this.players = [...players].sort(() => Math.random() - 0.5);
        this.currentPlayer = 0;
        this.#games = this.#buildTree(0);

        this.visualRoot = document.createElement('div');
        this.visualRoot.classList.add('flex-container', 'row', 'large');
        for (let i = 0; i < this.treeSize; i++) {
            const column = document.createElement('div');
            column.classList.add('flex-container', 'column', 'large');
            this.visualRoot.appendChild(column);
        }

        this.#buildTreeVisualElement(this.visualRoot, this.#games, 0);
        this.#checkPlayableLevel(this.#games);
    }
}

class FormHandler {
    constructor() {
        /** @type {HTMLFormElement} */
        this.form = document.querySelector('form');
        /** @type {HTMLInputElement[]} */
        this.formInputs = [];
        for (let i = 1; i < 9; i++) {
            this.formInputs.push(this.form['g' + i]);
        }

        this.form.oninput = () => {
            const isValid = this.validateAllInputs();
            this.form.querySelector('button').disabled = !isValid;
        };

        this.form.onsubmit = (event) => {
            event.preventDefault();
            const giocatori = this.formInputs.map((input) => input.value);
            this.tournament = new Tournament(giocatori);
            document.body.appendChild(this.tournament.visualRoot); // Attach bracket to DOM
        };
    }

    validateAllInputs() {
        const regex = /^[A-Z][a-z]{2,9}$/;
        const errMsg = document.getElementById('errMsg');
        let allFormatValid = true;
        let hasDuplicates = false;

        for (const input of this.formInputs) {
            if (!regex.test(input.value)) {
                input.setCustomValidity('Il nome deve avere tra 3 e 10 lettere, con la prima lettera maiuscola');
                allFormatValid = false;
            } else {
                input.setCustomValidity('');
            }
        }

        for (let i = 0; i < this.formInputs.length; i++) {
            for (let j = i + 1; j < this.formInputs.length; j++) {
                if (
                    this.formInputs[i].value !== '' &&
                    this.formInputs[i].value === this.formInputs[j].value
                ) {
                    this.formInputs[i].setCustomValidity('I nomi dei partecipanti devono essere diversi');
                    this.formInputs[j].setCustomValidity('I nomi dei partecipanti devono essere diversi');
                    hasDuplicates = true;
                }
            }
        }

        errMsg.innerText = hasDuplicates ? 'I nomi dei partecipanti devono essere diversi' : '';
        return allFormatValid && !hasDuplicates;
    }
}

const handler = new FormHandler();