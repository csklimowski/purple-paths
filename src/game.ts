import { MainScene } from './main';
import { LoadScene } from './load';
import { MenuScene } from './menu';

new Phaser.Game({
    width: 600,
    height: 600,
    parent: 'game',
    scene: [
        LoadScene,
        MenuScene,
        MainScene,
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: 0x5D4073
});