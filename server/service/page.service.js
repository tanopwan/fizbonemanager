'use strict';

var config = require('../config/environment');
var https = require('https');
var CustomerService = require('./customer.service');
var crypto = require('crypto');
var moment = require('moment');

const getPages = function (accessToken, onPages) {
    return new Promise((resolve, reject) => {
        var options = {
            host: 'graph.facebook.com',
            port: 443,
            path: '/me/accounts?access_token=' + accessToken,
            method: 'GET'
        };

        var fbReq = https.request(options, function (fbRes) {
            fbRes.setEncoding('utf8');
            let rawData = '';
            fbRes.on('data', function (chunk) {
                rawData += chunk;
            });
            fbRes.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    resolve(parsedData);
                    //onPages(null, parsedData);
                } catch (e) {
                    console.log(e.message);
                    reject(e.message);
                    //onPages(e.message, null);
                }
            });
        });

        fbReq.on('error', function (e) {
            console.log('problem with request: ' + e.message);
        });

        fbReq.end();
    });
}

const getPage = function (req, res) {
    let accessToken = req.user.providerRef.accessToken;
    let pageId = config.page_id;

    return getPages(accessToken).then(fbPages => {
        res.json(fbPages.data.filter(page => page.id === pageId)[0]);
    }).catch(error => {
        res.status(500).json(error);
    });
}

const getConversations = function (req, res) {
    let accessToken = req.user.providerRef.accessToken;
    let pageId = config.page_id;
    let conversations = [];
    let page = null;

    return getPages(accessToken)
        .then(fbPages => {
            return new Promise((resolve, reject) => {
                page = fbPages.data.find(page => page.id === pageId);
                var options = {
                    host: 'graph.facebook.com',
                    port: 443,
                    path: '/' + config.page_id + '/conversations?access_token=' + page.access_token,
                    method: 'GET'
                };

                var fbReq = https.request(options, function (fbRes) {
                    fbRes.setEncoding('utf8');
                    let rawData = '';
                    fbRes.on('data', function (chunk) {
                        rawData += chunk;
                    });
                    fbRes.on('end', () => {
                        try {
                            const parsedData = JSON.parse(rawData);
                            resolve(parsedData);
                        } catch (e) {
                            console.log(e.message);
                            reject(e.message);
                        }
                    });
                });

                fbReq.on('error', function (e) {
                    console.log('problem with request: ' + e.message);
                });

                fbReq.end();
            })
        })
        .then(fbConversations => {
            let customerPromises = [];
            fbConversations.data.forEach(fbConversation => {
                let conversation = {}
                conversation.id = fbConversation.id;
                conversation.snippet = fbConversation.snippet;
                conversation.updated_time = fbConversation.updated_time;
                conversation.participants = fbConversation.participants.data.filter(participant => {
                    return participant.id !== pageId;
                });
                conversation.participant = conversation.participants[0];
                conversation.unread_count = fbConversation.unread_count;
                conversations.push(conversation);
                customerPromises.push(CustomerService.getCustomerFromConversationParticipantId(conversation.participant.id).then(customer => {
                    conversation.customer = customer;
                    return Promise.resolve(customer);
                }));
            });
            return Promise.all(customerPromises);
        })
        .then(result => {
            res.json(conversations);
        })
        .catch(error => {
            res.status(500).json(error);
        });
}

const getMessages = function (pageAccessToken, conversationId, limitDays, allMessages, next) {

    return new Promise((resolve, reject) => {
        let path = '/v2.10/' + conversationId + '/messages?access_token=' + pageAccessToken + '&fields=attachments,created_time';
        if (next) {
            path = next.replace('https://graph.facebook.com', '');
        }

        console.log("path", path);

        var options = {
            host: 'graph.facebook.com',
            port: 443,
            path: path,
            method: 'GET'
        };

        var fbReq = https.request(options, function (fbRes) {
            fbRes.setEncoding('utf8');
            let rawData = '';
            fbRes.on('data', function (chunk) {
                rawData += chunk;
            });
            fbRes.on('end', () => {
                try {
                    const messages = JSON.parse(rawData);
                    allMessages = allMessages.concat(messages.data);
                    
                    console.log("allMessages", allMessages.length);
                    if (moment(allMessages[allMessages.length - 1].created_time).isAfter(moment().add(limitDays, 'days'))) {
                        return getMessages(user, conversationId, limitDays, allMessages, next);
                    }
                    else {
                        resolve(allMessages);
                    }

                } catch (e) {
                    console.log(e.message);
                    reject(e.message);
                }
            });
        });

        fbReq.on('error', function (e) {
            console.log('problem with request: ' + e.message);
        });

        fbReq.end();
    });
}

const getAttachments = function (user, conversationId) {
    return getPages(user.providerRef.accessToken).then(fbPages => {
        return Promise.resolve(fbPages.data.filter(page => page.id === config.page_id)[0]);
    }).then(page => {
        return getMessages(page.access_token, conversationId, -3, []).then(messages => {
            let attachments = []
            messages.forEach(message => {
                if (message.attachments) {
                    attachments.push(message.attachments.data[0]);
                }
            })
            return Promise.resolve(attachments);
        });
    });
}

const getIdForPage = (conversationUserId, access_token) => {
    return new Promise((resolve, reject) => {
        let hmac = crypto.createHmac('sha256', config.PAGE_SECRET);
        hmac.update(access_token);
        let signature = hmac.digest('hex');
        let appSecretProof = signature;
        var options = {
            host: 'graph.facebook.com',
            port: 443,
            path: '/v2.10/' + conversationUserId + '/ids_for_pages?access_token=' + access_token + '&appsecret_proof=' + appSecretProof,
            method: 'GET',
        };
        try {
            var fbReq = https.request(options, function (fbRes) {
                fbRes.setEncoding('utf8');
                let rawData = '';
                fbRes.on('data', function (chunk) {
                    rawData += chunk;
                });
                fbRes.on('end', () => {
                    try {
                        const parsedData = JSON.parse(rawData);
                        resolve(parsedData);
                    } catch (e) {
                        reject(e.message);
                    }
                });
            });

            fbReq.on('error', function (e) {
                console.log('problem with request: ' + e.message);
            });

            fbReq.end();
        }
        catch (e) {
            console.log("error", e.message);
        }
    }).then(userPages => {
        let userPage = userPages.data.find(userPage => {
            return userPage.page.id === config.page_id;
        });
        return Promise.resolve(userPage);
    });
}

module.exports = {
    getPage,
    getConversations,
    getAttachments,
    getIdForPage,
}