const { autoTranslate } = require('./src/components/dashboard/utils/translateUtils.js');

// mock fetch since we're in node
global.fetch = async (url, options) => {
  console.log(`[FETCH] ${url}`, options.body);
  return {
    ok: true,
    json: async () => ({ translations: { id: "halo", fr: "bonjour" } })
  };
};

autoTranslate("hello").then(console.log).catch(console.error);
