/**
 * Created by PG on 26/08/2017.
 */
var shopifyObj = require('shopify-node');

var SHOPIFY_SECRET = "7b830254df69f0826dffcb28f72167a3";
var SHOPIFY_REDIRECT = "https://28b98a72.ngrok.io/shopify_redirect";
var SHOPIFY_ID = "c9c1330745e6fa697b0a153291885db8";
var SHOPIFY_SCOPE = 'read_products,read_content,read_themes,read_customers,read_orders,read_script_tags,read_fulfillments,read_shipping,write_products,write_content,write_themes,write_customers,write_orders,write_script_tags,write_fulfillments,write_shipping,read_product_listings,write_checkouts';

var _tokensCache = {};
var fs = require('fs');
var helper = {

    getUrl: function (name) {

        var shopify = new shopifyObj({
            shop_name: name,
            id: SHOPIFY_ID,
            secret: SHOPIFY_SECRET,
            redirect: SHOPIFY_REDIRECT,
            scope: SHOPIFY_SCOPE
        });
        return shopify.createURL();
    },

    saveAccessToken: function (code, shop, callback) {
        console.log("saving token for " + shop);

        var shopify = new shopifyObj({
            shop_name: shop,
            id: SHOPIFY_ID,
            secret: SHOPIFY_SECRET,
            redirect: SHOPIFY_REDIRECT,
            scope: SHOPIFY_SCOPE
        });

        shopify.getAccessToken(code, function (err, token) {
            if (err != undefined) {
                console.log(err);
                callback.error();
            } else {
                console.log(token);
                _tokensCache[shop] = token;
                callback.success();
            }

        })
    },

    getAuthShop: function (shop) {

        return new shopifyObj({
            shop_name: shop,
            id: SHOPIFY_ID,
            secret: SHOPIFY_SECRET,
            redirect: SHOPIFY_REDIRECT,
            scope: SHOPIFY_SCOPE,
            access_token: _tokensCache[shop]
        });
    },

    getShopData: function (shop, callback) {
        console.log("requesting");
        this.getAuthShop(shop).get('/admin/shop.json', function (err, data) {
            if (err) {
                console.log(err);
                callback.error(err);
            } else {
                console.log("success")
                callback.success({token: _tokensCache[shop], shop: data.shop});
            }
        })
    },

    getName: function (shop) {
        return shop.replace(".myshopify.com", "")
    },

    getCategoriesTemplate: function (callback) {
        fs.readFile('./app/shopify_categories.html', 'utf8', function (err, data) {
            if (err) {
                callback.error(err);
            } else {
                console.log(data);
                callback.success(data);
            }
        })
    },

    getCallback: function (success, error) {
        return {success: success, error: error}
    }


}


module.exports = helper;