type OnOpenCallback = (wsc: WebSocketClient, e: Event) => any;
type OnMessageCallback = (data: any, e: MessageEvent) => any;
interface WebSocketConnectOption {
  typePrefix?: string;
  dataPrefix?: string;
  onOpen?: OnOpenCallback;
}
class WebSocketClient {
  #url: string = "";
  get url() {
    return this.#url;
  }
  #socket: WebSocket = null;
  get socket() {
    return this.#socket;
  }

  #typePrefix = "type";
  #dataPrefix = "data";
  static connect(url: string, options: WebSocketConnectOption = {}) {
    const {
      typePrefix = "type",
      dataPrefix = "data",
      onOpen = (wsc: WebSocketClient, e: Event) => {},
    } = options;

    const wsc = new WebSocketClient();
    wsc.#url = url;
    wsc.#dataPrefix = dataPrefix;
    wsc.#typePrefix = typePrefix;
    wsc.#socket = new WebSocket(url);

    wsc.#socket.addEventListener("open", (e) => {
      onOpen(wsc, e);
    });
    wsc.#socket.addEventListener("message", (e) => {
      const onEventList = wsc.eventMap.get(e.data[wsc.#typePrefix]);
      if (onEventList) {
        onEventList.forEach((onEvent) => {
          onEvent(e.data[wsc.#dataPrefix], e);
        });
      }
    });
  }

  eventMap = new Map<string, OnMessageCallback[]>();
  on(type: string, onMessage: OnMessageCallback) {
    let onMessageList = this.eventMap.get(type);
    if (onMessageList === undefined) {
      onMessageList = [];
      this.eventMap.set(type, onMessageList);
    }
    onMessageList.push(onMessage);
  }
  send(type: string, serializableData: any) {
    const stringifiedPacket = JSON.stringify({
      [this.#typePrefix]: type,
      [this.#dataPrefix]: serializableData,
    });
    this.#socket?.send(stringifiedPacket);
  }
}

export default WebSocketClient;
