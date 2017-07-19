'use strict';

var productService = require('../product.service.js');
var promotionService = require('../promotion.service.js');

const processIntention = (messageText) => {
    let message = messageText.toLowerCase();
    if (message.startsWith('sell')) {
        return 'Sale';
    }
}

const productKeywords = [
    { productCode: 'FZ01A', keywords: ['fz01a', 'chickenliver', 'ตับ', 'ตับไก่', 'liver']},
    { productCode: 'FZ02A', keywords: ['fz02a', 'salmon', 'แซลมอน', 'sal']}
];

const promotionKeywords = [
    { promotion: 'Online', keywords: ['online', 'facebook', 'fb', 'line', 'เฟส', 'ไลน์', 'เฟสบุ้ค', 'ออนไลน์']},
    { promotion: 'Wholesale', keywords: ['booth', 'บูธ']},
]

let promotionsPromise = promotionService.getPromotions().then(promotions => {
    console.log("Get Promotion Promise........");
    promotions.forEach(promotion => {
        let promotionKeyword = promotionKeywords.find(promotionKeyword => promotionKeyword.promotion === promotion.group);
        promotion.keywords = promotionKeyword.keywords;
    });
    return Promise.resolve(promotions);
});

let productsPromise = productService.getProducts().then(products => {
    console.log("Get Product Promise........");
    products.forEach(product => {
        let productKeyword = productKeywords.find(productKeyword => productKeyword.productCode === product.productCode);
        product.keywords = productKeyword.keywords;
    });
    return Promise.resolve(products);
});

const getProduct = (words) => {
    if (words.length <= 0) {
        console.log("Product is not specify");
        return Promise.reject();
    }
    return productsPromise.then(products => {
        let productObject = null;
        let index = -1;
        words.forEach((word, idx) => {
            products.forEach(product => {
                if (product.keywords.includes(word)) {
                    index = idx;
                    productObject = product;
                }
            });
        });
        if (index === -1) {
            console.log("Product is not found");
            return Promise.reject();
        }
        words.splice(index, 1);
        return Promise.resolve(productObject);
    });

}

const getPromotion = (words) => {
    if (words.length <= 0) {
        console.log("Promotion is not specify");
        return Promise.reject();
    }
    return promotionsPromise.then(promotions => {
        let promotionObject = null;
        let index = -1;
        words.forEach((word, idx) => {
            promotions.forEach(promotion => {
                console.log(promotion.keywords.join(), word);
                if (promotion.keywords.includes(word)) {
                    console.log("found");
                    index = idx;
                    promotionObject = promotion;
                }
            });
        });
        if (index === -1) {
            console.log("Promotion is not found");
            return Promise.reject();
        }
        words.splice(index, 1);
        return Promise.resolve(promotionObject);
    });
}

const getQuantity = (words) => {
    if (words.length <= 0) {
        console.log("Selling sku quantity is not specify");
        return;
    }
    let quantity = [];
    let index = -1;
    words.forEach((word, idx) => {
        if (word.match(/^[1-9]\d*$/g)) {
            quantity.push(word);
            index = idx;
        }
    });

    if (quantity.length != 1) {
        console.log("Selling sku quantity is not found");
        return;
    }
    words.splice(index, 1);
    return quantity[0];
}

const parseSaleIntention = (messageText) => {
    let message = messageText.toLowerCase();
    let cleanMessage = message.replace(/\s\s+/g, ' ');
    let words = cleanMessage.split(' ');
    words.forEach(word => console.log('"' + word + '"'));
    words.splice(0, 1); // remove first intention

    let resolvedProduct = null;
    let productIntention = getProduct(words).then(product => {
        resolvedProduct = product;
        return Promise.resolve();
    });

    let resolvedPromotion = null;
    let promotionIntention = getPromotion(words).then(promotion => {
        resolvedPromotion = promotion;
        return Promise.resolve();
    });

    let quantity = getQuantity(words);
    if (!quantity) {
        return Promise.reject();
    }

    return Promise.all([productIntention, promotionIntention]).then(() => {
        let saleIntention = {
            product: resolvedProduct,
            quantity,
            promotion: resolvedPromotion,
            tags: words
        }
        return Promise.resolve(saleIntention);
    });

}

module.exports = {
	processIntention,
    parseSaleIntention
}
