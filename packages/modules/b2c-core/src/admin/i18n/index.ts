import enGlobal from './json/en-global.json' with { type: 'json' };
import en from './json/en.json' with { type: 'json' };
import zhCNGlobal from './json/zhCN-global.json' with { type: 'json' };
import zhCN from './json/zhCN.json' with { type: 'json' };

export default {
  en: {
    translation: enGlobal,
    b2c: en,
  },
  zhCN: {
    translation: zhCNGlobal,
    b2c: zhCN
  }
};
