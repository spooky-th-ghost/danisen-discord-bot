const CharacterCodes = [
  'FILI',
  'CERE',
  'PEAK',
  'PARA',
  'FORT',
  'PAIN',
  'VALN',
  'DBBL',
  'SQIG',
  'BAND',
  'FUKU',
  'ELZA',
  'WULF',
  'ROBO',
  'ANIE',
  'UMBR',
]

const CodeEmojiPairs = [
  { code: 'FILI', emoji: '<:FILI:1022692715403681913>', name:'Filia' },
  { code: 'CERE', emoji: '<:CERE:1022692712014688339>', name:'Cerebella' },
  { code: 'PARA', emoji: '<:PARA:1022691457838108683>', name:'Parasoul' },
  { code: 'FORT', emoji: '<:FORT:1022692716901056534>', name:'Ms. Fortune' },
  { code: 'PEAK', emoji: '<:PEAK:1022692719459569664>', name:'Peacock' },
  { code: 'PAIN', emoji: '<:PAIN:1022692718343884860>', name:'Painwheel' },
  { code: 'VALN', emoji: '<:VALN:1022692722823409694>', name:'Valentine' },
  { code: 'DBBL', emoji: '<:DBBL:1022692713147158569>', name:'Double' },
  { code: 'SQIG', emoji: '<:SQIG:1022692721808375828>', name:'Squiggly' },
  { code: 'BAND', emoji: '<:BAND:1022692711133880320>', name:'Big Band' },
  { code: 'FUKU', emoji: '<:FUKU:1022692716276092968>', name:'Fukua' },
  { code: 'ELZA', emoji: '<:ELZA:1022692713956646984>', name:'Eliza' },
  { code: 'WULF', emoji: '<:WULF:1022692709732978729>', name:'Beowulf' },
  { code: 'ROBO', emoji: '<:ROBO:1022692720885637180>', name:'Robo-Fortune' },
  { code: 'ANIE', emoji: '<:ANIE:1022692709019942952>', name:'Annie' },
  { code: 'UMBR', emoji: '<:UMBR:1022692723926503494>', name:'Umbrella' },
]

const getEmoji = (charCode) => {
  let myPairingIndex = CodeEmojiPairs.findIndex(ce => ce.code == charCode);
  if (myPairingIndex != -1) {
    let emojiString =  `${CodeEmojiPairs[myPairingIndex].emoji} ${CodeEmojiPairs[myPairingIndex].name}`;
    return emojiString;
  } else {
    return '';
  }
}

const CharacterChoices = [
  { name: 'Filia', value: 'FILI' },
  { name: 'Cerebella', value: 'CERE' },
  { name: 'Peacock', value: 'PEAK' },
  { name: 'Parasoul', value: 'PARA' },
  { name: 'Ms.Fortune', value: 'FORT' },
  { name: 'Painwheel', value: 'PAIN' },
  { name: 'Vallentine', value: 'VALN' },
  { name: 'Double', value: 'DBBL' },
  { name: 'Squiggly', value: 'SQIG' },
  { name: 'Big Band', value: 'BAND' },
  { name: 'Fukua', value: 'FUKU' },
  { name: 'Eliza', value: 'ELZA' },
  { name: 'Beowulf', value: 'WULF' },
  { name: 'Robo - Fortune', value: 'ROBO' },
  { name: 'Annie', value: 'ANIE' },
  { name: 'Umbrella', value: 'UMBR' },
]

module.exports = {
  CharacterCodes,
  CharacterChoices,
  getEmoji
}
