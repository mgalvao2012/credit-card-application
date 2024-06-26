require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const express = require("express");
const session = require("express-session");
var bodyParser = require("body-parser");

const axios = require("axios");
const app = express();
app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set("trust proxy", 1); // trust first proxy
app.use(
	session({
		secret: "keyboard cat",
		resave: false,
		saveUninitialized: true,
		cookie: { secure: true },
	})
);

require("./salesforce");
global.data_cloud_access_token = "";
global.data_cloud_instance_url = "";

app.get("/", async (request, response) => {
	response.render("creditCardForm.ejs", {});
});

app.post("/submit-form", (request, response) => {
	const data = {
		data: [
			{
				id: uuidv4(),
				firstname: request.body.firstname,
				lastname: request.body.lastname,
				email: request.body.email,
				dob: request.body.dob,
				address: request.body.address,
				city: request.body.city,
				state: request.body.state,
				zip: request.body.zip,
				ssn: request.body.ssn,
				creditcardtype: request.body.creditcardtype,
				annualincome: request.body.annualincome,
				creditcheckconsent:
					request.body.creditcheckconsent == "creditcheck" ? "true" : false,
				source: "web",
				lastupdated: new Date().toISOString(),
			},
		],
	};
	axios
		.post(
			"https://" +
				data_cloud_instance_url +
				"/api/v1/ingest/sources/credit_card_application/credit_card_application",
			data,
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + data_cloud_access_token,
				},
			}
		)
		.then(function (response) {
			console.log(response.statusText);
			console.log(data);
		})
		.catch(function (error) {
			console.log(error);
		});
	response.render("creditCardFormSubmitted.ejs", {});
});

app.get("/creditcheck/:ssn", async (request, response) => {
	response.json({
		ssn: request.params.ssn,
		creditScore: Math.floor(Math.random() * 1000),
		status: "success",
	});
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server listening at ${PORT}.`);
});
