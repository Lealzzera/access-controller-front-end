'use client';
import { useUser } from '@/app/context/userContext';
import style from './style.module.css';
import logout from '@/app/helpers/logout';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Role } from '@/app/enums/Role.enum';
import MenuIcon from '@mui/icons-material/Menu';
import { Menu, MenuItem } from '@mui/material';
import React from 'react';

export default function Header() {
  const router = useRouter();
  const { userInfo, setRegisterModalOpen } = useUser();
  const [userName, setUserName] = useState<string | undefined>('');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const logoutFunction = async () => {
    await logout();
    handleCloseMenu();
    window.localStorage.clear();
    router.push('/');
  };

  const handleRegisterChildFunction = () => {
    handleCloseMenu();
    setRegisterModalOpen(true);
  };

  useEffect(() => {
    setUserName(userInfo?.userInfo.name);
  }, [userInfo]);
  return (
    <header className={style.headerContainer}>
      <div className={style.wrappedContent}>
        <span>{userName}</span>
        {userInfo?.role === Role.INSTITUTION && (
          <div className={style.containerMenu}>
            <button className={style.buttonMenu} onClick={handleClick}>
              <MenuIcon />
            </button>
            <Menu onClose={handleCloseMenu} id="basic-menu" open={open} anchorEl={anchorEl}>
              <MenuItem onClick={handleRegisterChildFunction}>Cadastrar Criança</MenuItem>
              <MenuItem onClick={logoutFunction}>Sair</MenuItem>
            </Menu>
          </div>
        )}
        {userInfo?.role === Role.RESPONSIBLE && <p onClick={logoutFunction}>SAIR</p>}
      </div>
    </header>
  );
}
