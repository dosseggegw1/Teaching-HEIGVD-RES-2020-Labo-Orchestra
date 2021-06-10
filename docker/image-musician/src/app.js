

var dgram = require('dgram');
var socket = dgram.createSocket('udp4');
const { v4: uuidv4 } = require('uuid');

const PORT = 4444;
const ADD_MULTICAST = 239.255.22.5;

console.log("I play " + process.argv[2]);



var musician = {
	musicianUuid : uuidv4(),
	sound : getSound(process.argv[2])
};


// Get sound of the instrument
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
	}
}

function playMusic(){	
	socket.send(Buffer.from(JSON.stringify(musician), PORT, ADDR_MULTICAST);
}


// Send the sound every second 
setInterval(playMusic,1000);
