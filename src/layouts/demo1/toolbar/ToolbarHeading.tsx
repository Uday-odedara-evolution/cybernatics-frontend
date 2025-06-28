import { ReactNode } from 'react';
import { useMenus } from '@/providers';
import { useMenuCurrentItem } from '@/components';
import { useLocation } from 'react-router';

export interface IToolbarHeadingProps {
  title?: string | ReactNode;
  description?: string | ReactNode;
}

const ToolbarHeading = ({ title = '', description }: IToolbarHeadingProps) => {
  const { getMenuConfig } = useMenus();
  const { pathname } = useLocation();
  const currentMenuItem = useMenuCurrentItem(pathname, getMenuConfig('primary'));

  return (
    <div className="flex flex-col justify-center gap-2">
      <h1
        className="
          text-xl font-medium leading-none text-gray-900 dark:text-white
          transition-all duration-300 cursor-pointer
          hover:text-blue-500 hover:scale-105
          active:text-blue-700 active:scale-95
        "
      >
        {title || currentMenuItem?.title}
      </h1>
      {description && (
        <div className="flex items-center gap-2 text-sm font-normal text-gray-700 dark:text-gray-400">
          {description}
        </div>
      )}
    </div>
  );
};

export { ToolbarHeading };


// import { ReactNode } from 'react';
// import { useMenus } from '@/providers';
// import { useMenuCurrentItem } from '@/components';
// import { useLocation } from 'react-router';

// export interface IToolbarHeadingProps {
//   title?: string | ReactNode;
//   description?: string | ReactNode;
// }

// const ToolbarHeading = ({ title = '', description }: IToolbarHeadingProps) => {
//   const { getMenuConfig } = useMenus();
//   const { pathname } = useLocation();
//   const currentMenuItem = useMenuCurrentItem(pathname, getMenuConfig('primary'));

//   return (
//     <div className="flex flex-col justify-center gap-2">
//       <h1 className="text-xl font-medium leading-none text-gray-900">
//         {title || currentMenuItem?.title}
//       </h1>
//       {description && (
//         <div className="flex items-center gap-2 text-sm font-normal text-gray-700">
//           {description}
//         </div>
//       )}
//     </div>
//   );
// };

// export { ToolbarHeading };
