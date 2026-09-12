import { AbilityScores, CharacterData, RuleEdition } from '../types/character';
import { rollSum } from './dice';
import { DEFAULT_SKILLS_6TH } from '../data/defaultSkills';

export const rollInitialAbilities = (edition: RuleEdition): AbilityScores => {
  if (edition === '7th') {
    // 7版：各ダイス値×5
    return {
      str: rollSum(6, 3) * 5,
      con: rollSum(6, 3) * 5,
      pow: rollSum(6, 3) * 5,
      dex: rollSum(6, 3) * 5,
      app: rollSum(6, 3) * 5,
      siz: rollSum(6, 2, 6) * 5,
      int: rollSum(6, 2, 6) * 5,
      edu: rollSum(6, 3, 3) * 5,
    };
  }

  // 6版
  return {
    str: rollSum(6, 3),
    con: rollSum(6, 3),
    pow: rollSum(6, 3),
    dex: rollSum(6, 3),
    app: rollSum(6, 3),
    siz: rollSum(6, 2, 6),
    int: rollSum(6, 2, 6),
    edu: rollSum(6, 3, 3),
  };
};

export const calculateDerivedStats = (abilities: AbilityScores, edition: RuleEdition) => {
  const { str, con, pow, dex, siz, int, edu } = abilities;

  if (edition === '7th') {
    const maxHp = Math.floor((con + siz) / 10);
    const maxMp = Math.floor(pow / 5);
    const san = pow;
    const maxSan = 99; // クトゥルフ神話技能を引く前
    const luck = rollSum(6, 3) * 5;

    // 7th DB & Build
    const totalStrSiz = str + siz;
    let damageBonus = '0';
    let build = 0;

    if (totalStrSiz <= 64) {
      damageBonus = '-2';
      build = -2;
    } else if (totalStrSiz <= 84) {
      damageBonus = '-1';
      build = -1;
    } else if (totalStrSiz <= 124) {
      damageBonus = '0';
      build = 0;
    } else if (totalStrSiz <= 164) {
      damageBonus = '+1D4';
      build = 1;
    } else if (totalStrSiz <= 204) {
      damageBonus = '+1D6';
      build = 2;
    } else {
      damageBonus = '+2D6';
      build = 3;
    }

    // 7th Move Rate
    let moveRate = 8;
    if (dex < siz && str < siz) {
      moveRate = 7;
    } else if (dex >= siz && str >= siz) {
      moveRate = 9;
    } else {
      moveRate = 8;
    }

    return {
      hp: maxHp,
      maxHp,
      mp: maxMp,
      maxMp,
      san,
      maxSan,
      initialSan: san,
      idea: int,
      luck,
      know: edu,
      damageBonus,
      build,
      moveRate,
    };
  }

  // 6th
  const maxHp = Math.ceil((con + siz) / 2);
  const maxMp = pow;
  const san = pow * 5;
  const maxSan = 99;
  const idea = int * 5;
  const luck = pow * 5;
  const know = edu * 5;

  // 6th DB
  const sum = str + siz;
  let damageBonus = '0';
  if (sum <= 12) damageBonus = '-1D6';
  else if (sum <= 16) damageBonus = '-1D4';
  else if (sum <= 24) damageBonus = '0';
  else if (sum <= 32) damageBonus = '+1D4';
  else if (sum <= 40) damageBonus = '+1D6';
  else damageBonus = '+2D6';

  return {
    hp: maxHp,
    maxHp,
    mp: maxMp,
    maxMp,
    san,
    maxSan,
    initialSan: san,
    idea,
    luck,
    know,
    damageBonus,
    build: 0,
    moveRate: 8,
  };
};

export const createNewCharacter = (edition: RuleEdition = '6th'): CharacterData => {
  const abilities = rollInitialAbilities(edition);
  const derived = calculateDerivedStats(abilities, edition);

  // 技能一覧をコピーして初期値をDEX/EDU等に合わせて設定
  const skills = DEFAULT_SKILLS_6TH.map(s => {
    let init = s.initValue;
    if (s.id === 'dodge') {
      init = edition === '7th' ? Math.floor(abilities.dex / 2) : abilities.dex * 2;
    } else if (s.id === 'own_lang') {
      init = edition === '7th' ? abilities.edu : abilities.edu * 5;
    }
    return { ...s, initValue: init };
  });

  const jobPoints = edition === '7th' ? abilities.edu * 4 : abilities.edu * 20;
  const hobbyPoints = edition === '7th' ? abilities.int * 2 : abilities.int * 10;

  return {
    id: `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: '',
    kana: '',
    edition,
    job: '',
    age: '',
    gender: '',
    origin: '',
    abilities,
    ...derived,
    skills,
    jobPointsRemaining: jobPoints,
    hobbyPointsRemaining: hobbyPoints,
    backstory: {
      personalDescription: '',
      ideology: '',
      significantPeople: '',
      meaningfulLocations: '',
      treasuredPossessions: '',
      traits: '',
      injuriesScars: '',
      phobiasManias: '',
    },
    memo: '',
    updatedAt: new Date().toISOString(),
  };
};
