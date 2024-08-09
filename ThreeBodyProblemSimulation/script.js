const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

class Body {
    constructor(x, y, mass, vx, vy) {
        this.x = x;
        this.y = y;
        this.mass = mass;
        this.vx = vx;
        this.vy = vy;
    }

    update(bodies, dt) {
        let fx = 0, fy = 0;
        for (let body of bodies) {
            if (body !== this) {
                let dx = body.x - this.x;
                let dy = body.y - this.y;
                let distSq = dx * dx + dy * dy;
                let f = (6.67430e-11 * this.mass * body.mass) / distSq;
                let dist = Math.sqrt(distSq);
                fx += f * dx / dist;
                fy += f * dy / dist;
            }
        }
        this.vx += fx / this.mass * dt;
        this.vy += fy / this.mass * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.sqrt(this.mass) * 0.005, 0, 2 * Math.PI);
        ctx.fill();
    }
}

const bodies = [
    new Body(400, 300, 1e15, 0, 0),
    new Body(400, 400, 1e15, 1, 0),
    new Body(500, 300, 1e15, 0, -1)
];

function simulate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let body of bodies) {
        body.update(bodies, 1000);
        body.draw();
    }
    requestAnimationFrame(simulate);
}

simulate();
