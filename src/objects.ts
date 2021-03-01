
import { GRID_SCALE, rotateSide, sideToColOffset, sideToRowOffset } from './math';
import { MainScene } from './main';

interface PathTileDefinition {
    img: string,
    0: number[],
    1: number[],
    2: number[],
    3: number[],
    4: number[]
}

const pathTiles: PathTileDefinition[] = [
    {
        img: 'tile-0',
        0: [],
        1: [],
        2: [4],
        3: [],
        4: [2]
    },
    {
        img: 'tile-1',
        0: [2],
        1: [3],
        2: [0],
        3: [1],
        4: []
    },
    {
        img: 'tile-2',
        0: [3],
        1: [2],
        2: [1],
        3: [0],
        4: []
    },
    {
        img: 'tile-3',
        0: [],
        1: [2],
        2: [1, 3],
        3: [2],
        4: []
    },
    {
        img: 'tile-4',
        0: [2, 3],
        1: [],
        2: [0],
        3: [0],
        4: []
    },
    {
        img: 'tile-5',
        0: [1, 2],
        1: [0],
        2: [0],
        3: [],
        4: []
    },
    {
        img: 'tile-6',
        0: [],
        1: [2, 3],
        2: [1, 3],
        3: [1, 2],
        4: []
    },
    {
        img: 'tile-7',
        0: [1],
        1: [0, 3],
        2: [3],
        3: [1, 2],
        4: []
    },
    {
        img: 'tile-8',
        0: [3],
        1: [2, 3],
        2: [1],
        3: [0, 1],
        4: []
    },
    {
        img: 'tile-9',
        0: [1, 3],
        1: [0],
        2: [3],
        3: [0, 2],
        4: []
    },
    {
        img: 'tile-10',
        0: [],
        1: [],
        2: [4],
        3: [],
        4: [2]
    }
]


export class PathTile extends Phaser.GameObjects.Image {
    realAngle: number;
    tileType: number;
    row?: number;
    col?: number;
    scene: MainScene;
    constructor(scene: MainScene, x: number, y: number, tileType: number, row?: number, col?: number) {
        super(scene, x, y, pathTiles[tileType].img);
        scene.add.existing(this);
        this.realAngle = this.angle;
        this.tileType = tileType;
        this.row = row || null;
        this.col = col || null;
    }

    sideToX(side: number) {
        if (side === 4) {
            return this.x + sideToColOffset(rotateSide(2, this.angle))*25*GRID_SCALE;
        } else {
            return this.x + sideToColOffset(side)*70*GRID_SCALE;
        }
    }

    sideToY(side: number) {
        if (side === 4) {
            return this.y + sideToRowOffset(rotateSide(2, this.angle))*25*GRID_SCALE;
        } else {
            return this.y + sideToRowOffset(side)*70*GRID_SCALE;
        }
    }
}


export class Button extends Phaser.GameObjects.Image {
    onDownCallback: () => void;
    down: boolean;
    disabled: boolean;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, onDownCallback: () => void, disabled?: boolean) {
        super(scene, x, y, texture, 0);
        scene.add.existing(this);
        this.onDownCallback = onDownCallback;
        this.down = false;
        this.disabled = disabled || false;
        if (this.disabled) this.setFrame(2);

        this.setInteractive();
        this.on(Phaser.Input.Events.POINTER_DOWN, this.onDown, this);
        this.on(Phaser.Input.Events.POINTER_OUT, this.onOut, this);
        this.on(Phaser.Input.Events.POINTER_UP, this.onUp, this);
    }

    onOut() {
        if (!this.disabled) {
            this.setFrame(0);
        }
        this.down = false;
    }

    onUp() {
        if (!this.disabled) {
            this.setFrame(0);
            if (this.down) this.onDownCallback();
        }
    }

    onDown() {
        if (!this.disabled) {
            this.setFrame(1);
            this.down = true;
        }
    }
}

export function makeXYTweens(tile: PathTile, inSide: number, outSide: number) {
    let xEase;
    let yEase;
    let straightLine = outSide === 4 || inSide === 4 || Math.abs(outSide-inSide) === 2;
    if (straightLine) {
        xEase = Phaser.Math.Easing.Linear;
        yEase = Phaser.Math.Easing.Linear;
    } else {
        if (inSide === 1 || inSide === 3) {
            xEase = Phaser.Math.Easing.Sine.Out;
            yEase = Phaser.Math.Easing.Sine.In;
        } else {
            xEase = Phaser.Math.Easing.Sine.In;
            yEase = Phaser.Math.Easing.Sine.Out;
        }
    }
    
    return [
        {
            duration: (outSide === 4 || inSide === 4) ? 125 : 300,
            props: {
                x: tile.sideToX(outSide),
            },
            ease: xEase
        },
        {
            duration: (outSide === 4 || inSide === 4) ? 125 : 300,
            props: {
                y: tile.sideToY(outSide),
            },
            ease: yEase
        }
    ];
}


export class Ball extends Phaser.GameObjects.Sprite {
    
    tile: PathTile;
    direction: number;
    scene: MainScene;
    crashed: boolean;
    infiniteLoop: boolean;

    visitedTiles: PathTile[];
    visitedDirections: number[];

    
    constructor(scene: MainScene, tile: PathTile, direction: number, visitedTiles: PathTile[], visitedDirections: number[]) {
        super(scene, tile.sideToX(direction), tile.sideToY(direction), 'ball');
        scene.add.existing(this);
        this.tile = tile;
        this.direction = direction;
        this.visitedTiles = visitedTiles;
        this.visitedDirections = visitedDirections;
        this.crashed = false;
        this.infiniteLoop = false;
    }

    onPathComplete() {
        this.scene.ballFinished(this);
        if (this.crashed) {
            this.anims.play('bye-ball');
        } else if (this.infiniteLoop) {
            let text = this.scene.add.image(this.x, this.y, 'text-infinite-loop');
            this.scene.tweens.add({
                targets: text,
                duration: 1000,
                props: {
                    y: this.y - 50,
                    alpha: 0
                }
            });
            this.setAlpha(0);
        } else if (!this.tile) {
            this.scene.tweens.add({
                targets: this,
                duration: 2200,
                props: {
                    x: this.x - sideToColOffset(this.direction)*1000,
                    y: this.y - sideToRowOffset(this.direction)*1000
                }
            });
        } else if (this.tile.tileType === 10) {
            let check = this.scene.add.image(this.x, this.y, 'check');
            this.scene.tweens.add({
                targets: check,
                duration: 300,
                props: {
                    y: this.y - 50
                }
            });
        }
    }

    go() {

        let ballQueue = [{ball: <Ball>this, xTweens: [], yTweens: []}];

        while (ballQueue.length > 0) {
            let {ball, xTweens, yTweens} = ballQueue.shift();
            
            tileLoop:
            while (ball.tile) {

                // detect infinite loop
                for (let i = 0; i < ball.visitedTiles.length; i++) {
                    if (ball.visitedTiles[i] === ball.tile && ball.visitedDirections[i] === ball.direction) {
                        ball.infiniteLoop = true;
                        ball.tile = null;
                        break tileLoop;
                    }
                }

                ball.visitedTiles.push(ball.tile);
                ball.visitedDirections.push(ball.direction);

                let outPaths = pathTiles[ball.tile.tileType][rotateSide(ball.direction, -ball.tile.angle)];
    
                if (outPaths.length === 0) {
                    ball.crashed = true;
                    ball.tile = null;
                }

                if (outPaths.length > 1) {
                    let outSide = rotateSide(outPaths[1], ball.tile.angle);

                    let inSide = ball.direction;
                    let newBall = new Ball(this.scene, ball.tile, ball.direction, [...ball.visitedTiles], [...ball.visitedDirections]);
                    newBall.x = ball.x;
                    newBall.y = ball.y;

                    let [xTween, yTween] = makeXYTweens(ball.tile, inSide, outSide);
                    ballQueue.push({
                        ball: newBall,
                        xTweens: [...xTweens, xTween],
                        yTweens: [...yTweens, yTween]
                    });
                    this.scene.balls.push(newBall);
                    
                    let newCol = ball.tile.col + sideToColOffset(outSide);
                    let newRow = ball.tile.row + sideToRowOffset(outSide);
                    newBall.direction = rotateSide(outSide, 180);
                    newBall.tile = this.scene.grid[newRow][newCol];
                }

                if (outPaths.length > 0) {
                    let outSide = rotateSide(outPaths[0], ball.tile.angle);
                    let inSide = ball.direction;

                    let [xTween, yTween] = makeXYTweens(ball.tile, inSide, outSide);
                    
                    xTweens.push(xTween);
                    yTweens.push(yTween);

                    let newRow = ball.tile.row + sideToRowOffset(outSide);
                    let newCol = ball.tile.col + sideToColOffset(outSide);
                    
                    ball.direction = rotateSide(outSide, 180);
                    ball.tile = this.scene.grid[newRow][newCol];

                    if (outSide === 4) break;
                }
            }
            
            this.scene.tweens.timeline({
                tweens: xTweens,
                targets: ball,
                onComplete: ball.onPathComplete,
                onCompleteScope: ball
            });
            this.scene.tweens.timeline({
                tweens: yTweens,
                targets: ball
            });
        }
    }
}