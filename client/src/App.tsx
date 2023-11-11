import React, {useContext, useEffect, useState} from 'react';
import LoginForm from "./components/LoginForm";
import {Context} from "./index";
import {observer} from "mobx-react-lite";
import {IUser} from "./models/IUser";
import UserService from "./services/UserService";

function App() {
    const {store} = useContext(Context)
    const [users, setUsers] = useState<IUser[]>([])

    useEffect(() => {
        if(localStorage.getItem('token'))
            store.checkAuth()
    }, [])

    async function getUsers() {
        try {
            const response = await UserService.fetchUsers()
            setUsers(response.data)
        } catch (e) {
            console.log(e)
        }
    }

    if(store.isLoading) {
        return (
            <h1>Loading...</h1>
        )
    }

    if(!store.isAuth) {
        return (<>
                <LoginForm/>

                <button onClick={getUsers}>Get users</button>
        </>
        )
    }

  return (
    <div className="App">
        <h1>{store.isAuth ? `User authorized ${store.user.email}` : 'User is not authorized'}</h1>
        <h1>{store.user.isActivated ? `User activated account` : 'ACTIVATE ACCOUNT!!!'}</h1>
        <button onClick={() => store.logout()}>Logout</button>
        <div>
            <button onClick={getUsers}>Get users</button>
        </div>
        {users && users.map(user =>
            <div key={user.id}>{user.email}</div>
        )}
    </div>
  );
}

export default observer(App);
