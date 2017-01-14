
import cors from 'cors';

const isProductionEnv = process.env.NODE_ENV === 'production';

export default function ({
  whitelist = [],
}) {
  const whitelistSet = new Set(whitelist);
  return (req, res, next) => {
    return cors({
      origin: isProductionEnv ? (origin, callback) => {
        callback(null, whitelistSet && (
          whitelistSet.has('*') || whitelistSet.has(origin)
        ));
      } : true,
      exposedHeaders: ['Link', 'X-Floducer-Version'],
      credentials: true,
    })(req, res, next);
  };
}
