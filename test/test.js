var Clobberation = require("../index.js");

var io = require('socket.io-client');

// Return a promise that becomes resolved if socket next receives a message
// with the given label and expected value. Otherwise it becomes rejected.
function expectMessage(socket, label, expected) {
    return new Promise((resolve, reject) => {
        socket.once(label, actual => {
            if (actual === expected)
                resolve(true);
            else
                reject(new Error("assertion failed: expected " + expected + ", got " + actual));
        });
    });
}

describe("Clobberation", () => {
    beforeEach(() => {
        Clobberation.reset();
    });

    function connect() {
        return io("http://localhost:3000", {multiplex: false});
    }

    it("should send an initial update as soon as you connect", () => {
        var s = connect();
        return expectMessage(s, "update", "");
    });

    it("should support 2 editors", () => {
        var s0 = connect();
        var s1 = connect();

        // FIrst, expect both clients to receive the initial update.
        return Promise.all([
            expectMessage(s0, "update", ""),
            expectMessage(s1, "update", "")
        ]).then(_ => {
            // Then, if socket 0 updates to "hello"...
            s0.emit("update", "hello");
            // ...expect socket 1 to receive "hello".
            return expectMessage(s1, "update", "hello");
        });
    });

    it("should send a correct initial update to a client connecting late", () => {
        // First, connect with s0, wait for its initial update, and then update
        // to "secret".
        var s0 = connect();
        return expectMessage(s0, "update", "").then(() => {
            s0.emit("update", "secret");
            // Warning: There might be a slight race condition here. Unsure. If
            // this test proves flaky, add a delay of a few milliseconds.
        }).then(() => {
            // Then s1 connects.  s1's initial update should reflect the
            // changes made by s0.
            var s1 = connect();
            return expectMessage(s1, "update", "secret");
        });
    });

    it("should support a bunch of editors", () => {
        var sockets = [connect(), connect(), connect(), connect(), connect()];

        // First, expect all clients to receive the initial update.
        return Promise.all(sockets.map(
            s => expectMessage(s, "update", "")
        )).then(_ => {
            // Then, if socket 0 updates to "world"...
            sockets[0].emit("update", "world");
            // ...expect all other sockets to receive "world".
            return Promise.all(sockets.slice(1).map(
                s => expectMessage(s, "update", "world")
            ));
        });
    });
});
