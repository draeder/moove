# Moove
> Zero configuration, zero fuss mouse and keyboard sharing

Having battled with every virtual KVM there is, I had long considered developing my own. Tired of the incessant lag and choppiness, keystrokes buffering, copy / paste barely working, the time had come.

I first tried writing this in Python, but it lacked an out of the box way to get the boundaries of connected displays. I then moved to Node.js, which had the same problem! Since I wanted to add a user interface to help position computers and monitors anyway, I settled on Electron. Electron surely was built with C++, because it had all of what I needed.

Its network protocol uses [Gun DB](https://gun.eco/) under the hood, which ships with batteries included: Multicast, websockets and WebRTC! It's the fastest browser to browser decentralization technology that exist.