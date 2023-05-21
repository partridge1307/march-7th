const fs = require('fs');
const axios = require('axios');
const puppeteer = require('puppeteer');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const localizedFormat = require('dayjs/plugin/localizedFormat');
const {
  fetchCodeAndEvent,
  fetchCharacterList,
  fetchLightConeList,
  fetchRelicList,
  fetchCharacterDatas,
} = require('../utils/star-rail');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

exports.request = async (url) => {
  const controller = new AbortController();
  const timeout = 15 * 1000;
  const id = setTimeout(() => controller.abort(), timeout);

  const res = await axios.get(url, { signal: controller.signal });
  clearTimeout(id);

  return res.data;
};

exports.sleep = (s) => {
  return new Promise((r) => setTimeout(r, s * 1000));
};

exports.updateData = async () => {
  console.log('Starting update data');
  const start = Date.now();
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    args: [
      '--disable-gpu',
      '--disable-setuid-sandbox',
      '--no-sandbox',
      '--no-zygote',
      '--single-process',
    ],
    headless: 'new',
  });
  const characterList = await fetchCharacterList(browser);
  const lightConeList = await fetchLightConeList(browser);
  const relicList = await fetchRelicList(browser);
  await browser.close();

  const util = await fetchCodeAndEvent();
  const characters = await fetchCharacterDatas(characterList);
  const currentTime = dayjs(new Date()).tz('Asia/Ho_Chi_Minh').format('L LT');

  let hsr_chars = {};
  hsr_chars.updateAt = currentTime;
  hsr_chars.characters = characters;
  fs.writeFileSync(
    `${__dirname}/../data/hsr-chars.json`,
    JSON.stringify(hsr_chars, null, 2),
    'utf-8'
  );

  let hsr_lightCones = {};
  hsr_lightCones.updateAt = currentTime;
  hsr_lightCones.lightCones = lightConeList;
  fs.writeFileSync(
    `${__dirname}/../data/hsr-lightCones.json`,
    JSON.stringify(hsr_lightCones, null, 2),
    'utf-8'
  );

  let hsr_relics = {};
  hsr_relics.updateAt = currentTime;
  hsr_relics.relics = relicList;
  fs.writeFileSync(
    `${__dirname}/../data/hsr-relics.json`,
    JSON.stringify(hsr_relics, null, 2),
    'utf-8'
  );

  let hsr_utils = {};
  hsr_utils.updateAt = currentTime;
  hsr_utils.codes = util.codes;
  hsr_utils.banners = util.banners;
  fs.writeFileSync(
    `${__dirname}/../data/hsr-utils.json`,
    JSON.stringify(hsr_utils, null, 2),
    'utf-8'
  );

  console.log(`Completed. Total time: ${Date.now() - start}ms`);
  return;
};
