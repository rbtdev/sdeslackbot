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

