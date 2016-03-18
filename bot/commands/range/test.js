var range = require("./index.js");

var command = {
	args: {_:[88888888, "vrla", "vrla", "vrla", "vrla"]},
	respond: respond
}

function respond(text) {
	console.log(text);
}

console.log("testing with : "+ command.args._);
range.exec(command);

var command = {
	args: {_:[6881.28]},
	respond: respond
}
console.log("testing with : "+ command.args._);
range.exec(command);

var command = {
	args: {_:[88888889]},
	respond: respond
}
console.log("testing with : "+ command.args._);
range.exec(command);

var command = {
	args: {_:[0]},
	respond: respond
}
console.log("testing with : "+ command.args._);
range.exec(command);

var command = {
	args: {_:[10000]},
	respond: respond
}
console.log("testing with : "+ command.args._);
range.exec(command);

var command = {
	args: {_:[88888888]},
	respond: respond
}
console.log("testing with : "+ command.args._);
range.exec(command);

var command = {
	args: {_:[200, 5]},
	respond: respond
}
console.log("testing with : "+ command.args._);
range.exec(command);


var command = {
	args: {_:["https://www.ingress.com/intel?ll=27.485766,-114.977805&z=5&pll=33.419505,-117.620146",
	          "https://www.ingress.com/intel?ll=22.062128,-136.511008&z=5&pll=19.491163,-154.960195"]},
	respond: respond
}
console.log("testing with : " + command.args._);
range.exec(command);

var command = {
	args: {_:["pll=33.419505,-117.620146",
	          "pll=19.491163,-154.960195"]},
	respond: respond
}
console.log("testing with : " + command.args._);
range.exec(command);

var command = {
	args: {_:["x117.620146",
	          "pll=19.491163,-154.960195"]},
	respond: respond
}
console.log("testing with : " + command.args._);
range.exec(command);

