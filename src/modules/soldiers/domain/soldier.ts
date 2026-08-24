export class Soldier {
  private _skin: Skin;
  private _life: Life;
  private _locomotion: Locomotion;

  constructor(public readonly id: string, health: number = 100) {
    this._skin = new Skin(id);
    this._life = new Life(health);
    this._locomotion = new Locomotion(this._skin);
  }

  get skin() {
    return this._skin;
  }

  get life() {
    return this._life;
  }

  get locomotion() {
    return this._locomotion;
  }
}

export class Skin {
  constructor(public readonly id: string) {}

  walk() {
    // run walk animation
  }

  run() {
    // run run animation
  }

  idle() {
    // run idle animation
  }

  crouch() {
    // run crouch animation
  }

  jump() {
    // run jump animation
  }

  die() {
    // run die animation
  }
}

export class Life {
  private _health: number;

  constructor(public readonly health: number) {
    this._health = health;
  }

  takeDamage(damage: number) {
    this._health -= damage;
  }

  heal(amount: number) {
    this._health += amount;
  }

  isAlive() {
    return this._health > 0;
  }

  get currentHealth() {
    return this._health;
  }
}

export class Locomotion {
  constructor(private readonly skin: Skin) {}

  walk() {
    this.skin.walk();
  }

  run() {
    this.skin.run();
  }

  jump() {
    this.skin.jump();
  }

  die() {
    this.skin.die();
  }

  crouch() {
    this.skin.crouch();
  }
}
