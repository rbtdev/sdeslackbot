var LocationModel = require('../models/location.js');


function update(source, target) {
	target.name = source.name;
    target.area = source.area;
    target.intelUrl = source.intelUrl;
    target.mapsUrl = source.mapsUrl;
    target.shortCode = source.shortCode;
};


module.exports = {
	model: LocationModel,
	update: update,
	importFields: ["name", "area", "intelUrl", "mapsUrl", "shortCode"],
	exportFields: ['name', 'area', 'intelUrl', 'mapsUrl', 'shortCode', 'lat', 'lng'],
	exportFileName: "portals.csv",
	collectionName: LocationModel.modelName + "s",
	importKey: 'intelUrl'
};