import { Button } from './objects';

export class MenuScene extends Phaser.Scene {

    constructor() {
        super('menu');
    }

    create() {
        this.add.image(300, 85, 'logo');
        new Button(this, 300, 200, 'button-beginner', () => {
            this.registry.set('difficulty', 2);
            this.scene.start('main');
        });
        new Button(this, 300, 270, 'button-intermediate', () => {
            this.registry.set('difficulty', 3);
            this.scene.start('main');
        }, this.registry.get('highestBeaten') < 2);
        new Button(this, 300, 340, 'button-expert', () => {
            this.registry.set('difficulty', 4);
            this.scene.start('main');
        }, this.registry.get('highestBeaten') < 3);
        new Button(this, 300, 410, 'button-grandmaster', () => {
            this.registry.set('difficulty', 5);
            this.scene.start('main');
        }, this.registry.get('highestBeaten') < 4);
        this.add.image(300, 540, 'text-by');
    }
}

