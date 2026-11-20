const LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

class GameObject {
    constructor(canvasWidth) {
        this.x = Math.floor((Math.random() * canvasWidth * 0.9) + (canvasWidth * 0.05));
        this.y = 0;

        this.vx = 0;
        this.vy = 100;

        this.omega = (Math.random() * 0.5) + 0.5;

        this.rotation = Math.random() * 2 * Math.PI;

        this.letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];

    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.font = '80px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = (this.vy > 0)?'#ff0000':'#00ff00';
        ctx.fillText(this.letter, 0, 0);
        ctx.restore();
    }

    /**
     * 
     * @param {number} timeDelta 
     */
    simulate(timeDelta) {
        const dtSeconds = timeDelta / 1000;
        this.x += dtSeconds * this.vx;
        this.y += dtSeconds * this.vy;
        this.rotation += dtSeconds * this.omega;
    }
}

class Bouncer {
    constructor(canvasHeight, canvasWidth) {
        this.x = canvasWidth / 2;
        this.y = canvasHeight - 40;

        this.vx = 0;
        this.vy = 0;
        this.speed = 200;
        
        this.keys = {
            left: false,
            right: false
        };

        this.width = 200;
        this.height = 20;

        this.canvasWidth = canvasWidth;

        window.addEventListener('keydown', (ev) => {
            switch (ev.key) {
                case 'a': {
                    this.keys.left = true;
                    break;
                }
                case 'd': {
                    this.keys.right = true;
                    break;
                }                
            };
            this.updateVelocity();
        });
        window.addEventListener('keyup', (ev) => {
            switch (ev.key) {
                case 'a': {
                    this.keys.left = false;
                    break;
                }
                case 'd': {
                    this.keys.right = false;
                    break;
                }
            }
            this.updateVelocity();
        });
    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(-this.width / 2,0,this.width,this.height);
        ctx.restore();
    }

    updateVelocity() {
        if (this.keys.left && !this.keys.right) {
            this.vx = -this.speed;
        } else if (this.keys.right && !this.keys.left) {
            this.vx = this.speed;
        } else {
            this.vx = 0;
        }
    }

    /**
     * 
     * @param {number} timeDelta 
     */
    simulate(timeDelta) {
        const dtSeconds = timeDelta / 1000;
        this.x += dtSeconds * this.vx;
        this.y += dtSeconds * this.vy;
        if (this.x < this.width / 2) {
            this.x = this.width / 2;
        }
        if (this.x >= this.canvasWidth - (this.width / 2)) {
            this.x = this.canvasWidth - (this.width / 2);
        }    
    }

    checkCollision(x, y) {
        const boundingBox = {
            up: this.y + (this.height / 2),
            right: this.x + (this.width / 2),
            down: this.y - (this.height / 2),
            left: this.x - (this.width / 2)
        };
        if (
            (x >= boundingBox.left) &&
            (x <= boundingBox.right) &&
            (y >= boundingBox.down) && 
            (y <= boundingBox.up)
        ) return true;
        return false;
    }
}

class Game {
    /**
     * 
     * @param {string} parole 
     */
    constructor(parole) {
        this.paroleUpper = parole.toLocaleUpperCase();
        this.chars = parole
            .toLocaleUpperCase()
            .replaceAll(' ', '')
            .split('');
        this.currentChar = 0;

        /** @type {GameObject[]} */
        this.gameObjects = [];
        this.interval = setInterval(() => {
            this.spawnObject();
        }, 1000);

        this.canvas = document.querySelector('canvas');
        this.animate = this.animate.bind(this);

        this.bouncer = new Bouncer(this.canvas.height, this.canvas.width);
        
        this.animation = requestAnimationFrame(this.animate);

        this.refreshProgress();
    }

    spawnObject() {
        this.gameObjects.push(new GameObject(this.canvas.width));
    }

    refreshProgress() {
        const container = document.getElementById('gameSection').querySelector('div');
        const progress = document.createElement('h3');
        const parole = document.createElement('h3');
        container.innerHTML = '';
        if (this.currentChar !== this.chars.length) {
            parole.innerText = 'Parole: ' + this.paroleUpper;
        } else {
            parole.innerText = 'COMPLETATO!';
        }
        progress.innerText = 'Progresso: ' + this.currentChar + '/' + this.chars.length;
        container.append(parole, progress);
    }

    animate(timestamp) {
        if (this.elapsedTime === undefined) this.elapsedTime = 0;
        const deltaTime = timestamp - this.elapsedTime;
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.bouncer.simulate(deltaTime);
        this.gameObjects.forEach((obj) => {
            obj.simulate(deltaTime);
        });
        this.gameObjects.forEach((obj) => {
            if (this.bouncer.checkCollision(obj.x, obj.y)) {
                obj.vy = -100;
                if (obj.letter === this.chars[this.currentChar]) {
                    this.currentChar++;
                    this.refreshProgress();
                }
                if (this.currentChar === this.chars.length) {
                    this.finished = true;
                    this.destroy();
                }
            }
        });
        this.gameObjects = this.gameObjects.filter((obj) => {
            return (obj.y >= 0) && (obj.y < this.canvas.height);
        });
        this.bouncer.draw(ctx);
        this.gameObjects.forEach((obj) => {
            obj.draw(ctx);
        });
        this.elapsedTime = timestamp;
        this.animation = requestAnimationFrame(this.animate);
    }

    destroy() {
        this.canvas.getContext('2d').clearRect(0,0,this.width, this.height);
        clearInterval(this.interval);
        cancelAnimationFrame(this.animation);
    }
};

class GameHandler {
    constructor() {
        this.form = document.querySelector('form');
        const button = this.form.querySelector('button');
        this.form.oninput = () => {
            button.disabled = !this.checkInput();
        };
        this.form.onsubmit = (ev) => {
            ev.preventDefault();
            this.game = new Game(this.form.querySelector('input').value);
            document.getElementById('inputSection').classList.add('hidden');
            document.getElementById('gameSection').classList.remove('hidden');
        };
    }

    checkInput() {
        const input = this.form.querySelector('input');
        const regex = /^[A-Za-z][a-z]{2,5}( [A-Za-z][a-z]{2,5}){3}$/;
        const debugRegex = /^[A-Za-z]+$/
        const regexTest = debugRegex.test(input.value);
        if (regexTest) input.setCustomValidity('');
        else input.setCustomValidity('Le parole devono essere lunghe tra 3 e 6 caratteri e contenere solo lettere minuscole ad eccezione dell\'iniziale');
        return regexTest;
    }
};

const handler = new GameHandler();