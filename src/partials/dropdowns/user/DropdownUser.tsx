import { Fragment, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useAuthContext } from '@/auth';
// import { useLanguage } from '@/i18n';
import { toAbsoluteUrl } from '@/utils';
// import { useSettings } from '@/providers/SettingsProvider';
import { KeenIcon } from '@/components';
import { MenuItem, MenuLink, MenuSub, MenuTitle, MenuSeparator, MenuIcon } from '@/components/menu';
import { useUser } from '@/store/store';

interface IDropdownUserProps {
  menuItemRef: any;
}

const DropdownUser = ({ menuItemRef }: IDropdownUserProps) => {
  const { user } = useUser();
  // const { settings, storeSettings } = useSettings();
  const { logout } = useAuthContext();
  // const { isRTL } = useLanguage();
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    if (user) {
      setUserName(user.name);
      setUserEmail(user.email);
    }
  }, [user]);

  // const handleThemeMode = (event: ChangeEvent<HTMLInputElement>) => {
  //   const newThemeMode = event.target.checked ? 'dark' : 'light';

  //   storeSettings({
  //     themeMode: newThemeMode
  //   });
  // };

  const buildHeader = () => {
    return (
      <div className="flex items-center justify-between px-5 py-1.5 gap-1.5">
        <div className="flex items-center gap-2">
          <img
            className="size-9 rounded-full border-2 border-success"
            src={toAbsoluteUrl('/media/avatars/400.png')}
            alt=""
          />
          <div className="flex flex-col gap-1.5">
            <p className="text-sm text-gray-800  font-semibold leading-none">{userName}</p>
            <p className="text-xs text-gray-600 font-medium leading-none">{userEmail}</p>
          </div>
        </div>
      </div>
    );
  };

  const buildMenu = () => {
    return (
      <Fragment>
        <MenuSeparator />
        <div className="flex flex-col">
          {/* <MenuItem>
            <MenuLink path="/user-profile">
              <MenuIcon>
                <KeenIcon icon="profile-circle" />
              </MenuIcon>
              <MenuTitle>
                <FormattedMessage id="USER.MENU.MY_PROFILE" />
              </MenuTitle>
            </MenuLink>
          </MenuItem> */}

          {/* <MenuItem>
            <MenuLink path="/setting">
              <MenuIcon>
                <KeenIcon icon="setting-2" />
              </MenuIcon>
              <MenuTitle>
                <FormattedMessage id="USER.MENU.MY_SETTINGS" />
              </MenuTitle>
            </MenuLink>
          </MenuItem> */}
          {/* Conditionally Render Settings Menu */}
          {user?.role === 'Admin' && (
            <MenuItem>
              <MenuLink path="/setting">
                <MenuIcon>
                  <KeenIcon icon="setting-2" />
                </MenuIcon>
                <MenuTitle>
                  <FormattedMessage id="USER.MENU.MY_SETTINGS" />
                </MenuTitle>
              </MenuLink>
            </MenuItem>
          )}

          <MenuSeparator />
        </div>
      </Fragment>
    );
  };

  const buildFooter = () => {
    return (
      <div className="flex flex-col">
        {/* <div className="menu-item mb-0.5">
          <div className="menu-link">
            <span className="menu-icon">
              <KeenIcon icon="moon" />
            </span>
            <span className="menu-title">
              <FormattedMessage id="USER.MENU.DARK_MODE" />
            </span>
            <label className="switch switch-sm">
              <input
                name="theme"
                type="checkbox"
                checked={settings.themeMode === 'dark'}
                onChange={handleThemeMode}
                value="1"
              />
            </label>
          </div>
        </div> */}

        <div className="menu-item px-4 py-1.5">
          <button onClick={logout} className="btn btn-sm btn-light justify-center">
            <FormattedMessage id="USER.MENU.LOGOUT" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <MenuSub
      className="menu-default light:border-gray-300 w-[200px] md:w-[250px]"
      rootClassName="p-0"
    >
      {buildHeader()}
      {buildMenu()}
      {buildFooter()}
    </MenuSub>
  );
};

export { DropdownUser };
