// Musician app
// Gwendoline Dössegger & Cassandre Wojciechowski

const dgram = require('dgram');
const socket = dgram.createSocket('udp4');
const { v4: uuidv4 } = require('uuid');

const PORT = 4444;
const ADD_MULTICAST = "239.255.22.5";

if(process.argv.length != 3) {
	console.log("We need 3 arguments : node musician.js < instrument >.");
	process.exit(1);
}

// Get the sound of the instrument given in argument
function getSound(instrument){
	switch(instrument){
		case "piano":
			return "ti-ta-ti";
		case "trumpet":
			return "pouet";
		case "flute":
			return "trulu";
		case "violin":
			return "gzi-gzi";
		case "drum":
			return "boum-boum";
		default:
			console.log("This instrument does not exist.");
			process.exit(1);
	}
}

console.log("I play the " + process.argv[2]);

// Setting the id and the sound of the musician
var musician = {
	musician_uuid : uuidv4(),
	sound : getSound(process.argv[2])
};

// Setting the message to send on the network
var payload = JSON.stringify(musician);
const msg = Buffer.from(payload);

// Sending the message
function playMusic(){
	socket.send(msg, 0, msg.length, PORT, ADD_MULTICAST);
	console.log("Send payload to " + ADD_MULTICAST + " on port " + PORT);
}

// Send the message every second
setInterval(playMusic,1000);

