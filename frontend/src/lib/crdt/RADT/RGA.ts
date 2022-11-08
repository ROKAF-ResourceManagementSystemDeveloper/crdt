import S4Vector from "./S4Vector";

export interface RGANode {
  data: any;
  s4: S4Vector;
  s4k?: S4Vector;
  s4p?: S4Vector;
  link: RGANode;
}

export function isTombstone(n: RGANode) {
  return n.data === null;
}

class RGA {
  #map = new Map<string, RGANode>();
  #head: RGANode;
  #cemetery: RGANode[] = [];

  static HEAD_S4 = new S4Vector(-1, -1, -1);

  constructor() {
    this.#head = {
      data: null,
      link: null,
      s4: RGA.HEAD_S4,
      s4k: RGA.HEAD_S4,
      s4p: RGA.HEAD_S4,
    };
    this.#map.set(RGA.HEAD_S4.key, this.#head);
  }

  findNode(offset: number) {
    let count = 0;
    let currentNode = this.#head;
    while (true) {
      if (offset == count) {
        return currentNode;
      } else {
        currentNode = currentNode.link;
        if (!isTombstone(currentNode)) {
          count++;
        }
      }
      if (currentNode === null) {
        return null;
      }
    }
  }

  read(s4: S4Vector) {
    const targetNode = this.#map.get(s4.key);
    return targetNode.data;
  }

  getAll() {
    let currentNode = this.#head;
    const list: RGANode[] = [];
    while (currentNode.link !== null) {
      currentNode = currentNode.link;
      list.push(currentNode);
    }
    console.log(list);
    return list;
  }

  text() {
    let currentNode = this.#head;
    let text = "";
    while (currentNode.link !== null) {
      currentNode = currentNode.link;
      if (!isTombstone(currentNode)) {
        text += currentNode.data;
      }
    }
    return text;
  }

  localInsert(prevS4: S4Vector, s4: S4Vector, data: any) {
    const prevNode = this.#map.get(prevS4.key);
    if (isTombstone(prevNode) && prevS4.key !== RGA.HEAD_S4.key) {
      return false;
    }
    if (this.#map.has(s4.key)) {
      return false;
    }
    const newNode = {
      data: data,
      link: prevNode.link,
      s4k: s4,
      s4p: s4,
      s4: s4,
    };
    prevNode.link = newNode;
    this.#map.set(s4.key, newNode);
    return true;
  }
  localDelete(s4: S4Vector) {
    const targetNode = this.#map.get(s4.key);
    if (isTombstone(targetNode) || s4.key === RGA.HEAD_S4.key) {
      return false;
    }

    targetNode.data = null;
    this.#cemetery.push(targetNode);
    return true;
  }
  localUpdate(s4: S4Vector, data: any) {
    const targetNode = this.#map.get(s4.key);
    if (isTombstone(targetNode) || s4.key === RGA.HEAD_S4.key) {
      return false;
    }

    targetNode.data = data;
    return true;
  }

  remoteInsert(prevS4: S4Vector, s4: S4Vector, data: any) {
    let prevNode = this.#map.get(prevS4.key);

    const newNode: RGANode = {
      data: data,
      s4k: s4,
      s4p: s4,
      link: null,
      s4: s4,
    };
    this.#map.set(s4.key, newNode);

    while (
      prevNode.link !== null &&
      newNode.s4k.isPreceding(prevNode.link.s4k)
    ) {
      prevNode = prevNode.link;
    }

    newNode.link = prevNode.link;
    prevNode.link = newNode;

    return true;
  }
  remoteDelete(s4: S4Vector) {
    const targetNode = this.#map.get(s4.key);
    if (!isTombstone(targetNode)) {
      targetNode.data = null;
      targetNode.s4p = s4;
    }
    return true;
  }
  remoteUpdate(s4: S4Vector, data: any) {
    const targetNode = this.#map.get(s4.key);
    if (isTombstone(targetNode)) {
      return false;
    }
    targetNode.data = data;
    return true;
  }
}

export default RGA;
