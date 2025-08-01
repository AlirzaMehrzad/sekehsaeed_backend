const swaggerJSDoc = require("swagger-jsdoc");

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Sekehsaeed API",
			version: "1.0.0",
			description: "A simple express API",
		},
		servers: [
			{
				url: "http://localhost:3333", // change this based on your env
			},
		],
	},
	apis: ["./app/routes/*.js"], // ✅ Make sure this path matches your router files
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
