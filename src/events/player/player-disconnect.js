module.exports = {
  config: {
    name: 'disconnect',
    player: true,
  },
  execute(queue) {
    queue.metadata.channel.send(
      `I was manually disconnected or left due inactivity from the voice channel`
    );
  },
};
