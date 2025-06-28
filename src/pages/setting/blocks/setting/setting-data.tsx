interface ITeamData {
  location: string;
  department: string;
  // members: IAvatarsProps;
}

const LocationDepartmentData: ITeamData[] = [
  {
    location: 'singapore',
    department: 'HR'
  },
  {
    location: 'Pune',
    department: 'IT'
  },
  {
    location: 'USA',
    department: 'Finance'
  },
  {
    location: 'LA',
    department: 'HR'
  },
  {
    location: 'India',
    department: 'IT'
  }
];

export { LocationDepartmentData, type ITeamData };
