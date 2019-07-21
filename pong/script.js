class Ball {
  constructor(el, collision) {
    this.collision = collision;
    this.el = el;
    this.w = 10;
    this.h = 10;
    this.y = height / 2 - this.h / 2;
    this.x = width / 2 - this.w / 2;
    this.speed = 10;
    this.maxSpeed = 10;
    this.velX = 4;
    this.velY = 4;
  }

  reset() {
    this.y = height / 2 - this.h / 2;
    this.x = width / 2 - this.w / 2;
    this.speed = 5;
    this.velX = 4;
    this.velY = 4;
  }

  checkCollision(that) {
    let w = 0.5 * (this.w + that.w);
    let h = 0.5 * (this.h + that.h);
    let dx = this.x + this.w / 2 - (that.x + that.w / 2);
    let dy = this.y + this.h / 2 - (that.y + that.h / 2);
    if (Math.abs(dx) <= w && Math.abs(dy) <= h) {

      if (this.speed < this.maxSpeed) {
        this.speed += 0.1;
      }
      let wy = w * dy;
      let hx = h * dx;

      let normalIntersectionY = dy / (that.height / 2);

      let bounceAngle = normalIntersectionY * 0.7;

      this.velX = this.speed * Math.cos(bounceAngle);
      this.velY = this.speed * (0 - Math.sin(bounceAngle));

      if (that.side == 'right') {
        this.velX = -this.velX;
      }

      if (that.side === "left") {
        right.follow = new Ball(null, false);
        right.follow.velX = this.velX * 2;
        right.follow.velY = this.velY * 2;
        right.follow.x = this.x;
        right.follow.y = this.y;
      } else {
        left.follow = new Ball(null, false);
        left.follow.velX = this.velX * 2;
        left.follow.velY = this.velY * 2;
        left.follow.x = this.x;
        left.follow.y = this.y;
      }
    }
  }

  move() {
    if (this.collision) {
      this.checkCollision(right);
      this.checkCollision(left);
    }

    this.x += this.velX;
    this.y += this.velY;

    if (this.y <= 0 || this.y >= height - 5) {
      this.velY = -this.velY;
    }

    if (this.x >= width) {
      left.scored();
      this.reset();
      left.reset();
      right.reset();
    } else if (this.x < 0) {
      right.scored();
      this.reset();
      left.reset();
      right.reset();
    }

    if (this.el) {
      this.el.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
  }}


class Paddle {
  constructor(el, side, scoreEl) {
    this.side = side;
    this.el = el;
    this.w = 15;
    this.h = 80;
    this.y = height / 2 - this.h / 2;
    this.follow = null;
    this.target = height / 2 - this.h / 2;
    this.speed = 4;
    this.height = 80;
    this.score = 0;
    this.scoreEl = scoreEl;
    this.offset = Math.random() * (40 - 80 + 1) << 0;
  }

  reset() {
    this.follow = null;
    this.target = height / 2 - this.h / 2;
    this.y = height / 2 - this.h / 2;
    this.move();
  }

  scored() {
    this.score += 1;
    this.scoreEl.textContent = checkTime(this.score);
  }

  move() {

    if (this.follow) {
      this.follow.move();
      this.target = this.follow.y - this.h / 2 + this.offset;

      if (this.side == 'left') {
        if (this.follow.x < this.x) {
          this.offset = Math.random() * (40 - 80 + 1) << 0;
          this.follow = null;
        }
      } else {
        if (this.follow.x > this.x) {
          this.offset = Math.random() * (40 - 80 + 1) << 0;
          this.follow = null;
        }
      }
    }

    if (this.target > height - this.height) {
      this.target = height - this.height;
    } else if (this.target < 0) {
      this.target = 0;
    }

    if (this.target + 2 >= this.y && this.target - 2 <= this.y) {
      this.y = this.target;
    } else if (this.target > this.y) {
      this.y += this.speed;
    } else if (this.target < this.y) {
      this.y -= this.speed;

    }

    this.el.style.transform = `translate( ${this.x}px, ${this.y}px)`;
  }}


var height = 400,
width = 800;

var left = new Paddle(document.querySelector('.left'), "left", document.querySelector('.l'));
var right = new Paddle(document.querySelector('.right'), "right", document.querySelector('.r'));
var ball = new Ball(document.querySelector('.ball'), true);

left.x = 20;
right.x = width - 20;

requestAnimationFrame(update);

left.move();
right.move();

var d = new Date();
left.score = d.getHours() - 1;
right.score = d.getMinutes() - 1;

left.scored();
right.scored();

function update() {
  var d = new Date();
  if (d.getHours() <= left.score) {
    right.move();
  }
  if (d.getMinutes() <= right.score) {
    left.move();
  }

  if (right.score == 59 && d.getMinutes() == 0) {
    left.reset();
    left.score = 0;
    right.reset();
    right.score = 0;
    ball.reset();
  }
  if (left.score == 23 && d.getHours() == 0) {
    left.reset();
    left.score = 0;
    right.reset();
    right.score = 0;
    ball.reset();
  }
  ball.move();
  requestAnimationFrame(update);
}

function checkTime(i) {
  if (i < 10) {i = "0" + i;};
  return i;
}