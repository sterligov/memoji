'use strict'

const MATCHED = 1;
const NOT_MATCHED = -1;
const NEUTRAL = 0;
const CARDS_NUMBER = 6;


function Card(cardElement) {
    let classes = cardElement.className.split(' ');
    if (classes[0] !== undefined && classes[0] === "") {
        this.card = cardElement.getElementsByClassName('card')[0];
    } else if (classes.indexOf('card') != -1) {
        this.card = cardElement;
    } else {
        this.card = cardElement.parentElement;
    }
    this.cardBack = this.card.getElementsByClassName('card-back')[0];
    this.emoji = this.cardBack.innerHTML;
};

Card.prototype.rotate = function() {
    let classes = this.card.className.split(' ');
    if (classes.indexOf('shirt-down') != -1) {
        this.card.classList.remove('shirt-down');
        this.card.classList.add('shirt-up');
    } else {
        this.card.classList.remove('shirt-up');
        this.card.classList.add('shirt-down');
    }
};

Card.prototype.setState = function(state) {
    if (state == MATCHED) {
        this.cardBack.classList.add('match-card');
    } else if (state == NOT_MATCHED) {
        this.cardBack.classList.add('not-match-card');
    } else {
        this.cardBack.classList.remove('not-match-card');
        this.cardBack.classList.remove('match-card');
    }
};

Card.prototype.isDisabled = function() {
    let classes = this.cardBack.className.split(' ');
    return classes.indexOf('match-card') != -1 || classes.indexOf('not-match-card') != -1;
};

Card.prototype.isShirtUp = function() {
    let classes = this.card.className.split(' ');
    return classes.indexOf('shirt-down') == -1;
};

Card.prototype.isShirtDown = function() {    
    let classes = this.card.className.split(' ');
    return classes.indexOf('shirt-down') != -1;
};

function Game() {
    this.selectedCards = [];
    this.matched = 0;
};

Game.prototype.process = function(card) {
    if (!card.isDisabled()) {
        card.rotate();
        if (card.isShirtUp()) {
            this.selectedCards = [];
            return;
        }

        if (this.selectedCards.length == 1) {
            if (card.emoji === this.selectedCards[0].emoji) {
                card.setState(MATCHED);
                this.selectedCards[0].setState(MATCHED);
                this.selectedCards = []
                this.matched++;
                if (this.matched == CARDS_NUMBER) {
                    this.end();
                }
            } else {
                card.setState(NOT_MATCHED);
                this.selectedCards[0].setState(NOT_MATCHED);
                this.selectedCards.push(card);
            }
        } else if (this.selectedCards.length == 2) {
            this.selectedCards[0].setState(NEUTRAL);
            this.selectedCards[1].setState(NEUTRAL);
            this.selectedCards[0].rotate();
            this.selectedCards[1].rotate();
            this.selectedCards = [];
            this.selectedCards.push(card);
        } else {
            this.selectedCards.push(card);
        }
    }
};

Game.prototype.start = function() {
    this.selectedCards = [];
    this.matched = 0;

    Array.from(document.getElementsByClassName('card')).forEach((v) => {
        v.className = 'card shirt-up';
    });

    Array.from(document.getElementsByClassName('card-back')).forEach((v) => {
        v.className = 'card-back';
    });

    setTimeout(() => { // wait until card rotate
        let cards = Array.from(document.querySelectorAll('#board > div'));
        cards.sort(() => Math.random() - 0.5);
    
        let board = document.getElementById('board');
        board.innerHTML = "";
        cards.forEach((v) => {
            board.appendChild(v);
        });
    
        this.startTimer();
    }, 500);

};

Game.prototype.startTimer = function() {
    let t = 59;
    let timerElement = document.getElementById('timer');
    timerElement.innerHTML = "00:59";
    let _this = this;
    this.timerId = setInterval(function() {
        --t;
        timerElement.innerHTML = "00:" + t.toString().padStart(2, '0');
        if (t == 0) {
            _this.end();
        }
    }, 1000);  
};

Game.prototype.end = function() {
    clearInterval(this.timerId);
    let endGameDialog = document.getElementById('end-game-dialog');
    if (this.matched == CARDS_NUMBER) {
        jumpLetters(endGameDialog.querySelector('div'), 'Win');
        endGameDialog.querySelector('button').innerHTML = 'Play again';
    } else {
        jumpLetters(endGameDialog.querySelector('div'), 'Lose');
        endGameDialog.querySelector('button').innerHTML = 'Try again';
    }
    endGameDialog.showModal();
};

function jumpLetters(element, word) {
    element.innerHTML = word.replace(/(\w)/g, '<span>$1</span>');
    for (let i = 0; i < word.length; i++) {
        setTimeout(() => {
            element.childNodes[i].classList.add('jump');
        }, 200 * i)
    }
}

let game = new Game();
game.start();

document.getElementById('board').addEventListener('click', (e) => {
    if (e.target.id == 'board') {
        return;
    }
    e.preventDefault();
    
    game.process(new Card(e.target));
});

document.getElementById('play-again').addEventListener('click', (e) => {
    document.getElementById('end-game-dialog').close();
    game.start();
});

