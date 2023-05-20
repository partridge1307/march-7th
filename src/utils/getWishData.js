const { request, sleep } = require('./util');

const banners = [
  { key: '11', name: 'Character Warp' },
  { key: '12', name: 'Light Cone Warp' },
  { key: '1', name: 'Stellar Warp' },
  { key: '2', name: 'Departure Warp' },
];

const urlParse = (url) => {
  const { protocol, hostname, pathname, searchParams } = new URL(url);

  return {
    protocol,
    hostname,
    pathname,
    searchParams,
  };
};

const tryRequest = async (url) => {
  const result = await request(`${url}&gacha_type=1&page=1&end_id=0`);
  if (result.retcode === 0) return true;
  else return false;
};

const getGachaLog = async ({ url, key, page, endId, retryCount }) => {
  try {
    const res = await request(`${url}&gacha_type=${key}&page=${page}&end_id=${endId}`);

    return res.data.list;
  } catch (error) {
    if (retryCount) {
      await sleep(5);
      retryCount--;
      return await getGachaLog({ url, key, page, endId, retryCount });
    } else {
      throw error;
    }
  }
};

const getGachaLogs = async ({ key }, url) => {
  let uid = '';
  let page = 1;
  let endId = '0';
  let list = [];
  let res = [];

  do {
    if (page % 10 === 0) await sleep(1);

    res = await getGachaLog({ url, key, page, endId, retryCount: 5 });
    await sleep(0.3);

    if (!uid && res.length) {
      uid = res[0].uid;
    }

    list.push(...res);
    page++;

    if (res.length) endId = res[res.length - 1].id;
  } while (res.length > 0);

  return {
    uid,
    list,
  };
};

const calcData = (list) => {
  list.reverse();

  let five_star = [];
  let four_star = [];
  for (let i = 0; i < list.length; i++) {
    if (Number(list[i].rank_type) === 5) {
      five_star.push({
        iterator: i + 1,
        item: list[i],
      });
    } else if (Number(list[i].rank_type) === 4) {
      four_star.push({
        iterator: i + 1,
        item: list[i],
      });
    }
  }

  five_star = five_star.map((item, i) => {
    return {
      pity: five_star[i - 1] ? item.iterator - five_star[i - 1].iterator : item.iterator,
      item: item.item,
    };
  });
  four_star = four_star.map((item, i) => {
    return {
      pity: four_star[i - 1] ? item.iterator - four_star[i - 1].iterator : item.iterator,
      item: item.item,
    };
  });

  const avgFiveStar =
    five_star.reduce((accumlator, item) => accumlator + item.pity, 0) / five_star.length;
  const avgFourStar =
    four_star.reduce((accumlator, item) => accumlator + item.pity, 0) / four_star.length;

  five_star.reverse();
  four_star.reverse();

  return {
    five_star,
    avgFiveStar,
    four_star,
    avgFourStar,
  };
};

const fetchData = async (url) => {
  const uri = urlParse(url);
  if (!uri.searchParams) return { status: false };

  const latest_url = `${uri.protocol}//${uri.hostname}${uri.pathname}?${uri.searchParams}`;

  const status = await tryRequest(latest_url);
  if (!status) {
    return { status: false };
  }

  let data = [];

  for (const banner of banners) {
    const { uid, list } = await getGachaLogs(banner, latest_url);
    const { five_star, avgFiveStar, four_star, avgFourStar } = calcData(list);

    !list.length
      ? data.push({ banner: banner.name, uid, data: `No Warp detected` })
      : data.push({
          banner: banner.name,
          uid,
          length: list.length,
          list,
          data: {
            five_star,
            avgFiveStar: Math.floor(avgFiveStar),
            four_star,
            avgFourStar: Math.floor(avgFourStar),
          },
        });
  }

  return {
    status: true,
    data,
  };
};

module.exports = async (url) => await fetchData(url);
