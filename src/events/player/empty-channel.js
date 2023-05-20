module.exports = {
  config: {
    name: 'emptyChannel',
    player: true,
  },
  execute(queue) {
    queue.metadata.channel.send(`I was manually left due inactivity from the voice channel`);
  },
};
