import { IAvatarsProps } from '@/partials/common';

interface ITeamData {

  name: string;
  email: string;
  role: string;
  // members: IAvatarsProps;
}

const UserData: ITeamData[] = [
  {
    name: 'Rendom Name 1',
    email: 'Rohit@gmail.com',
    role: 'Admin',

  },
  {
    name: 'Rendom Name 2',
    email: 'rendomname@gmail.com',
    role: 'Admin',

  },
  {

    name: 'Rendom Name 3',
    email: 'rendomname@gmail.com',
    role: 'User',

  },
  {
    name: 'Rendom Name 4',
    email: 'rendomname@gmail.com',
    role: 'User',
  },
  {

    name: 'Rendom Name 5',
    email: 'rendomname@gmail.com',
    role: 'User',
  },
  {

    name: 'Rendom Name 6',
    email: 'rendomname@gmail.com',
    role: 'User',
  },
  {
    name: 'Rendom Name 7',
    email: 'rendomname@gmail.com',
    role: 'User',
  },
  {
    name: 'Rendom Name 8',
    email: 'rendomname@gmail.com',
    role: 'User',
  },
  {
    name: 'Rendom Name 9',
    email: 'rendomname@gmail.com',
    role: 'User',
  },
  {
    name: 'Rendom Name 10',
    email: 'rendomname@gmail.com',
    role: 'User',
  },
  {
    name: 'Rendom Name 11',
    email: 'rendomname@gmail.com',
    role: 'User',
  },
];

export { UserData, type ITeamData };
