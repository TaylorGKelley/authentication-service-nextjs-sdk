import User from '../User';

type InitializeResponse = {
  user: User;
  permission: string[];
  accessToken: string;
  csrfToken: string;
};

export default InitializeResponse;
