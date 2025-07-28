// Original
import React, { useState } from "react";
import "./Login.css";
import Header from '../components/Header';

import userIcon from "../assets/person.png";
import passwordIcon from "../assets/password.png";
import { useNavigate } from 'react-router-dom';

<div className="app">
    <Header />
</div>

function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();


    const handleLogin = (e) => {
        e.preventDefault();

        if (!username || !password) {
            alert("Please enter both fields");
        } else {
                localStorage.setItem("isLoggedIn", "true");
                navigate('/division');

        }
    };

    return (
        <div className="login-container">

            <div className="login-box">
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="input-wrapper">
                        <span className="icon"><img src={userIcon} alt="user" /></span>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="input-wrapper">
                        <span className="icon"><img src={passwordIcon} alt="password" /></span>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit">Login</button>
                    <a href="#f" className="forgot-password">Forgot Password?</a>

                </form>
            </div>
        </div>
    );
}

export default Login;