import type { JWTToken } from "@api/contracts/authContract";
import crypto from "node:crypto";

const toBase64 = (obj) => {
	// converts the obj to a string
	const str = JSON.stringify(obj);
	// returns string converted to base64
	return Buffer.from(str).toString("base64");
};

const replaceSpecialChars = (b64string: string): string => {
	// create a regex to match any of the characters =,+ or / and replace them with their // substitutes
	return b64string.replace(/[=+/]/g, (charToBeReplaced) => {
		switch (charToBeReplaced) {
			case "=":
				return "";
			case "+":
				return "-";
			case "/":
				return "_";
		}
	});
};

// create a signature using the header and payload

const createSignature = (jwtB64Header: string, jwtB64Payload: string, secret: string) => {
	// create a HMAC(hash based message authentication code) using sha256 hashing alg
	const signature = crypto.createHmac("sha256", secret);

	// use the update method to hash a string formed from our jwtB64Header a period and
	//jwtB64Payload
	signature.update(`${jwtB64Header}.${jwtB64Payload}`);

	//signature needs to be converted to base64 to make it usable
	let signed = signature.digest("base64");

	//of course we need to clean the base64 string of URL special characters
	signed = replaceSpecialChars(signed);
	return signed;
};

export function signJWT(payload: JWTToken, secret: string): string {
	const header = {
		alg: "HS256",
		typ: "JWT",
	};

	// convert the header to a base64 string
	const b64Header = replaceSpecialChars(toBase64(header));
	// convert the payload to a base64 string
	const b64Payload = replaceSpecialChars(toBase64(payload));

	// clean the base64 string of URL special characters

	// create a signature using the header and payload
	const signature = createSignature(b64Header, b64Payload, secret);

	// return the token
	return `${b64Header}.${b64Payload}.${signature}`;
}
