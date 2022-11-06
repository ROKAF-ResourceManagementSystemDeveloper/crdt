type OpType = "insert" | "delete" | "update";

class FakeWebSocket {
  static onMessageListeners = [];
  addEventListener<K extends keyof WebSocketEventMap>(
    type: K,
    listener: (this: FakeWebSocket, ev: WebSocketEventMap[K]) => any
  ) {
    switch (type) {
      case "open":
        listener.call(new Event("open"));
        break;
      case "message":
        FakeWebSocket.onMessageListeners.push(listener);
        break;
      default:
    }
  }

  send(data: string) {
    setTimeout(() => {
      FakeWebSocket.onMessageListeners.forEach((listener) => {
        listener(new MessageEvent("message", { data: data }));
      });
    }, 500);
  }
}

export default FakeWebSocket;
