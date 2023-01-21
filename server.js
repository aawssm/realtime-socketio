const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/views"));

let cities = [
  {
    name: "Los Angeles",
    state: "CA",
    country: "USA",
    capital: false,
    population: 3900000,
    isDelete: false,
  },
  // other city documents
];

// Keep track of all cities in a dictionary

// Keep track of all clients that have subscribed to dynamic queries
let dynamicQuerySubscribers = {};

// Listen for connections from clients
io.on("connection", (socket) => {
  console.log("A client has connected");

  // Send the current list of cities to the new client
  socket.on("init", () => {
    console.log("server init called");
    // emit the allCities event to the client with the list of all cities
    socket.emit("init", cities);
  });

  // Listen for 'create' events from clients
  socket.on("create", (city) => {
    console.log("Creating a new city:", city);
    city.isDelete = false;
    // Add the new city to the dictionary and broadcast the update to all clients
    isAddOrEditDelete(city);
    io.emit("create", city);

    // Check if the new city satisfies any dynamic queries
    checkDynamicQueries(city);
  });

  // Listen for 'update' events from clients
  socket.on("update", (city) => {
    console.log("Updating city:", city);

    // Update the city in the dictionary and broadcast the update to all clients
    isAddOrEditDelete(city);
    io.emit("update", city);

    // Check if the updated city satisfies any dynamic queries
    checkDynamicQueries(city);
  });

  // Listen for 'delete' events from clients
  socket.on("delete", (name) => {
    console.log("Deleting city:", name);

    // Remove the city from the dictionary and broadcast the update to all clients
    let del = isAddOrEditDelete({ name }, true);
    del[0].isDelete = true;
    console.log(`del : ${del}`);
    console.log(del);
    io.emit("delete", name);

    // Check if the deletion of the city satisfies any dynamic queries
    checkDynamicQueries(del[0]);
  });

  // Listen for 'query' events from clients
  socket.on("query", (query) => {
    console.log("Querying cities:", query);

    // Filter the list of cities based on the query and send the result to the client
    let result = filterCities(query);
    socket.emit("query", result);
  });

  // Listen for 'subscribe' events from clients
  socket.on("subscribe", (query) => {
    const key = JSON.stringify(query);
    console.log("Client subscribed to dynamic query:", key);

    // Add the client to the list of subscribers for the given query
    if (!dynamicQuerySubscribers[key]) {
      dynamicQuerySubscribers[key] = [];
    }
    dynamicQuerySubscribers[key].push(socket);
  });

  // Listen for 'unsubscribe' events from clients
  socket.on("unsubscribe", (query) => {
    const key = JSON.stringify(query);
    console.log("Client unsubscribed from dynamic query:", key);
    // Remove the client from the list of subscribers for the given query
    try {
      let index = dynamicQuerySubscribers[key].indexOf(socket);
      dynamicQuerySubscribers[key].splice(index, 1);
    } catch (error) {}
  });
});
function doesCitySatisfyQuery(city, query) {
  for (let key in query) {
    if (!city.hasOwnProperty(key)) {
      return false;
    }

    const cityValue = city[key];
    const queryValue = query[key];
    console.log(cityValue, queryValue);
    if (queryValue) {
      console.log(cityValue, queryValue);
      if (typeof cityValue === "string") {
        if (cityValue.toLowerCase() !== queryValue.toLowerCase()) {
          return false;
        }
      } else if (typeof cityValue === "number") {
        if (cityValue !== queryValue) {
          return false;
        }
      } else if (typeof cityValue === "boolean") {
        if (cityValue !== queryValue) {
          return false;
        }
      } else {
        // Handle other data types as needed
      }
    }
  }

  return true;
}

// Helper function to filter the list of cities based on the query
function filterCities(query, city) {
  let filteredCities = [];
  try {
    filteredCities = city === undefined ? cities : [city];
    filteredCities = filteredCities.filter((c) =>
      doesCitySatisfyQuery(c, query)
    );
    return filteredCities;
  } catch (error) {
    console.log(error);
    return filteredCities;
  }
}

// Helper function to check if a city satisfies any dynamic queries
function checkDynamicQueries(city, event) {
  for (let query in dynamicQuerySubscribers) {
    let match = filterCities(JSON.parse(query), city).length > 0;
    if (match) {
      // The city satisfies the query, so emit it to all subscribers
      let subscribers = dynamicQuerySubscribers[query];
      for (let i = 0; i < subscribers.length; i++) {
        subscribers[i].emit("dynamic query", city);
      }
    }
  }
}

function isAddOrEditDelete(city, isDelete = false) {
  const index = cities.findIndex((c) => c.name.toLowerCase() == city.name.toLowerCase());
  if (isDelete) {
    return cities.splice(index, 1);
  } else {
    console.log(`${index} ${city.name}`)
    if (index !== -1) {
      cities[index] = city;
    } else {
      cities.push(city);
    }
  }
}

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/listCity.html");
});
app.get("/createCity", (req, res) => {
  res.render("createCity");
});
app.get("/updateCity/:name", (req, res) => {
  const city = cities.find((c) => c.name === req.params.name);
  if (city) {
    res.render("updateCity", { city });
  } else {
    res.send("City not found");
  }
});
server.listen(8080, () => {
  console.log("Server listening on port 3000");
});
