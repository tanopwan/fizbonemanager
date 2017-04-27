'use strict';

const sessions = {};

module.exports = {
	createSession(senderID, recipientID, timeOfMessage) {
		let key = `${recipientID}_${senderID}`;
		let session = sessions.key;
		if (!session) {
			session = {
				senderID,
				recipientID,
				timeOfMessage,
				state: {
					name: 'idle',
				}
			}
			sessions.key = session;
		}
		console.log("Create User Session...");
		console.log(sessions);
	},
	getSession(senderID, recipientID) {
		let key = `${recipientID}_${senderID}`;
		return sessions.key;
	},
	setState(senderID, recipientID, newState) {
		let key = `${recipientID}_${senderID}`;
		let session = sessions.key;
		if (session) {
			session.state = newState;
		}
	}
}
