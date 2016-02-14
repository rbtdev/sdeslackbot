module.exports = function (req, res, next) {
	var page = req.query.page?parseInt(req.query.page):null;
	var limit = req.query.limit?parseInt(req.query.limit):null;
	var start = req.query.start?parseInt(req.query.start):null;
	if (!start && page && limit) {
		start = page * limit;
	}
	req.paginate = {page:page, limit:limit, start:start};
	next();
}
