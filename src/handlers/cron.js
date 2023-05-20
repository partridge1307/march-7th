const { updateData } = require('../utils/util');
const { CronJob } = require('cron');

module.exports = async (client) => {
  new CronJob('59 2,14 * * *', async () => await updateData(), null, true, 'Asia/Ho_Chi_Minh');
};
