import React, { useState } from 'react';
import API from '../api/Api';

const Login = () => {
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState<string>();

    return <>
        {error && <p className='error'>{error}</p>}
        <form className='login' onSubmit={e => {
            e.preventDefault();
            setError(undefined);
            API.login(username, password).catch(e => setError(e.message));
        }}>

            <input
                type='password'
                placeholder='Password'
                value={password}
                onChange={e => setPassword(e.target.value)}
            />

            <input
                type='text'
                placeholder='Username'
                value={username}
                onChange={e => setUsername(e.target.value)}
            />

        </form>
    </>
}

export default Login;