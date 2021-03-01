
import { Ball, PathTile, Button } from './objects';
import { GRID_SCALE, ctx, rty, ytr, xtc, drawFrom } from './math';

export class MainScene extends Phaser.Scene {

    balls: Ball[];
    pathsCompleted: number;
    spaces: Phaser.GameObjects.Image[][];

    grid: PathTile[][];
    tileDeck: PathTile[];
    nextTile: PathTile;

    preview: Phaser.GameObjects.Image;

    lastRow: number;
    lastCol: number;
    freePlace: boolean;
    difficulty: number;

    ballsFinished: number;
    exitsReached: Set<PathTile>;

    rotateLeftButton: Button;
    rotateRightButton: Button;

    shade: Phaser.GameObjects.Rectangle;
    tutorialText: Phaser.GameObjects.Image;
    tutorialButton: Button;
    endMenu: Phaser.GameObjects.Container;

    constructor() {
        super('main');
    }

    create() {
        this.difficulty = this.registry.get('difficulty') || 5;
        
        this.lastRow = -1;
        this.lastCol = -1;
        this.freePlace = true;
        this.pathsCompleted = 0;

        this.ballsFinished = 0;
        this.exitsReached = new Set();

        // set up board

        this.grid = [
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null]
        ];

        let edges = [
            [0, 1], [0, 2], [0, 3],
            [1, 0], [1, 4],
            [2, 0], [2, 4],
            [3, 0], [3, 4],
            [4, 1], [4, 2], [4, 3]
        ];
        let [startRow, startCol] = drawFrom(edges);

        this.grid[startRow][startCol] = new PathTile(this, ctx(startCol), rty(startRow), 0, startRow, startCol);
        this.grid[startRow][startCol].setScale(GRID_SCALE);
        if (startCol === 4) this.grid[startRow][startCol].setAngle(90);
        if (startRow === 4) this.grid[startRow][startCol].setAngle(180);
        if (startCol === 0) this.grid[startRow][startCol].setAngle(-90);

        for (let i = 0; i < this.difficulty; i++) {
            let [row, col] = drawFrom(edges);
            this.grid[row][col] = new PathTile(this, ctx(col), rty(row), 10, row, col);
            this.grid[row][col].setScale(GRID_SCALE);
            if (col === 4) this.grid[row][col].setAngle(90);
            if (row === 4) this.grid[row][col].setAngle(180);
            if (col === 0) this.grid[row][col].setAngle(-90);
        }

        this.spaces = [
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null]
        ];

        for (let r = 1; r <= 3; r++) {
            for (let c = 1; c <= 3; c++) {
                let space = this.add.image(ctx(c), rty(r), 'space');
                space.setScale(GRID_SCALE);
                space.setAlpha(0.4);
                this.spaces[r][c] = space;
            }
        }

        this.preview = this.add.image(-500, -500, 'tile-1');
        this.preview.setScale(GRID_SCALE);
        this.preview.setAlpha(0.4);

        this.tileDeck = []
        for (let i = 1; i <= 9; i++) {
            let tile = new PathTile(this, 100 + i*40, 560, i);
            tile.setScale(0.2);
            this.tileDeck.push(tile);
        }

        this.balls = [
            new Ball(this, this.grid[startRow][startCol], 4, [], [])
        ];

        this.input.removeAllListeners();
        this.input.on(Phaser.Input.Events.POINTER_MOVE, this.onMove, this) ;
        this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onClick, this);

        this.rotateRightButton = new Button(this, 430, 470, 'rotate', this.rotateRight.bind(this));
        this.rotateRightButton.setScale(0.9);

        this.rotateLeftButton = new Button(this, 170, 470, 'rotate', this.rotateLeft.bind(this));
        this.rotateLeftButton.setScale(0.9);
        this.rotateLeftButton.setFlipX(true);

        // UI stuff

        this.shade = this.add.rectangle(300, 300, 600, 600, 0x000000);
        this.shade.setAlpha(0);
        this.shade.setDepth(1);
        this.tutorialButton = new Button(this, 560, 40, 'button-tutorial', this.toggleTutorial.bind(this));
        this.tutorialButton.setDepth(2);
        this.tutorialText = this.add.image(300, 335, 'text-tutorial')
        this.tutorialText.setAlpha(0);
        this.tutorialText.setDepth(2);
        this.endMenu = this.add.container(0, 0);
        this.endMenu.setAlpha(0);
        this.endMenu.setDepth(2);
        
        // okay, ready to start now

        this.pickNextTile();
    }

    ballFinished(ball: Ball) {
        this.ballsFinished += 1;
        if (ball.tile && ball.tile.tileType === 10) {
            this.exitsReached.add(ball.tile);
        }
        if (this.ballsFinished === this.balls.length) {
            this.time.addEvent({
                delay: 1000,
                callback: this.allFinished,
                callbackScope: this
            });
        }
    }

    allFinished() {
        this.shade.setAlpha(0.8);
        this.endMenu.setAlpha(1);
        if (this.exitsReached.size === this.difficulty) {
            this.endMenu.add(this.add.image(300, 110, 'text-win', drawFrom([0, 1, 2, 3, 4])));
            this.registry.set('highestBeaten', Math.max(this.difficulty, this.registry.get('highestBeaten')));
            localStorage.setItem('ninepath_data', JSON.stringify(this.registry.values));
        } else {
            this.endMenu.add(this.add.image(300, 110, 'text-loss', drawFrom([0, 1, 2, 3, 4])));
        }
        this.endMenu.add([
            this.add.image(300, 210, 'text-play-again'),
            new Button(this, 300, 280, 'button-beginner', () => {
                this.registry.set('difficulty', 2);
                this.scene.restart();
            }),
            new Button(this, 300, 350, 'button-intermediate', () => {
                this.registry.set('difficulty', 3);
                this.scene.restart();
            }, this.registry.get('highestBeaten') < 2),
            new Button(this, 300, 420, 'button-expert', () => {
                this.registry.set('difficulty', 4);
                this.scene.restart();
            }, this.registry.get('highestBeaten') < 3),
            new Button(this, 300, 490, 'button-grandmaster', () => {
                this.registry.set('difficulty', 5);
                this.scene.restart();
            }, this.registry.get('highestBeaten') < 4)
        ]);
    }

    toggleTutorial() {
        if (this.tutorialText.alpha === 0) {
            this.tutorialText.setAlpha(1);
            this.shade.setAlpha(.8);
            this.tutorialButton.setTexture('button-x');
        } else {
            this.tutorialText.setAlpha(0);
            this.shade.setAlpha(0);
            this.tutorialButton.setTexture('button-tutorial');
        }
    }

    onMove(event) {
        let r = ytr(event.worldY);
        let c = xtc(event.worldX);

        if (r > 0 && r < 4 && c > 0 && c < 4 && this.grid[r][c] === null && (this.freePlace || r === this.lastRow || c === this.lastCol)) {
            this.preview.x = ctx(c);
            this.preview.y = rty(r);
        } else {
            this.preview.x = -500;
            this.preview.y = -500;
        }
    }

    onClick(event) {
        if (this.tutorialText.alpha === 1) return;
        let r = ytr(event.downY);
        let c = xtc(event.downX);

        if (r > 0 && r < 4 && c > 0 && c < 4 && this.grid[r][c] === null && (this.freePlace || r === this.lastRow || c === this.lastCol)) {
            this.preview.x = -500;
            this.preview.y = -500;
            this.nextTile.row = r;
            this.nextTile.col = c;
            this.grid[r][c] = this.nextTile;

            this.tweens.add({
                targets: this.nextTile,
                duration: 200,
                props: {
                    x: ctx(c),
                    y: rty(r),
                    scaleX: GRID_SCALE,
                    scaleY: GRID_SCALE
                },
                onComplete: this.tileDeck.length === 0 ? this.balls[0].go : null,
                onCompleteScope: this.balls[0]
            });
            this.lastRow = r;
            this.lastCol = c;
            this.freePlace = true;
            for (let sr = 1; sr <= 3; sr++) {
                for (let sc = 1; sc <= 3; sc++) {
                    if ((sr === r || sc === c) && this.grid[sr][sc] === null) {
                        this.spaces[sr][sc].setAlpha(0.4);
                        this.freePlace = false;
                    } else if (!(sr === r && sc === c)) {
                        this.spaces[sr][sc].setAlpha(0.2);
                    }
                }
            }
            if (this.freePlace) {
                for (let sr = 1; sr <= 3; sr++) {
                    for (let sc = 1; sc <= 3; sc++) {
                        this.spaces[sr][sc].setAlpha(0.4);
                    }
                }
            }
            this.pickNextTile();
        }
    }

    rotateRight() {
        if (this.tutorialText.alpha === 1) return;
        this.nextTile.setAngle(this.nextTile.realAngle);
        this.nextTile.realAngle += 90;
        this.preview.setAngle(this.nextTile.angle + 90);
        this.tweens.add({
            targets: this.nextTile,
            duration: 100,
            props: {
                angle: this.nextTile.angle + 90
            }
        });
    }

    rotateLeft() {
        if (this.tutorialText.alpha === 1) return;
        this.nextTile.setAngle(this.nextTile.realAngle);
        this.nextTile.realAngle -= 90;
        this.preview.setAngle(this.nextTile.angle - 90);
        this.tweens.add({
            targets: this.nextTile,
            duration: 100,
            props: {
                angle: this.nextTile.angle - 90
            }
        });
    }

    pickNextTile() {
        if (this.tileDeck.length > 0) {
            this.nextTile = drawFrom(this.tileDeck);
            this.preview.setTexture(this.nextTile.texture.key);
            this.preview.setAngle(this.nextTile.angle);
            this.tweens.add({
                targets: this.nextTile,
                duration: 200,
                props: {
                    x: 300,
                    y: 470,
                    scaleX: 0.8,
                    scaleY: 0.8
                }
            });
        } else {
            this.rotateRightButton.setAlpha(0);
            this.rotateLeftButton.setAlpha(0);
            this.tutorialButton.setAlpha(0);
        }
    }

    tileAt(x: number, y: number) {
        let col = Math.floor(x / 140);
        let row = Math.floor(y / 140);
        if (col > -1 && col < 5) {
            if (row > -1 && row < 5) {
                return this.grid[col][row];
            }
        }
        return null;
    }
}

