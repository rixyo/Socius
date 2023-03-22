import { Team, TeamSnippet, teamState } from "@/atoms/teamAtom";
import { auth, fireStore } from "@/Firebase/clientapp";
import { arrayRemove, arrayUnion, collection, doc, getDocs, increment, writeBatch } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useSetRecoilState } from "recoil";
import { authModalState } from "@/atoms/authModalAtom";

const useTeamData= () => {

    const [user]=useAuthState(auth)
    const setAuthModalState = useSetRecoilState(authModalState);

  const [creatorId,setCreatorId]=useState("")
    const [teamStateValue,setTeamStateValue]=useRecoilState(teamState)
    const [loading,setLoading]=useState(false)
    const [customError,setCustomError]=useState('')
    const onJoinOrLeaveTeam=(teamData:Team,isJoined:boolean)=>{
       
        if (!user) {
            setAuthModalState({ open: true, view: "login" });
            return;
          }

        if(isJoined){
            leaveTeam(teamData)
            return
        }
       
     joinTeam(teamData)

    
      
        

    }
    
    const getMySnippet=async()=>{
        setLoading(true)
        try {
            const snippetDocs=getDocs(collection(fireStore,`users/${user?.uid}/teamSnippets`))
            const snippet= (await snippetDocs).docs.map(doc=>({
                ...doc.data()
            }))
            setTeamStateValue(prev=>({
                ...prev,mySnippets:snippet as TeamSnippet[]
            }))
            
            
        } catch (error:any) {
            console.log("snipppet Erroe",error.message)
            setCustomError(error.message)
            
        }
        setLoading(false)
    }
    useEffect(()=>{
        if(!user) return
      
        getMySnippet()
    },[user])
    const joinTeam=async(teamData:Team)=>{
        try {
           
                const betch=writeBatch(fireStore)
            const newSnippet:TeamSnippet={
                teamId: teamData.id,
                imageUrl: teamData.imageUrl || ""
            }
            betch.set(doc(fireStore,`users/${user?.uid}/teamSnippets`,teamData.id),newSnippet)
           
            betch.update(doc(fireStore,"teams",teamData.id),{
                numberOfMembers: increment(1),
                members: arrayUnion(user?.uid)
            })
           await betch.commit()
           setTeamStateValue(prev=>({
            ...prev,mySnippets:[...prev.mySnippets,newSnippet]
           }))
        } catch (error:any) {
            console.log("Faild to join",error.message)
            setCustomError(error.message)
        }
        setLoading(false)
    }
    const leaveTeam=async(teamData:Team)=>{
    
        try {
            const batch = writeBatch(fireStore);
            const snippetDocs=getDocs(collection(fireStore,"teams"))
            const snippet= (await snippetDocs).docs.map(doc=>({
                ...doc.data()
            }))
            snippet.map(e=>{
              setCreatorId(e.creatorId)
            })
         
          
      
            batch.delete(
              doc(fireStore, `users/${user?.uid}/teamSnippets/${teamData.id}`)
            );
      
            batch.update(doc(fireStore, "teams", teamData.id), {
              numberOfMembers: increment(-1),
              members:arrayRemove(user?.uid)
            });
            
            if(user?.uid===creatorId){
                setCustomError("Admin canot leave the team"); return;

            } 
         
                await batch.commit();

            
      
         
      
            setTeamStateValue((prev) => ({
              ...prev,
              mySnippets: prev.mySnippets.filter(
                (item) => item.teamId!== teamData.id
              ),
            }));

    } catch (error:any) {
        console.log("leaveCommunity error", error);
        setCustomError(error.message)
        
      }
        setLoading(false);
    }
    return{
        teamStateValue,
        onJoinOrLeaveTeam,
        loading,
        customError
    }
}

export default useTeamData