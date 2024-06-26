const dotenv = require("dotenv").config();
var nforce = require("nforce");
const axios = require("axios");

// create the connection with the Salesforce connected app
var org = nforce.createConnection({
	clientId: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,
	redirectUri: process.env.CALLBACK_URL,
	apiVersion: process.env.VERSION,
	mode: "single",
	autoRefresh: true,
});
// authenticate and return OAuth token
org.authenticate(
	{
		username: process.env.USERNAME,
		password: process.env.PASSWORD,
		securityToken: process.env.SECURITY_TOKEN,
	},
	function (err, resp) {
		if (!err) {
			const _instance_url = org.oauth.instance_url;
			const _accessToken = org.oauth.access_token;
			console.log("Salesforce Org Authorization - OK");

			// Authorization Request to Data Cloud
			const data = {
				grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
				assertion: process.env.ASSERTION,
			};
			axios
				.post(_instance_url + "/services/oauth2/token", data, {
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
						Authorization: "Bearer " + _accessToken,
					},
				})
				.then(function (response) {
					// console.log(response);
					const _DataCloud_accessToken = response.data.access_token;
					console.log("Data Cloud Authorization - OK");

					// Get Data Cloud Token
					const data = {
						grant_type: "urn:salesforce:grant-type:external:cdp",
						subject_token_type:
							"urn:ietf:params:oauth:token-type:access_token",
						subject_token: _accessToken,
					};
					axios
						.post(_instance_url + "/services/a360/token", data, {
							headers: {
								"Content-Type":
									"application/x-www-form-urlencoded",
							},
						})
						.then(function (response) {
							//console.log(response.data.access_token);
							data_cloud_access_token =
								response.data.access_token;
							data_cloud_instance_url =
								response.data.instance_url;
							console.log("Data Cloud Token - OK");
						})
						.catch(function (error) {
							console.log(error);
						});
				})
				.catch(function (error) {
					console.log(error);
				});
		}
		if (err) {
			console.log(err);
		}
	}
);
