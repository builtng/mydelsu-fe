'use client';
import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

const BLUE = "#5a8abb";
const BLUE_DARK = "#4574a4";
const GREEN = "#2f7d4f";
const RED = "#b23b3b";
const AMBER = "#b7791f";

export default function UsersAdminPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Edit State
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        search: search
      });
      const res = await apiFetch(`/admin/users?${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
        setLastPage(data.last_page || 1);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Failed to load users.");
      }
    } catch (e) {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await apiFetch("/admin/roles");
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    } catch (e) {
      // Roles list stays empty; role assignment form will show no options.
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleEditRoles = (user) => {
    setSelectedUser(user);
    setSelectedRoleIds(user.roles.map(r => r.id));
    setSuccess(null);
    setError(null);
  };

  const handleRoleToggle = (id) => {
    setSelectedRoleIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSaveRoles = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSuccess(null);
    setError(null);

    // Safeguard check
    if (selectedUser.email === "admin@mydelsu.com" && !selectedRoleIds.includes(roles.find(r => r.name === "Super Admin")?.id)) {
      setError("The default admin user must retain the Super Admin role.");
      return;
    }

    try {
      const res = await apiFetch(`/admin/users/${selectedUser.id}/roles`, {
        method: "PUT",
        body: JSON.stringify({ role_ids: selectedRoleIds })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`Roles updated for ${selectedUser.name}.`);
        setSelectedUser(null);
        fetchUsers();
      } else {
        setError(data.message || "Failed to update roles.");
      }
    } catch (err) {
      setError("Unable to reach the server. Please try again.");
    }
  };

  return (
    <div className="users-page">
      <style>{css}</style>
      
      <div className="page-head">
        <div>
          <span className="eyebrow">Administration</span>
          <h1>User Roles & Membership</h1>
          <p className="sub">Search system users and configure administrative role memberships.</p>
        </div>
      </div>

      {success && <div className="banner ok">{success}</div>}
      {error && <div className="banner bad">{error}</div>}

      <div className="search-bar-row">
        <input
          type="text"
          placeholder="Search by name, email, or matric number..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="search-input"
        />
      </div>

      <div className="grid">
        <div className="card list-card">
          <h3>System Users</h3>
          
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Matric Number</th>
                    <th>Account Type</th>
                    <th>Assigned Roles</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="user-name-cell">{user.name}</td>
                      <td>{user.email}</td>
                      <td className="mono">{user.profile?.matric || "N/A"}</td>
                      <td>
                        <span className={"tag " + (user.is_admin ? "admin" : "student")}>
                          {user.is_admin ? "Administrator" : "Student"}
                        </span>
                      </td>
                      <td>
                        <div className="user-role-tags">
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map(r => (
                              <span key={r.id} className="user-role-badge">
                                {r.name}
                              </span>
                            ))
                          ) : (
                            <span className="no-roles">-</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button className="btn-edit" onClick={() => handleEditRoles(user)}>
                          Assign Roles
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="6" className="no-results">
                        {error
                          ? "Unable to load users."
                          : search
                          ? "No users found matching search criteria."
                          : "No users found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {lastPage > 1 && (
            <div className="pagination">
              <button 
                disabled={page <= 1} 
                onClick={() => setPage(page - 1)}
                className="btn-page"
              >
                Previous
              </button>
              <span className="page-indicator">Page {page} of {lastPage}</span>
              <button 
                disabled={page >= lastPage} 
                onClick={() => setPage(page + 1)}
                className="btn-page"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {selectedUser && (
          <div className="card edit-card">
            <h3>Assign Roles to {selectedUser.name}</h3>
            <p className="edit-sub">{selectedUser.email}</p>
            
            <form onSubmit={handleSaveRoles} className="edit-form">
              <div className="roles-checklist">
                {roles.length === 0 ? (
                  <p className="no-data">No roles are available to assign.</p>
                ) : (
                  roles.map((role) => (
                    <label key={role.id} className="role-checkbox-item">
                      <input
                        type="checkbox"
                        checked={selectedRoleIds.includes(role.id)}
                        onChange={() => handleRoleToggle(role.id)}
                      />
                      <div className="role-cb-label">
                        <span className="role-cb-name">{role.name}</span>
                        <span className="role-cb-desc">{role.description}</span>
                      </div>
                    </label>
                  ))
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Save Changes</button>
                <button type="button" className="btn-secondary" onClick={() => setSelectedUser(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

const css = `
.users-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-head {
  margin-bottom: 24px;
}

.eyebrow {
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 800;
}

.page-head h1 {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -.02em;
  margin: 6px 0 2px;
}

.sub {
  font-size: 14.5px;
  color: var(--body);
  margin: 0;
}

.banner {
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.5;
  margin-bottom: 20px;
}

.banner.ok {
  background: #eefaf1;
  border: 1px solid #cdeed9;
  color: ${GREEN};
}

.banner.bad {
  background: #fdecec;
  border: 1px solid #f5c6c6;
  color: ${RED};
}

.search-bar-row {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  max-width: 450px;
  padding: 11px 14px;
  border: 1px solid var(--line);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  box-shadow: 0 1px 2px rgba(15,23,42,.02);
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--blue);
}

.grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 24px;
}

@media (max-width: 1000px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(15,23,42,.04);
}

.card h3 {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 18px;
  color: var(--ink);
}

.loading {
  font-size: 14px;
  color: var(--muted);
  padding: 40px 0;
  text-align: center;
}

.no-data {
  text-align: center;
  font-size: 14px;
  color: var(--muted);
  padding: 30px 0;
  margin: 0;
}

.table-scroll {
  overflow-x: auto;
  margin-bottom: 16px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}

thead th {
  text-align: left;
  font-size: 11px;
  letter-spacing: .5px;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 700;
  padding: 0 12px 10px 0;
  border-bottom: 1px solid var(--line);
  white-space: nowrap;
}

tbody td {
  padding: 12px 12px 12px 0;
  border-bottom: 1px solid #f1f3f6;
  color: var(--body);
}

.user-name-cell {
  font-weight: 700;
  color: var(--ink);
}

.mono {
  font-family: monospace;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.tag {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .3px;
  border-radius: 999px;
  padding: 3px 10px;
  white-space: nowrap;
}

.tag.admin {
  color: ${AMBER};
  background: #fdf6e7;
  border: 1px solid #f0e2c6;
}

.tag.student {
  color: var(--blueDark);
  background: #eef4fb;
  border: 1px solid #d9e6f3;
}

.user-role-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.user-role-badge {
  font-size: 10.5px;
  font-weight: 600;
  background: #f1f5f9;
  border: 1px solid var(--line);
  color: var(--body);
  padding: 1px 6px;
  border-radius: 6px;
}

.no-roles {
  color: var(--muted);
  font-style: italic;
}

.btn-edit {
  background: #fff;
  border: 1px solid var(--line);
  color: var(--body);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.btn-edit:hover {
  border-color: var(--blue);
  color: var(--blue);
  background: #f8fafc;
}

.no-results {
  text-align: center;
  color: var(--muted);
  padding: 30px 0 !important;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}

.btn-page {
  background: #fff;
  border: 1px solid var(--line);
  color: var(--body);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
  border-color: var(--blue);
  color: var(--blue);
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: default;
}

.page-indicator {
  font-size: 13px;
  color: var(--muted);
}

.edit-card {
  align-self: start;
}

.edit-sub {
  font-size: 13px;
  color: var(--muted);
  margin: -14px 0 18px;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.roles-checklist {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 16px;
  background: #fafafb;
}

.role-checkbox-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f6;
}

.role-checkbox-item:last-child {
  border-bottom: none;
}

.role-checkbox-item input {
  margin-top: 3px;
  accent-color: var(--blue);
}

.role-cb-label {
  display: flex;
  flex-direction: column;
}

.role-cb-name {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--ink);
}

.role-cb-desc {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.4;
}

.form-actions {
  display: flex;
  gap: 10px;
}
`;
