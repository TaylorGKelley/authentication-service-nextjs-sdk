import User from '../User';
import { Response } from './Response';

type RegisterResponse = Response<{ user: User }>;

export default RegisterResponse;
