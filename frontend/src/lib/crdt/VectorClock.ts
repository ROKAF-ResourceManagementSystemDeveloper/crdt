export default class VectorClock {
  #vector = new Map<number, number>();

  static from(vc: VectorClock) {
    const newVc = new VectorClock();
    newVc.#vector = new Map(vc.#vector);
    return newVc;
  }
  static fromMap(map: Map<number, number>) {
    const newVc = new VectorClock();
    newVc.#vector = new Map(map);
    return newVc;
  }

  get(sid: number) {
    return this.#vector.get(sid);
  }
  set(sid: number, clock: number) {
    this.#vector.set(sid, clock);
  }
  update(sid: number) {
    const newClock = this.#vector.get(sid) + 1;
    this.#vector.set(sid, newClock);
  }

  merge(vc: VectorClock) {
    for (let [sid, clock] of vc.#vector.entries()) {
      const currentClock = this.#vector.get(sid);
      if (currentClock === undefined || currentClock < clock) {
        this.#vector.set(sid, clock);
      }
    }
  }

  sum() {
    let sum = 0;
    for (const clock of this.#vector.values()) {
      sum += clock;
    }
    return sum;
  }
}
