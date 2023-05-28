const { url } = require('@ffmpeg-installer/ffmpeg');
const axios = require('axios');
const cheerio = require('cheerio');

const prydwen = 'https://www.prydwen.gg';

exports.fetchCodeAndEvent = async () => {
  const data = (await axios.get('https://www.prydwen.gg/star-rail/')).data;
  const $ = cheerio.load(data);

  const codeElements = $('.content.hsr > .codes > div');
  const codes = codeElements
    .map(function (i, el) {
      const code = $(this).find('p.code').text();
      const rewards = $(this).find('p.rewards').text();

      return {
        code,
        rewards,
      };
    })
    .toArray();

  const bannerElements = $('.content.hsr > .current-events').find('div.current-banner-details');
  const banners = bannerElements
    .map(function (i, el) {
      const bannerName = $(this).find('.character').text();
      const bannerDate = $(this).find('.dates').text();

      return {
        name: bannerName,
        date: bannerDate,
      };
    })
    .toArray();

  return {
    codes,
    banners,
  };

  // Puppeteer method

  // const page = await browser.newPage();
  // await page.goto('https://www.prydwen.gg/star-rail/');

  // const codeElements = await page.$$('.content.hsr > .codes >>> p.code');
  // const codePromise = codeElements.map(
  //   async (el) => await el.evaluate((e) => e.textContent)
  // );
  // const codes = await Promise.all(codePromise);

  // const eventElements = await page.$$(
  //   '.content.hsr > .current-events >>> div.current-banner-details'
  // );
  // const bannerPromise = eventElements.map(async (elements) => {
  //   const eventName = await elements
  //     .$('.character')
  //     .then(async (el) => await el.evaluate((e) => e.textContent));
  //   const eventDate = await elements
  //     .$('.dates')
  //     .then(async (el) => await el.evaluate((e) => e.textContent));

  //   return {
  //     eventName,
  //     eventDate,
  //   };
  // });
  // const banners = await Promise.all(bannerPromise);
  // await page.close();

  // return {
  //   codes,
  //   banners,
  // };
};

exports.fetchCharacterList = async (browser) => {
  const page = await browser.newPage();
  await page.goto('https://www.prydwen.gg/star-rail/characters', {
    timeout: 0,
    waitUntil: 'networkidle2',
  });
  const buttons = await page.$$(
    'div.content.hsr > .employees-filter-bar.hsr > .filter-bar-element.button_bar.element-2 > div.btn-group > span > button[type=button]'
  );

  let datas = [];
  for (const button of buttons) {
    const attribute = await button.evaluate(async (btn) => {
      await btn.click();
      return btn.getAttribute('value');
    });
    const nameElements = await page.$$(
      'div.content.hsr > div.employees-container > span >>> span.emp-name'
    );
    const namePromise = nameElements.map(
      async (element) => await element.evaluate((name) => name.textContent)
    );
    const names = await Promise.all(namePromise);

    datas.push({ type: attribute, names });
  }
  await page.close();

  return datas;
};

exports.fetchLightConeList = async (browser) => {
  const page = await browser.newPage();
  await page.goto('https://www.prydwen.gg/star-rail/light-cones', {
    timeout: 0,
    waitUntil: 'networkidle2',
  });
  const buttons = await page.$$(
    'div.content.hsr > .employees-filter-bar.hsr > .filter-bar-element.button_bar.element-2 > div.btn-group > span > button[type=button]'
  );

  let datas = [];
  for (const [i, button] of buttons.entries()) {
    const attribute = await button.evaluate(async (btn) => {
      await btn.click();
      return btn.getAttribute('value');
    });
    const lightConeElements = await page.$$(
      'div.content.hsr > div.relic-set-container >>> div.hsr-cone'
    );

    let lightCones = [];
    for (const element of lightConeElements) {
      const name = await (
        await element.$('div.hsr-set-name > h4')
      ).evaluate((name) => name.textContent);

      const imageLink = await (
        await element.$('div.hsr-set-image >>> picture > img')
      ).evaluate((img) => img.getAttribute('src'));

      const rarity = (
        await (await (await element.$('div.hsr-set-image')).getProperty('className')).jsonValue()
      )
        .split(' ')[1]
        .split('-')
        .pop();

      const description = await (
        await element.$(
          'div.accordion > div.accordion-item > div.accordion-collapse >>> div.hsr-set-description > p'
        )
      ).evaluate((desc) => desc.textContent);

      const statElements = await element.$$(
        'div.accordion > div.accordion-item >>> div.accordion-body >>> div.cone-pills'
      );

      const stats = [];
      for (const el of statElements) {
        let stat = await el.evaluate((st) => st.textContent);
        stat = stat.slice(stat.search(/[^>}]+$/g));

        stats.push(stat);
      }

      lightCones.push({
        name: name.trim(),
        imageLink: prydwen.concat(imageLink),
        rarity: `${rarity}★`,
        description,
        stats,
      });
    }

    datas.push({
      type: attribute,
      lightCones,
    });
  }
  return datas;
};

exports.fetchRelicList = async (browser) => {
  const page = await browser.newPage();
  await page.goto('https://www.prydwen.gg/star-rail/guides/relic-sets', {
    timeout: 0,
    waitUntil: 'networkidle2',
  });
  const buttons = await page.$$(
    'div.content.hsr > .employees-filter-bar.hsr > div.filter-bar-element.button_bar.element-1 >>> button[type=button]'
  );

  let datas = [];
  for (const [i, button] of buttons.entries()) {
    if (i !== 0) {
      const attribute = await button.evaluate(async (btn) => {
        await btn.click();
        return btn.getAttribute('value');
      });
      const relicEls = await page.$$('div.content.hsr > div.relic-set-container >>> div.hsr-set');

      let relics = [];
      for (const relic of relicEls) {
        const relicName = await (
          await relic.$('div.hsr-set-name > h5.name')
        ).evaluate((r) => r.textContent);

        const imageLink = await (
          await relic.$('div.hsr-set-image >>> picture > img')
        ).evaluate((img) => img.getAttribute('src'));

        const relicDescElements = await relic.$$('div.hsr-set-description > div');
        const relicDescPromise = relicDescElements.map(
          async (relic) => await relic.evaluate((r) => r.textContent)
        );
        const relicDesc = await Promise.all(relicDescPromise);

        relics.push({
          name: relicName,
          imageLink: prydwen.concat(imageLink),
          description: relicDesc,
        });
      }

      datas.push({ type: attribute, relics });
    }
  }

  return datas;
};

const convertName = (name) => {
  let latest_name;
  if (name.match(/\(|\)/g)) {
    latest_name = name.replace(/\(|\)/g, '').split(' ').join('-').toLowerCase();
  } else {
    latest_name = name.split(' ').join('-').toLowerCase();
  }

  return latest_name;
};

const checkBuildTabs = ($) => {
  const buildTabs = $('#section-build > div.tab-content > div');
  return buildTabs;

  // Puppeteer method

  // const buildTabs = await page.$$('#section-build > div.tab-content > div');
  // return buildTabs;
};

const getBuildTabs = ($) => {
  const tabElements = $('#section-build > ul.nav.nav-tabs > li > button');
  const tabNames = tabElements
    .map(function (i, el) {
      return $(this).text();
    })
    .toArray();

  return tabNames;

  // Puppeteer method

  // const tabElements = await page.$$(
  //   '#section-build > ul.nav.nav-tabs > li > button'
  // );
  // const tabPromise = tabElements.map(
  //   async (el) => await el.evaluate((e) => e.textContent)
  // );
  // const tabNames = await Promise.all(tabPromise);

  // return tabNames;
};

const getRawContent = ($, rawElements) =>
  rawElements
    .map(function (i, el) {
      return $(this).text();
    })
    .toArray();

const filterRawContent = (rawContent) => rawContent.map((raw) => raw.slice(raw.search(/[^}]+$/g)));

const getBuilds = ($, tabs) => {
  const datas = tabs.map((tabName, i) => {
    const tab = $(
      `#section-build > div.tab-content > div#build-tabs-tabpane-${i} > div.section-build`
    );

    const buildRelics = $(
      `#section-build > div.tab-content > div#build-tabs-tabpane-${i} > div.section-build > div.build-relics`
    );

    // RELIC SET
    const relicSetElements = buildRelics
      .find('div.col > div > div.accordion')
      .find('h2.accordion-header > button[type=button]');
    const relicSetRawContent = getRawContent($, relicSetElements);
    const relic = filterRawContent(relicSetRawContent);

    const splitRelicElement = buildRelics
      .find('div.col > div > div.split-sets')
      .find('h2.accordion-header > button[type=button]');
    const splitRelicRawContent = getRawContent($, splitRelicElement);
    const split_relic = filterRawContent(splitRelicRawContent).join(' + ');

    // PLANETARY SET
    const planetaryElements = buildRelics
      .find('div.col > div.accordion')
      .find('h2.accordion-header > button[type=button]');
    const planetaryRawContent = getRawContent($, planetaryElements);
    const planetary = filterRawContent(planetaryRawContent);

    // LIGHTCONE
    const lightConeElements = tab.find('div.build-cones').find('h2.accordion-header > button');
    const lightConeRawContent = getRawContent($, lightConeElements);
    const lightCone = filterRawContent(lightConeRawContent);

    // RELIC STATS
    // const statNameElements = tab
    //   .find('div.build-stats')
    //   .find('div.col')
    //   .find('div.stats-header > span');
    // const statNames = getRawContent($, statNameElements);

    // const listStatElements = tab
    //   .find('div.build-stats')
    //   .find('div.col')
    //   .find('div.list-stats > div.hsr-stat')
    //   .find('span');
    // const listStats = getRawContent($, listStatElements);

    // const stats = statNames.map((name, i) => ({
    //   data: `${name} ${listStats[i]}`,
    // }));

    const mainStatElements = tab.find('div.build-stats > div.main-stats > div.col > div.box');
    const mainStats = mainStatElements
      .map(function (i, el) {
        const title = $(this).find('div.stats-header > span').text();

        const statEls = $(this).find('div.hsr-stat > span');
        const stat = statEls
          .map(function (i, el) {
            return $(this).text();
          })
          .toArray()
          .join(' / ');

        return {
          title,
          stat,
        };
      })
      .toArray();

    const subStatElements = tab.find('div.build-stats > div.row > div > div.sub-stats');
    const subStats = subStatElements
      .map(function (i, el) {
        const title = $(this).find('span').text();
        const stat = $(this).find('p').text();

        return {
          title,
          stat,
        };
      })
      .toArray();

    return {
      tabName,
      relic: !split_relic.length ? [...relic] : [...relic, split_relic],
      planetary,
      lightCone,
      mainStats,
      subStats,
    };
  });

  return datas;

  // Puppeteer method

  // let data = [];
  // for (const [i, tab] of buildTabs.entries()) {
  //   const relicElements = await page.$$(
  //     `#section-build > div.tab-content > div#build-tabs-tabpane-${i} > div.section-build > div.build-relics >>> h2.accordion-header > button`
  //   );
  //   const relicPromise = relicElements.map(
  //     async (relic) => await relic.evaluate((r) => r.textContent)
  //   );
  //   const lightConeElements = await page.$$(
  //     `#section-build > div.tab-content > div#build-tabs-tabpane-${i} > div.section-build > div.build-cones >>> h2.accordion-header > button`
  //   );
  //   const lightConePromise = lightConeElements.map(
  //     async (lightCone) => await lightCone.evaluate((lc) => lc.textContent)
  //   );
  //   const statNameElements = await page.$$(
  //     `#section-build > div.tab-content > div#build-tabs-tabpane-${i} > div.section-build > div.build-stats >>> div.col >>> div.stats-header > span`
  //   );
  //   const listStatElements = await page.$$(
  //     `#section-build > div.tab-content > div#build-tabs-tabpane-${i} > div.section-build > div.build-stats >>> div.col >>> div.list-stats > div.hsr-stat >>> span`
  //   );
  //   const statNamePromise = statNameElements.map(
  //     async (statName) => await statName.evaluate((name) => name.textContent)
  //   );
  //   const listStatPromise = listStatElements.map(
  //     async (listStat) => await listStat.evaluate((list) => list.textContent)
  //   );

  //   const relicRawContent = await Promise.all(relicPromise);
  //   const lightConeRawContent = await Promise.all(lightConePromise);
  //   const statName = await Promise.all(statNamePromise);
  //   const listStat = await Promise.all(listStatPromise);
  //   const relic = relicRawContent.map((raw) =>
  //     raw.slice(raw.search(/[^}]+$/g))
  //   );
  //   const lightCone = lightConeRawContent.map((raw) =>
  //     raw.slice(raw.search(/[^}]+$/g))
  //   );
  //   const stat = statName.map((name, i) => {
  //     return {
  //       name: `${name} ${listStat[i]}`,
  //     };
  //   });

  //   data.push({ tab, relic, lightCone, stat });
  // }
  // return data;
};

const getCharacterSkills = ($) => {
  const skillElements = $('div#section-skills > div.skills > div > div.skill-box.hsr');

  const skills = skillElements
    .map(function (i, el) {
      const nameSection = $(this).find('div.skill-header > div.name-section');
      const name = nameSection.find('h5.name').text().trim();
      const skillType = nameSection
        .find('div.pills > span.skill-type')
        .map(function (i, el) {
          return $(this).text();
        })
        .toArray();

      const skillContent = $(this)
        .find('div.skill-content > div > p')
        .text()
        .replace(/[\r\n]+$/g, '');

      return {
        name,
        skillType,
        skillContent,
      };
    })
    .toArray();

  return skills;
};

const getCharacterMajorTraces = ($) => {
  const traceElements = $('div#section-traces > div.skills.traces > div > div.skill-box.hsr');

  const traces = traceElements
    .map(function (i, el) {
      const nameSection = $(this).find('div.skill-header > div.name-section');
      const name = nameSection.find('h5.name').text();
      const skillType = nameSection
        .find('span.skill-type')
        .map(function (i, el) {
          return $(this).text();
        })
        .toArray();

      const skillContent = $(this)
        .find('div.skill-content > div.skill-description > div')
        .text()
        .replace(/[\r\n]+$/g, '');

      const smallTraceEls = $(this).find('div.small-traces-inside > div');
      const smallTraces = smallTraceEls
        .map(function (i, el) {
          const statName = $(this).find('div > div.hsr-stat > span').text();
          const value = $(this).find('span.value').text();

          return {
            statName,
            value,
          };
        })
        .toArray();

      return {
        name,
        skillType,
        skillContent,
        smallTraces,
      };
    })
    .toArray();

  return traces;
};

const getCharacterMinorTraces = ($) => {
  const skillElements = $('div#section-traces > div.small-traces > div.single-trace');
  const minorTraces = skillElements
    .map(function (i, el) {
      const name = $(this).find('div > div > span').text();
      const unlockAt = $(this).find('p').text().trim();

      return {
        name,
        unlockAt,
      };
    })
    .toArray();

  return minorTraces;
};

const getCharacterStat = ($) => {
  const statElements = $('div#section-stats > div.info-list').find('div.info-list-row');

  const stats = statElements
    .map(function (i, el) {
      const statName = $(this).find('div.hsr-stat > span').text();
      const statDetail = $(this).find('div.details').text();

      return {
        name: statName,
        detail: statDetail,
      };
    })
    .toArray();

  return stats;

  // Puppeteer method

  // const statElements = await page.$$(
  //   'div#section-stats > div.info-list >>> div.info-list-row'
  // );
  // let stats = [];
  // for (const stat of statElements) {
  //   const statNameElement = await stat.$('div.hsr-stat > span');
  //   const statName = await statNameElement.evaluate((name) => name.textContent);
  //   const statDetailElement = await stat.$('div.details');
  //   const statDetail = await statDetailElement.evaluate(
  //     (name) => name.textContent
  //   );
  //   stats.push({ name: statName, detail: statDetail });
  // }
  // return stats;
};

const getCharacterMaterial = ($) => {
  const materialElements = $('div#section-stats > div.info-list')
    .find('div.material-list')
    .find('li');

  const materials = materialElements
    .map(function (i, el) {
      const rawContent = getRawContent($, $(this));
      const detail = filterRawContent(rawContent);

      return detail;
    })
    .toArray();

  return materials;

  // Puppeteer method

  // const materialElements = await page.$$(
  //   'div#section-stats > div.info-list >>> div.material-list >>> li'
  // );

  // let materials = [];
  // for (const material of materialElements) {
  //   const raw = await material.evaluate((name) => name.textContent);
  //   const detail = raw.slice(raw.search(/[^}]+$/g));
  //   materials.push(detail);
  // }

  // return materials;
};

const getCharacterProsAndCons = ($) => {
  const prosConsElements = $(
    'div#section-review > div.section-analysis > div.analysis > div > div.pros-cons'
  ).find('div.box');

  const prosAndCons = prosConsElements
    .map(function (i, el) {
      const title = $(this).find('h5').text();

      const contentEls = $(this).find('ul > li > p');
      const content = contentEls
        .map(function (i, el) {
          const text = $(this)
            .text()
            .replace(/[\r\n]+$/g, '');

          return text;
        })
        .toArray();

      return {
        title,
        content,
      };
    })
    .toArray();

  return prosAndCons;
};

const getCharacterBestTeam = ($) => {
  const bestTeamElements = $('div#section-build > div.best-team > div.col');

  const bestTeam = bestTeamElements
    .map(function (i, el) {
      const title = $(this).find('h6').text();

      const characterEls = $(this).find('div.team-container > span > a');
      const character = characterEls
        .map(function (i, el) {
          let char = $(this).attr('href').split('/').pop();
          char = char
            .split('-')
            .map((ch) => ch.charAt(0).toUpperCase() + ch.slice(1))
            .join(' ');

          return char;
        })
        .toArray();

      return {
        title,
        characters: character,
      };
    })
    .toArray();

  return bestTeam;
};

const getCharacterImageAndRarity = ($) => {
  const url = 'https://www.prydwen.gg';
  const header = $('div.content.hsr > div.character-header');

  const image = header.find('div.avatar > div > picture > img').attr('data-src');
  const rarity = header.find('div.hsr-rarity').text().trim();

  return [url.concat(image), rarity];
};

exports.fetchCharacterDatas = async (datas) => {
  let list = [];

  for (const data of datas) {
    const characterBuildPromise = data.names.map(async (name) => {
      const latest_name = convertName(name);
      const data = (await axios.get(`https://www.prydwen.gg/star-rail/characters/${latest_name}`))
        .data;
      const $ = cheerio.load(data);

      const tabs = await getBuildTabs($);

      const builds = getBuilds($, tabs);
      const stats = getCharacterStat($);
      const materials = getCharacterMaterial($);
      const prosAndCons = getCharacterProsAndCons($);
      const bestTeam = getCharacterBestTeam($);
      const skills = getCharacterSkills($);
      const majorTraces = getCharacterMajorTraces($);
      const minorTraces = getCharacterMinorTraces($);
      const [imageLink, rarity] = getCharacterImageAndRarity($);

      return {
        name,
        imageLink,
        rarity,
        builds,
        stats,
        materials,
        prosAndCons,
        bestTeam,
        skills,
        majorTraces,
        minorTraces,
      };
    });

    const characterBuilds = await Promise.all(characterBuildPromise);
    list.push({ type: data.type, characters: characterBuilds });
  }

  return list;

  // Puppeteer method

  // const list = [];
  // for (const data of datas) {
  //   const characterBuildPromise = data.names.map(async (name) => {
  //     const latest_name = convertName(name);
  //     const page = await browser.newPage();
  //     await page.goto(
  //       `https://www.prydwen.gg/star-rail/characters/${latest_name}`,
  //       {
  //         timeout: 0,
  //         waitUntil: 'networkidle2',
  //       }
  //     );
  //     const checkBuild = await checkBuildTabs(page);
  //     let build = [];
  //     if (checkBuild.length) {
  //       const buildTabs = await getBuildTabs(page);
  //       const builds = await getBuilds(buildTabs, page);
  //       build.push(...builds);
  //     }
  //     const stats = await getCharacterStat(page);
  //     const materials = await getCharacterMaterial(page);
  //     await page.close();
  //     return {
  //       name,
  //       build,
  //       stats,
  //       materials,
  //     };
  //   });
  //   const characterBuilds = await Promise.all(characterBuildPromise);
  //   list.push({ type: data.type, characters: characterBuilds });
  // }
  // return list;
};
