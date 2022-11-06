export type SerializedS4Vector = Pick<S4Vector, "sid" | "seq" | "sum">;

export default class S4Vector {
  readonly key: string;
  constructor(
    readonly sid: number, // siteId
    readonly sum: number, // sum of the clocks in vector
    readonly seq: number // for purging tombstones
  ) {
    this.key = `${this.sid} ${this.sum} ${this.seq}`;
  }

  isPreceding(target: S4Vector) {
    return (
      this.sum < target.sum ||
      (this.sum === target.sum && this.sid < target.sid)
    );
  }

  toSerializable(): SerializedS4Vector {
    return { sid: this.sid, sum: this.sum, seq: this.seq };
  }
  static fromSerializable(ss4: SerializedS4Vector) {
    return new S4Vector(ss4.sid, ss4.sum, ss4.seq);
  }
}
