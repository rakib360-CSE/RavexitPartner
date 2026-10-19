
if (!unlocked) return (
  <div className="admin-login">
    <div className="login-card">
      <span className="brand-mark">
        <Settings2 />
      </span>

      <span className="eyebrow">SITE MANAGEMENT</span>
      <h1>Admin workspace</h1>
      <p>Sign in using your authorized admin account.</p>

      <form
        onSubmit={async (e) => {
          e.preventDefault();

          if (!supabase) {
            notify("Supabase is not configured.");
            return;
          }

          const { data: result, error } =
            await supabase.auth.signInWithPassword({
              email,
              password
            });

          if (error) {
            notify("Login failed. Check your email and password.");
            return;
          }

          if (
            result.user?.id !==
            "87309a21-46da-4e94-a9fe-8cbadc173770"
          ) {
            await supabase.auth.signOut();
            notify("Unauthorized admin account.");
            return;
          }

          setDbSession(result.session);
          setStorageMode("supabase");
          setUnlocked(true);
          setPassword("");
          notify("Admin login successful.");
        }}
      >
        <label>
          Admin email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter admin email"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
          />
        </label>

        <button className="primary-btn full-btn" type="submit">
          Sign in <ArrowUpRight size={17} />
        </button>
      </form>

      <button className="text-btn" onClick={close}>
        ← Back to website
      </button>
    </div>
  </div>
);
