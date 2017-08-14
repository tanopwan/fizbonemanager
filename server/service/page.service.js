'use strict';

var config = require('../config/environment');
var https = require('https');
var CustomerService = require('./customer.service');


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

    return getPages(accessToken).then(pages => {
        res.json(pages.filter(page => page.id = confi));
    }).catch(error => {
        res.status(500).json(error);
    });
}

const getFBConversations = function (accessToken, pageId) {
    return getPages(accessToken)
        .then(fbPages => {
            return new Promise((resolve, reject) => {
                let page = fbPages.data.find(page => page.id === pageId);
                var options = {
                    host: 'graph.facebook.com',
                    port: 443,
                    path: '/' + config.page_id + '/conversations?access_token=' + page.access_token,
                    method: 'GET'
                };

                var fbReq = https.request(options, function (fbRes) {
                    console.log('STATUS: ' + fbRes.statusCode);
                    console.log('HEADERS: ' + JSON.stringify(fbRes.headers));
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
        .catch(error => {
            res.status(500).json(error);
        });
}

const getConversations = function (req, res) {
    let accessToken = req.user.providerRef.accessToken;
    let pageId = config.page_id;
    let conversations = [];

    return getFBConversations(accessToken, pageId)
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
                conversations.push(conversation);
                customerPromises.push(CustomerService.getFacebookCustomer(conversation.participant.id).then(customer => {
                    conversation.participant.customer = customer;
                    return Promise.resolve();
                }));
            });
            return Promise.all(customerPromises);
        })
        .then(result => {
            conversations.participant.customer.customer
            res.json(conversations);
        })
        .catch(error => {
            res.status(500).json(error);
        });
}

module.exports = {
    getPage,
    getConversations,
}