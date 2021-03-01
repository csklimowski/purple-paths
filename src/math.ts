export const GRID_SCALE = 0.55;
export const GRID_X = 125;
export const GRID_Y = 25;

export function ctx(c) { return c*160*GRID_SCALE + GRID_X; }
export function rty(r) { return r*160*GRID_SCALE + GRID_Y; }
export function ytr(y) { return Math.floor((y-(GRID_Y - 160*GRID_SCALE*0.5)) / (160*GRID_SCALE)); }
export function xtc(x) { return Math.floor((x-(GRID_X - 160*GRID_SCALE*0.5)) / (160*GRID_SCALE)); }

export function rotateSide(side: number, angle: number) {
    let change = angle / 90;
    if (side === 4) return 4;
    else return (((side+change)%4)+4)%4;
}

export function sideToColOffset(side: number) {
    return {
        0: 0,
        1: 1,
        2: 0,
        3: -1,
        4: 0
    }[side];
}

export function sideToRowOffset(side: number) {
    return {
        0: -1,
        1: 0,
        2: 1,
        3: 0,
        4: 0
    }[side];
}

export function drawFrom(array) {
    let pick = Math.floor(Math.random()*array.length);
    let [item] = array.splice(pick, 1);
    return item;
}
