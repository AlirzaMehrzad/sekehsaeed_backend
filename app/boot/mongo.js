const mongoos = require("mongoose");
const { MONGO_DBNAME, MONGO_HOST, MONGO_PORT } = process.env;
const { MONGO_URI } = process.env;

mongoos.connection.on("error", (error) => {
	console.log("mongodb connection failed", error.message);
});

const startMongoDB = () => {
	mongoos.connect(
		`mongodb://admin:secret@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DBNAME}?authSource=admin`,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
		}
	);
};
// const startMongoDB = () => {
//     mongoos.connect(`${MONGO_URI}`, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//     })
// }

module.exports = startMongoDB;
