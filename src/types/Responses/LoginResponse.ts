import User from '../User';
import { Response } from './Response';

type RefreshResponse = Response<{ accessToken: string; user: User }>;

export default RefreshResponse;
