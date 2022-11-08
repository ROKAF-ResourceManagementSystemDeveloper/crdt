import WebSocketClient from "../../websocket/WebSocketClient";
import RGA, { type RGANode } from "./RGA";
import S4Vector, { type SerializedS4Vector } from "./S4Vector";
import VectorClock, { type SerializedVectorClock } from "../VectorClock";
import FakeWebSocket from "../../websocket/FakeWebsocket";

interface InsertMessageData {
  s4: SerializedS4Vector;
  prevS4: SerializedS4Vector;
  vc: SerializedVectorClock;
  data: any;
}
interface DeleteMessageData {
  s4: SerializedS4Vector;
  vc: SerializedVectorClock;
}
interface UpdateMessageData {
  s4: SerializedS4Vector;
  vc: SerializedVectorClock;
  data: any;
}

export default class RGAClient {
  sid = -1;
  vc = new VectorClock();
  rga = new RGA();
  wsc: WebSocketClient;

  constructor(sid: number) {
    this.sid = sid;
    this.wsc = WebSocketClient.connect("_", {
      customWebsocket: FakeWebSocket,
      onOpen: (wsc, e) => {
        wsc.on("insert", (data: InsertMessageData) => {
          const sentVC = VectorClock.fromSerializable(data.vc);
          const prevS4 = S4Vector.fromSerializable(data.prevS4);
          const newS4 = S4Vector.fromSerializable(data.s4);
          if (newS4.sid === this.sid) {
            return;
          }
          this.vc.merge(sentVC);
          this.rga.remoteInsert(prevS4, newS4, data.data);
          this.onChange(this.rga.getAll());
        });
        wsc.on("delete", (data: DeleteMessageData) => {
          const sentVC = VectorClock.fromSerializable(data.vc);
          const targetS4 = S4Vector.fromSerializable(data.s4);
          this.vc.merge(sentVC);
          this.rga.remoteDelete(targetS4);
          this.onChange(this.rga.getAll());
        });
        wsc.on("update", (data: UpdateMessageData) => {
          const sentVC = VectorClock.fromSerializable(data.vc);
          const targetS4 = S4Vector.fromSerializable(data.s4);
          this.vc.merge(sentVC);
          this.rga.remoteUpdate(targetS4, data.data);
          this.onChange(this.rga.getAll());
        });
      },
    });
  }

  insert(offset: number, data: any) {
    const prevNode = this.rga.findNode(offset);
    console.log(offset, prevNode);
    if (prevNode === null) {
      return;
    }
    this.vc.update(this.sid);
    const newS4 = new S4Vector(this.sid, this.vc.sum, 1);
    this.rga.localInsert(prevNode.s4, newS4, data);
    const dataToSend: InsertMessageData = {
      s4: newS4.toSerializable(),
      prevS4: prevNode.s4.toSerializable(),
      data: data,
      vc: this.vc.toSerializable(),
    };
    this.wsc.send("insert", dataToSend);
    this.onChange(this.rga.getAll());
  }

  delete(offset: number) {
    const targetNode = this.rga.findNode(offset);
    if (targetNode === null) {
      return;
    }
    this.vc.update(this.sid);
    this.rga.localDelete(targetNode.s4);
    const dataToSend: DeleteMessageData = {
      s4: targetNode.s4.toSerializable(),
      vc: this.vc.toSerializable(),
    };
    this.wsc.send("delete", dataToSend);
    this.onChange(this.rga.getAll());
  }

  update(offset: number, data: any) {
    const targetNode = this.rga.findNode(offset);
    if (targetNode === null) {
      return;
    }
    this.vc.update(this.sid);
    this.rga.localDelete(targetNode.s4);
    const dataToSend: UpdateMessageData = {
      s4: targetNode.s4.toSerializable(),
      vc: this.vc.toSerializable(),
      data: data,
    };
    this.wsc.send("update", dataToSend);
    this.onChange(this.rga.getAll());
  }

  onChange: (list: RGANode[]) => void;
}
