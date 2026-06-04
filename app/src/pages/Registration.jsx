import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registration } from "../api/apiService";
import "./Auth.css";
import "../styles/shared.css";

function Registration({ setIsLoggedIn }) {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleRegistration(event) {
        event.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        if (password !== passwordConfirm) {
            setError("Passwörter stimmen nicht überein");
            setLoading(false);
            return;
        }

        try {
            const data = await registration(email, username, password, passwordConfirm);

            if (data.success) {
                setIsLoggedIn(true);
                localStorage.setItem("user", JSON.stringify(data.user));
                navigate("/");
            } else {
                if (data.errors && data.errors.length > 0) {
                    setError(data.errors.join(" "));
                } else {
                    setError(data.message || "Registrierung fehlgeschlagen");
                }
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
                <h1>Registrieren</h1>

                <form className="auth-form" onSubmit={handleRegistration}>
                    <div className="auth-field">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="auth-field">
                        <label>Benutzername</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>

                    <div className="auth-field">
                        <label>Passwort</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <small>Min. 8 Zeichen, 1 Großbuchstabe, 1 Zahl, 1 Sonderzeichen</small>
                    </div>

                    <div className="auth-field">
                        <label>Passwort bestätigen</label>
                        <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required />
                    </div>

                    {error && <p className="auth-error">{error}</p>}
                    {message && <p className="auth-success">{message}</p>}

                    <button className="auth-submit" type="submit" disabled={loading}>
                        {loading ? "Wird registriert…" : "Registrieren"}
                    </button>
                </form>

                <p className="auth-footer">
                    Schon registriert? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Registration;
