
import genStaticAPIForFeat from '../lib/genStaticAPIForFeat';

export default function () {
  logger.info('Executing automated task...');
  genStaticAPIForFeat().then(values => {
    values.forEach(res => {
      if (!res.status) {
        logger.info(`Successful update: ${res.api} | sources: ${res.sources.join(', ')}`);
      } else {
        logger.error(`Failed update: ${res.api} | ${res.message} | sources: ${res.sources.join(', ')}`);
      }
    });
  }).catch(ex => {
    logger.error(`Failed update: ${ex.message}`);
  });
}
