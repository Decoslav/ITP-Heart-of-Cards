import { useEffect, useState } from 'react';
import { getProfile, changePassword } from '../api/apiService';
import './Profile.css';
import '../styles/shared.css';
import '../pages/Auth.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [loadError, setLoadError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile();

        if (data.success) {
          setUser(data.user);
        } else {
          setLoadError(data.message || 'Profil konnte nicht geladen werden.');
        }
      } catch {
        setLoadError('Verbindung zum Server fehlgeschlagen.');
      }
    }

    loadProfile();
  }, []);

  async function handlePasswordChange(event) {
    event.preventDefault();

    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== newPasswordConfirm) {
      setPasswordError('Die neuen Passwörter stimmen nicht überein');
      return;
    }

    setSaving(true);

    try {
      const data = await changePassword(currentPassword, newPassword, newPasswordConfirm);

      if (data.success) {
        setPasswordSuccess(data.message || 'Passwort erfolgreich geändert');
        setCurrentPassword('');
        setNewPassword('');
        setNewPasswordConfirm('');
      } else if (data.errors && data.errors.length > 0) {
        setPasswordError(data.errors.join(' '));
      } else {
        setPasswordError(data.message || 'Passwort konnte nicht geändert werden');
      }
    } catch {
      setPasswordError('Verbindung zum Server fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-page page-bg">
      <div className="profile-container">
        <p className="eyebrow">Dein Konto</p>
        <h1>Profil</h1>

        {loadError && <p className="auth-error">{loadError}</p>}

        {user && (
          <div className="auth-card profile-card">
            <h2>{user.username}</h2>
            <div className="profile-info">
              <span>E-Mail</span>
              <strong>{user.email}</strong>
            </div>
            <div className="profile-info">
              <span>Rolle</span>
              <strong>{user.role}</strong>
            </div>
            <div className="profile-info">
              <span>Mitglied seit</span>
              <strong>{new Date(user.createdAt).toLocaleDateString('de-DE')}</strong>
            </div>
          </div>
        )}

        <div className="auth-card profile-card">
          <h2>Passwort ändern</h2>

          <form className="auth-form" onSubmit={handlePasswordChange}>
            <div className="auth-field">
              <label>Aktuelles Passwort</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label>Neues Passwort</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <small>Min. 8 Zeichen, 1 Großbuchstabe, 1 Zahl, 1 Sonderzeichen</small>
            </div>

            <div className="auth-field">
              <label>Neues Passwort bestätigen</label>
              <input
                type="password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                required
              />
            </div>

            {passwordError && <p className="auth-error">{passwordError}</p>}
            {passwordSuccess && <p className="auth-success">{passwordSuccess}</p>}

            <button className="auth-submit" type="submit" disabled={saving}>
              {saving ? 'Wird gespeichert…' : 'Passwort ändern'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
