import { Button } from './objects';

export class MenuScene extends Phaser.Scene {

    constructor() {
        super('menu');
    }

    create() {
        this.add.image(300, 75, 'logo');
        this.add.image(300, 150, 'text-by');
        new Button(this, 300, 240, 'button-beginner', () => {
            this.registry.set('difficulty', 2);
            this.scene.start('main');
        });
        new Button(this, 300, 310, 'button-intermediate', () => {
            this.registry.set('difficulty', 3);
            this.scene.start('main');
        }, this.registry.get('highestBeaten') < 2);
        new Button(this, 300, 380, 'button-expert', () => {
            this.registry.set('difficulty', 4);
            this.scene.start('main');
        }, this.registry.get('highestBeaten') < 3);
        new Button(this, 300, 450, 'button-grandmaster', () => {
            this.registry.set('difficulty', 5);
            this.scene.start('main');
        }, this.registry.get('highestBeaten') < 4);

        let winStreak = this.registry.get('winStreak');
        let bestStreak = this.registry.get('bestStreak');
        if (bestStreak > 0) {
            let streakText = this.add.bitmapText(300, 500, 'words', 'grandmaster win streak: ' + (
                bestStreak <= winStreak ? winStreak : (winStreak + ' (best: ' + bestStreak + ')')
            ), 72)
            streakText.setOrigin(0.5, 0);
        }
    }
}

