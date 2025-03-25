// 卡牌工具函数
const logger = require('./logger');

// 卡牌花色
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];

// 卡牌点数
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// 创建一副完整的扑克牌
const createDeck = () => {
  const deck = [];
  
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  
  logger.debug(`Created a new deck with ${deck.length} cards`);
  
  return deck;
};

// 洗牌算法 (Fisher-Yates shuffle)
const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  logger.debug('Deck shuffled');
  
  return shuffled;
};

// 从牌堆抽取一定数量的牌
const drawCards = (deck, count) => {
  if (deck.length < count) {
    logger.error(`Cannot draw ${count} cards from a deck with only ${deck.length} cards`);
    throw new Error('Not enough cards in the deck');
  }
  
  const drawnCards = deck.slice(0, count);
  
  logger.debug(`Drew ${count} cards from the deck`);
  
  return drawnCards;
};

// 获取卡牌显示名称
const getCardName = (card) => {
  const rankNames = {
    'J': 'Jack',
    'Q': 'Queen',
    'K': 'King',
    'A': 'Ace'
  };
  
  const suitNames = {
    'hearts': 'Hearts',
    'diamonds': 'Diamonds',
    'clubs': 'Clubs',
    'spades': 'Spades'
  };
  
  const rankName = rankNames[card.rank] || card.rank;
  const suitName = suitNames[card.suit];
  
  return `${rankName} of ${suitName}`;
};

// 获取手牌描述
const getHandDescription = (hand) => {
  const handTypes = {
    'Royal Flush': '皇家同花顺',
    'Straight Flush': '同花顺',
    'Four of a Kind': '四条',
    'Full House': '葫芦',
    'Flush': '同花',
    'Straight': '顺子',
    'Three of a Kind': '三条',
    'Two Pair': '两对',
    'One Pair': '一对',
    'High Card': '高牌'
  };
  
  return handTypes[hand] || hand;
};

module.exports = {
  SUITS,
  RANKS,
  createDeck,
  shuffleDeck,
  drawCards,
  getCardName,
  getHandDescription
};
