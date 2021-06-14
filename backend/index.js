// @ts-check
const pino = require('pino');
const { spawn } = require('child_process');
const { wait } = require('./lib/utils.js');
const config = require('./backend.config.js');

const logger = pino();

const runCrawler = async (crawler) => {
  const child = spawn('node', [`${crawler}`]);
  child.stdout.on('data', (data) => {
    console.log(child.pid, data);
  });
  child.on('close', (exitCode) => {
    logger.info(`Crawler ${crawler} exit with code: ${exitCode}`);
    return -1;
  });
};

const runCrawlers = async () => {
  logger.info('Starting backend, waiting 15s...');
  await wait(15000);

  logger.info('Running crawlers');
  await Promise.all(
    config.crawlers
      .filter((crawler) => crawler.enabled)
      .map(({ crawler }) => runCrawler(crawler)),
  );
};

runCrawlers().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(-1);
});
