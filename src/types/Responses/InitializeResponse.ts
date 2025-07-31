import { Response } from './Response';
import User from '../User';

type InitializeResponse = Response<{
  user: User;
}>;

export default InitializeResponse;
