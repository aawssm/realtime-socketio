# Real-time Database System using Node.js and Socket.io
This project is a tutorial on how to create a real-time database system using Node.js and Socket.io, similar to Firebase. The tutorial covers subscribing to single documents, collections, and sub-collections using a query.

Getting Started
[YouTube Video](https://youtu.be/P1OwhW352MY)

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
Node.js
npm
Socket.io
Express
### Installing
1. Clone the repository
```
git clone https://github.com/aawssm/realtime-socketio.git
```
2. Install the dependencies
```
npm install
```
3. Start the server
```
npm start
```
The server will start on port 3000. You can change the port number in the server.js file.

### TODO

- [x] Real-time updates for a single document
- [x] Real-time updates for a collection of documents
- [x] Real-time updates for a query of a collection
- [ ] Add a persistent database (any SQL NoSQL)
- [ ] Optimize the query comparison function
- [ ] Add Redis for horizontal scaling
- [ ] Add additional filtering logic to optimize emit events
- [ ] Add other techniques for client-side and server-side optimization: Techniques such as pagination, caching, incremental updates, batching updates, and aggregation can be added to improve the performance and functionality of the project.

### Built With
- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Socket.io](https://socket.io/) - Real-time communication engine
- [Express](https://expressjs.com/) - Web application framework for Node.js
