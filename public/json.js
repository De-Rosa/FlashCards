import items from "../src/items.json" with { type: 'json'};

document.getCard = function (rarity) {
    let cards = document.getCards(rarity);
    if (cards.length === 0) return null;
    let random = Math.floor(Math.random() * cards.length);
    return cards[random].itemID;
}

document.getCards = function (rarity) {
    return items.filter(obj => {
        return obj.rarity === rarity && obj.itemID > 3
    });
}

document.getItemDetails = function (itemID) {
    let details = items.filter(obj => {
        return obj.itemID === itemID
    });

    if (details.length === 0) return null;
    return details[0];
}

document.getPlugin = function (rarity) {
    let plugins = document.getPlugins(rarity);
    let random = Math.floor(Math.random() * plugins.length);
    return plugins[random].itemID;
}

document.getPlugins = function (rarity) {
    return items.filter(obj => {
        return obj.rarity === rarity && obj.itemID < 0
    });
}