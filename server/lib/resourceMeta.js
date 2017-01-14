
import uuid from 'uuid';
import moment from 'moment';

export default function (json) {
  if (json.id) {
    json.updatedAt = moment.utc();
  } else {
    json.id = uuid.v4();
    json.createdAt = moment.utc();
  }
  return json;
}
