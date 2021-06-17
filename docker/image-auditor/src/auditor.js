// Auditor app
// Gwendoline Dössegger & Cassandre Wojciechowski

const PORT_UDP = 4444;
const PORT_TCP = 2205;
const ADD_MULTICAST = "239.255.22.5";

const dgram = require('dgram');
const moment = require('moment');
const socket = dgram.createSocket('udp4');

var musicians = new Map();

// Translate the sound received to an instrument
function getInstrument(sound){
	switch(sound){
		case "ti-ta-ti":
			return "piano";
		case "pouet":
			return "trumpet";
		case "trulu":
			return "flute";
		case "gzi-gzi":
			return "violin";
		case "boum-boum":
			return "drum";
	}
}

/**
 * UDP configuration
 */
// Listening to the sounds emitted by the musicians
socket.bind(PORT_UDP, function() {
	console.log("Auditor joined the multicast group on port " + PORT_UDP);
	socket.addMembership(ADD_MULTICAST);
});

// Getting the musician's informations
socket.on('message', function(msg, rinfo){
	const infoMusician = JSON.parse(msg);
	const id = infoMusician.musician_uuid;
	const instrument = getInstrument(infoMusician.sound);

	// If the musician already exists in the map, we update the time of his last emitted sound
	if(musicians.has(id)){
		musicians.get(id).lastActive = moment();
	// If the musician does not exist in the map, we add all his informations in it
	}else{
		musicians.set(id,{
			"instrument": instrument,
			"activeSince": moment(),
			"lastActive" : moment()
		});
	}
	console.log("The musician " + id + " plays the " + instrument + ".");
});

/**
* TCP configuration
*/
const net = require("net");
const serverTCP = net.createServer();

// Auditor listens on TCP port 2205
serverTCP.listen(PORT_TCP, function(){
	console.log("Auditor TCP server is listening on port " + PORT_TCP);
});

// Sending the list of active musicians
serverTCP.on('connection', function(socket){
	console.log("New connection established");
	var musiciansActive = [];

	// Testing each musician to check if he is still active
	musicians.forEach((value, key) => {
		// If the musician is inactive, we delete him from the list
		if(moment().diff(moment(value.lastActive),'seconds') > 5){
			musicians.delete(key);
			console.log("The musician " + key + " is not active !")
		// Otherwise we send his info
		}else{
			musiciansActive.push({
				"uuid": key,
				"instrument": value.instrument,
				"activeSince": value.activeSince
			});
		}
	});

	socket.write(JSON.stringify(musiciansActive));
	socket.destroy();
});