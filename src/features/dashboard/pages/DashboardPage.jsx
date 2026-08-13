import './DashboardPage.css';

function DashboardPage() {
  return (
    <div className="dashboard">
      <div className="dashboard-welcome">
        <div>
          <h1>Welcome back</h1>
          <p>Here's a quick look at your workspace.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-card dashboard-card-wide">
          <h2>Overview</h2>
          <p className="dashboard-card-empty">
            Your account activity and summaries will show up here once available.
          </p>
        </section>

        <section className="dashboard-card">
          <h2>Recent activity</h2>
          <p className="dashboard-card-empty">Nothing to show yet.</p>
        </section>

        <section className="dashboard-card">
          <h2>Quick actions</h2>
          <p className="dashboard-card-empty">Actions for your account will appear here.</p>
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;
