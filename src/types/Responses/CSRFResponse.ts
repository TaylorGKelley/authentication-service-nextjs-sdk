import { Response } from './Response';

type CSRFResponse = Response<{ csrfToken: string }>;

export default CSRFResponse;
