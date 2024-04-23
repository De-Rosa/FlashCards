import data from './src/items.js'
const items = data.data;

document.getCard = function (rarity = null, type = null) {
    let cards = document.getCards(rarity, type);
    if (cards.length === 0) return null;
    let random = Math.floor(Math.random() * cards.length);
    return cards[random].itemID;
}

document.getPackCard = function (rarity) {
    let cards = document.getPackCards(rarity);
    if (cards.length === 0) return null;
    let random = Math.floor(Math.random() * cards.length);
    return cards[random].itemID;
}

document.getPackCards = function (rarity) {
    return items.filter(obj => {
        return obj.rarity === rarity && obj.type !== "status" && obj.type !== "curse" && obj.itemID > 3;
    });
}

document.getCards = function (rarity, type) {
    return items.filter(obj => {
        return (obj.rarity === rarity || rarity === null) && (obj.type === type || type === null) && obj.itemID > 3;
    });
}

document.getItemDetails = function (itemID) {
    let details = items.filter(obj => {
        return obj.itemID === itemID
    });

    if (details.length === 0) return null;
    return details[0];
}

document.getPlugin = function (rarity, currentPlugins = []) {
    let plugins = document.getPlugins(rarity, currentPlugins);
    if (plugins.length === 0) return null;
    let random = Math.floor(Math.random() * plugins.length);
    return plugins[random].itemID;
}

document.getPlugins = function (rarity, currentPlugins = []) {
    return items.filter(obj => {
        return obj.rarity === rarity && obj.itemID < 0 && !currentPlugins.includes(obj);
    });
}