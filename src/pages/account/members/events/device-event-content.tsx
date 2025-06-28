import { Event } from './blocks';

const AccountTeamsContent = ({ isLoading, filters }: any) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Event isLoading={isLoading} filters={filters} />
    </div>
  );
};

export { AccountTeamsContent };
