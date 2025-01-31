import React from 'react';
import {
  Avatar,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  DropdownTrigger
} from '@nextui-org/react';
import { useMsal } from '@azure/msal-react';

interface ProfileMenuProps {
  name?: string;
  photo?: string | null;
}

const ProfileMenu = ({ name, photo }: ProfileMenuProps) => {
  const { instance } = useMsal();

  const handleLogout = () => {
    instance.logoutRedirect({
      postLogoutRedirectUri: window.location.origin
    });
  };

  const menuItems = [
    {
      key: 'profile',
      className: 'h-14 gap-2',
      children: (
        <>
          <p className='font-medium text-x text-gray-600 dark:text-gray-400'>
            Signed in as
          </p>
          <p className='font-bold'>{name}</p>
        </>
      )
    },
    {
      key: 'logout',
      label: 'Log Out',
      color: 'danger' as const,
      onClick: handleLogout
    }
  ];

  return (
    <Dropdown>
      <DropdownTrigger>
        <Avatar
          isBordered
          as='button'
          radius='sm'
          size='sm'
          src={photo || undefined}
          name={name?.charAt(0)}
        />
      </DropdownTrigger>
      <DropdownMenu aria-label='User menu actions'>
        {menuItems.map((item) => (
          <DropdownItem
            key={item.key}
            className={item.className}
            color={item.color}
            onClick={item.onClick}
          >
            {item.children || item.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default ProfileMenu;
