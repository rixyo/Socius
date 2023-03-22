
import { Menu, MenuButton, MenuList, MenuItem, Icon, Flex, MenuDivider, Text, Box, Avatar, WrapItem } from '@chakra-ui/react';
import { User } from 'firebase/auth';
import React from 'react';
import { VscAccount } from "react-icons/vsc";
import { IoCaretDownSharp, IoSparkles } from "react-icons/io5";
import { CgProfile} from "react-icons/cg"
import {MdOutlineLogin} from "react-icons/md"
import { useSignOut } from 'react-firebase-hooks/auth';
import { auth } from '@/Firebase/clientapp';
import {useResetRecoilState, useSetRecoilState} from "recoil"
import { authModalState } from '@/atoms/authModalAtom';
import Directory from './Directory/Directory';
import { teamState } from '@/atoms/teamAtom';
import { useRouter } from 'next/router';
type UserMenuProps = {
    User?:User | null
    
};

const UserMenu:React.FC<UserMenuProps> = ({User}) => {
    const [signOut, loading, error] = useSignOut(auth);
    const resetCommunityState=useResetRecoilState(teamState)
    const setAuthModalState=useSetRecoilState(authModalState)
    const router = useRouter();
    const Logout=async()=>{
      const success = await signOut();
      if (success) {
        alert('You are sign out');
      }
      resetCommunityState
      router.push('/');
      

    }

    return(
        <Menu>
  <MenuButton cursor="pointer" padding="0px 6px" borderRadius={4} _hover={{outline:"1px solid", outlineColor:"gray.200"}}>
 {User ? (
    <Flex align="center">
        <Flex align="center">
    <>
 
    <WrapItem mr={2}>
    <Avatar
      size='xs'
      name={User?.email?.split("@")[0] || User?.displayName || "UNKNOWN"  }
     
    />{' '}
  </WrapItem>
    <Box
                  display={{ base: "none", lg: "flex" }}
                  flexDirection="column"
                  fontSize="8pt"
                  alignItems="flex-start"
                  mr={8}
                >
                  <Text fontWeight={700}>
                    {User?.displayName || User?.email?.split("@")[0]}
                  </Text>
                  
                </Box>
    <IoCaretDownSharp/>
    </>
    </Flex>
    </Flex>
 ):(
    <Icon fontSize={24} color="gray.400" mr={1} as={VscAccount} />
 )}
  </MenuButton>

  <MenuList>
    {User?(
      <>
       <MenuItem fontSize="10pt" fontWeight={700} _hover={{bg:"blue.500",color:"white"}}>
  <Flex align="center">
      <Icon  as={CgProfile} fontSize={20}  mr={2}/>
      Profile

  </Flex>
  </MenuItem>
  <MenuDivider/>
  <Directory />
 
  <MenuItem fontSize="10pt" fontWeight={700} _hover={{bg:"blue.500",color:"white"}}
   onClick={Logout}
  >
  <Flex align="center">
      <Icon  as={MdOutlineLogin} fontSize={20}  mr={2}/>
     Log out

  </Flex>

  
  
  </MenuItem>
      </>
    ):(
      <>
       <MenuItem fontSize="10pt" fontWeight={700} _hover={{bg:"blue.500",color:"white"}}
   onClick={()=>setAuthModalState({open:true, view:"login"})}
  >
  <Flex align="center">
      <Icon  as={MdOutlineLogin} fontSize={20}  mr={2}/>
     Log In/Sing Up

  </Flex>
  </MenuItem>
      </>
    )}
 
  
</MenuList>
</Menu>
    )
}
export default UserMenu;


