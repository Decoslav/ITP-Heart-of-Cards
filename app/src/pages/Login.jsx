import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/apiService";
import "./Auth.css";
import "../styles/shared.css";

function Login({ setIsLoggedIn }) {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const data = await login(username, password);

            if (data.success) {
                setIsLoggedIn(true);
                localStorage.setItem("user", JSON.stringify(data.user));
                navigate("/");
            } else {
                setError(data.message || "Login fehlgeschlagen");
            }
        } catch (error) {
            setError("Verbindung zum Server fehlgeschlagen");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page page-bg">
            <div className="auth-card">
                <h1>Login</h1>

                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="auth-field">
                        <label>Benutzername</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>

                    <div className="auth-field">
                        <label>Passwort</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button className="auth-submit" type="submit" disabled={loading}>
                        {loading ? "Wird eingeloggt…" : "Einloggen"}
                    </button>
                </form>

                <p className="auth-footer">
                    Noch kein Konto? <Link to="/registration">Registrieren</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
