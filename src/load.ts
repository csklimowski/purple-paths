export class LoadScene extends Phaser.Scene {

    constructor() {
        super('load');
    }

    preload() {
        this.load.image('tile-0', 'img/0.png');
        this.load.image('tile-1', 'img/1.png');
        this.load.image('tile-2', 'img/2.png');
        this.load.image('tile-3', 'img/3.png');
        this.load.image('tile-4', 'img/4.png');
        this.load.image('tile-5', 'img/5.png');
        this.load.image('tile-6', 'img/6.png');
        this.load.image('tile-7', 'img/7.png');
        this.load.image('tile-8', 'img/8.png');
        this.load.image('tile-9', 'img/9.png');
        this.load.image('tile-10', 'img/10.png');
        this.load.image('select', 'img/select.png');
        this.load.image('ball', 'img/ball.png');
        this.load.image('space', 'img/space.png');
        this.load.image('check', 'img/check.png');
        this.load.image('logo', 'img/logo.png');
        this.load.image('text-tutorial', 'img/text-tutorial.png');
        this.load.image('text-by', 'img/text-by.png');
        this.load.image('text-play-again', 'img/text-play-again.png');
        this.load.image('text-infinite-loop', 'img/text-infinite-loop.png');
        this.load.spritesheet('text-win', 'img/text-win.png', {frameWidth: 444, frameHeight: 65});
        this.load.spritesheet('text-loss', 'img/text-loss.png', {frameWidth: 444, frameHeight: 65});
        this.load.spritesheet('button-beginner', 'img/button-beginner.png', {frameWidth: 152, frameHeight: 50});
        this.load.spritesheet('button-intermediate', 'img/button-intermediate.png', {frameWidth: 184, frameHeight: 50});
        this.load.spritesheet('button-expert', 'img/button-expert.png', {frameWidth: 119, frameHeight: 50});
        this.load.spritesheet('button-grandmaster', 'img/button-grandmaster.png', {frameWidth: 190, frameHeight: 50});
        this.load.spritesheet('button-tutorial', 'img/button-tutorial.png', {frameWidth: 40, frameHeight: 40});
        this.load.spritesheet('button-x', 'img/button-x.png', {frameWidth: 40, frameHeight: 40});
        this.load.spritesheet('rotate', 'img/rotate.png', {frameWidth: 70, frameHeight: 70});
        this.load.spritesheet('bye-ball', 'img/bye-ball.png', {frameWidth: 70, frameHeight: 70});
        this.load.bitmapFont('words', 'font/words_0.png', 'font/words.fnt');
    }

    create() {
        this.anims.create({
            key: 'bye-ball',
            frames: this.anims.generateFrameNumbers('bye-ball', {frames: [0, 1, 2, 3, 4, 5, 6, 11]}),
            frameRate: 30
        });

        let dataString = localStorage.getItem('ninepath_data');
        let data;
        if (dataString) {
            data = JSON.parse(dataString);
            if (!data.highestBeaten) data.highestBeaten = 0;
            if (!data.bestStreak) data.bestStreak = 0;
            if (!data.winStreak) data.winStreak = 0;
        } else {
            data = {
                highestBeaten: 0,
                winStreak: 0,
                bestStreak: 0
            };
            localStorage.setItem('ninepath_data', JSON.stringify(data));
        }
        this.registry.set(data, null);
        this.scene.start('menu');
    }
}