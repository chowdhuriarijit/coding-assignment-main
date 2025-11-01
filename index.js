const EventEmitter = require("events");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 8888;

class PubSub extends EventEmitter {
  constructor() {
    super();
    // Key is the subscriber ID and value is an object containing properties:
    // channel (channel name), callback (listener) and timestamp (ISO string format)
    this.subscribers = new Map();
    // Key is the channel name and value is a boolean
    this.channels = new Map();
  }

  /**
   * Publishes message to a channel
   *
   * @param {string} channel Channel name
   * @param {string} message Message
   */
  publish(channel, message) {
    //   * @since v0.1.26
    // just saw this emit function inside eventEmmiter iterface emit<K>(eventName: Key<K, T>, ...args: Args<K, T>): boolean;
    // used similar way as per example showned in that file. 
    // Not sure if its fully correct
    this.emit(channel, message);
  }

  /**
   * Subscribe to a channel
   *
   * @param {string} channel Channel name
   * @param {function} callback Callback function
   * @returns {string}
   */
  subscribe(channel, callback) {
    // TODO subscribe user to channel
    // should:
    // - add subscriber
    // - add channel
    // - Add listener to event, event name should be the channel name provided
    // and the listener should be the callback provided 
    // - return subscriber ID
    const timeStampIso = (new Date()).toISOString();
    const subscriberId = this.generateId()
    this.subscribers.set(subscriberId, {channel, callback, timeStampIso})
    this.channels.set(channel, true)
    this.addListener(channel, callback)

    return subscriberId;
     
  }

  /**
   * Unsubscribe from channel using subscriber ID
   *
   * @param {string} subscriberId Subscriber ID
   * @returns {boolean}
   */
  unsubscribe(subscriberId) {
    // TODO unsubscribe with subscriber ID
    // should:
    // - Remove listener from event
    // - remove user from subscribers
    // - return false on subscriber not found
    // - return true on successful completion
    console.log("subscriberId", subscriberId)
    const subscriberObj = this.subscribers.get(subscriberId)
    console.log(subscriberObj)
    if (!subscriberObj) return false

    const subscriberChannelName = subscriberObj.channel
    const subscriberCallback = subscriberObj.callback
    this.removeListener(subscriberChannelName, subscriberCallback)
    return true
  }

  /**
   * Returns a list of subscribers
   * returns {string[]}
   */
  listSubscribers() {
    // TODO return list of subscribers

    // subscribers keys are subscriberId and thats string 
    const subscriberIds = [];
    for (const id of this.subscribers.keys()) {
      subscriberIds.push(id);
    }
    return subscriberIds;
  }

  /**
   * Returns a list of channels
   * returns {string[]}
   */
  listChannels() {
    // TODO return list of channels
    const channelsLists = [];
    for (const channelName of this.channels.keys()) {
      channelsLists.push(channelName);
    }
    return channelsLists;
  }

  /**
   * Generates random ID
   * returns {string}
   */
  generateId() {
    // TODO generate a random ID
    return Math.random().toString();
  }
}

const io = new Server(PORT, {
  cors: { origin: "http://127.0.0.1:8080" },
});

const ps = new PubSub();

// On socket connection
io.on("connection", (socket) => {
  console.log("Connection established with client");

  // example
  socket.on("hello", (msg) => {
    console.log(`User sent message: ${msg}`);
    io.emit("message", "Hello to you too");
  });

  socket.on("publish", (channel, msg) => {
    // TODO Publish message to channel
    // no need to emit a socket message
  });

  // User sends a subscription request
  socket.on("subscribe", (channel) => {


    //io.emit("subscriber-id", {channel:"channel1", subscriberId: ps.generateId()})
    // TODO 
    // should: 
    // - run the subscribe method on PubSub.
    // - listener should emit a websocket message to channel 'message' and the messsage be '{channel name}: {message content}'
    // - emit a websocket message to channel 'subscriber-id', and two arguments, channel name and subscriber id
    const callBack = () =>{ socket.emit('message', channel + ': test message'); }
    const subscriberId = ps.subscribe(channel, callBack)
    if (subscriberId) {
      socket.emit("subscriber-id", channel, subscriberId)
    }
  });

  socket.on("unsubscribe", (subscriberId) => {
    // TODO
    // should:
    // - run the unsubscribe method on PubSub
    // - if successful emit a websocket messsage to channel 'unsubscribed', one argument: subscriber ID
    const flag = ps.unsubscribe(subscriberId)
    if (flag) {
      socket.emit("unsubscribed", subscriberId)
    }
  });

  socket.on("list-subscribers", () => {
    // TODO
    // should:
    // - emit websocket message returning subscribers
    const subscribersLists = ps.listSubscribers()
    console.log(subscribersLists)
    if (subscribersLists) {
      socket.emit("list-subscribers", subscribersLists)
    }
  });

  socket.on("list-channels", () => {
    // TODO
    // should:
    // - emit websocket message returning channels
    const channels = ps.listChannels()
    console.log(channels)
    if (channels) {
      socket.emit("list-channels", channels)
    }
    
  });

});
