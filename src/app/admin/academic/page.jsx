"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export default function AcademicSetupPage() {
  const [activeTab, setActiveTab] = useState("faculties");
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  // Loading States
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State
  const [facultyForm, setFacultyForm] = useState({ id: null, code: "", name: "" });
  const [departmentForm, setDepartmentForm] = useState({ id: null, faculty_id: "", name: "" });
  const [courseForm, setCourseForm] = useState({ id: null, faculty_id: "", department_id: "", name: "", duration_years: 4 });

  // Filtering
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState("all");

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // Load Data
  async function loadFaculties() {
    try {
      const res = await apiFetch("/admin/faculties");
      if (res.ok) {
        const data = await res.json();
        setFaculties(data);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load faculties.");
    }
  }

  async function loadDepartments() {
    try {
      const res = await apiFetch("/admin/departments");
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load departments.");
    }
  }

  async function loadCourses() {
    try {
      const res = await apiFetch("/admin/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load courses.");
    }
  }

  useEffect(() => {
    loadFaculties();
    loadDepartments();
    loadCourses();
  }, []);

  // CRUD Actions
  async function handleFacultySubmit(e) {
    e.preventDefault();
    if (!facultyForm.code || !facultyForm.name) {
      showToast("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const isEdit = !!facultyForm.id;
      const url = isEdit ? `/admin/faculties/${facultyForm.id}` : "/admin/faculties";
      const method = isEdit ? "PUT" : "POST";
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify({ code: facultyForm.code, name: facultyForm.name }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(isEdit ? "Faculty updated." : "Faculty created.");
        setFacultyForm({ id: null, code: "", name: "" });
        loadFaculties();
      } else {
        showToast(data.message || "Action failed.");
      }
    } catch {
      showToast("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFacultyDelete(id) {
    if (!confirm("Are you sure? This will delete all departments and courses in this faculty!")) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/admin/faculties/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Faculty deleted.");
        loadFaculties();
        loadDepartments();
        loadCourses();
      } else {
        showToast("Failed to delete faculty.");
      }
    } catch {
      showToast("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDepartmentSubmit(e) {
    e.preventDefault();
    if (!departmentForm.faculty_id || !departmentForm.name) {
      showToast("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const isEdit = !!departmentForm.id;
      const url = isEdit ? `/admin/departments/${departmentForm.id}` : "/admin/departments";
      const method = isEdit ? "PUT" : "POST";
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify({ faculty_id: departmentForm.faculty_id, name: departmentForm.name }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(isEdit ? "Department updated." : "Department created.");
        setDepartmentForm({ id: null, faculty_id: "", name: "" });
        loadDepartments();
      } else {
        showToast(data.message || "Action failed.");
      }
    } catch {
      showToast("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDepartmentDelete(id) {
    if (!confirm("Are you sure? This will delete all courses in this department!")) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/admin/departments/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Department deleted.");
        loadDepartments();
        loadCourses();
      } else {
        showToast("Failed to delete department.");
      }
    } catch {
      showToast("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCourseSubmit(e) {
    e.preventDefault();
    if (!courseForm.faculty_id || !courseForm.name || !courseForm.duration_years) {
      showToast("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const isEdit = !!courseForm.id;
      const url = isEdit ? `/admin/courses/${courseForm.id}` : "/admin/courses";
      const method = isEdit ? "PUT" : "POST";
      const payload = {
        faculty_id: courseForm.faculty_id,
        department_id: courseForm.department_id || null,
        name: courseForm.name,
        duration_years: courseForm.duration_years,
      };
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(isEdit ? "Course updated." : "Course created.");
        setCourseForm({ id: null, faculty_id: "", department_id: "", name: "", duration_years: 4 });
        loadCourses();
      } else {
        showToast(data.message || "Action failed.");
      }
    } catch {
      showToast("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCourseDelete(id) {
    if (!confirm("Are you sure you want to delete this course?")) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/admin/courses/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Course deleted.");
        loadCourses();
      } else {
        showToast("Failed to delete course.");
      }
    } catch {
      showToast("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  }

  // Filter lists
  const filteredDepartments = selectedFacultyFilter === "all"
    ? departments
    : departments.filter(d => d.faculty_id === parseInt(selectedFacultyFilter));

  const filteredCourses = selectedFacultyFilter === "all"
    ? courses
    : courses.filter(c => c.faculty_id === parseInt(selectedFacultyFilter));

  // Departments belonging to selected Faculty in Course Form
  const courseFormDepartments = courseForm.faculty_id
    ? departments.filter(d => d.faculty_id === parseInt(courseForm.faculty_id))
    : [];

  return (
    <div className="academic-setup">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {toast && <div className="toast">{toast}</div>}

      <div className="crumb">Academic Setup</div>
      <h1 className="title">DELSU Courses, Faculties & Departments</h1>
      <p className="subtitle">Manage academic structure, faculty metadata, departments, and course durations.</p>

      {/* Tabs */}
      <div className="tabs">
        <button className={activeTab === "faculties" ? "tab active" : "tab"} onClick={() => setActiveTab("faculties")}>Faculties</button>
        <button className={activeTab === "departments" ? "tab active" : "tab"} onClick={() => setActiveTab("departments")}>Departments</button>
        <button className={activeTab === "courses" ? "tab active" : "tab"} onClick={() => setActiveTab("courses")}>Courses</button>
      </div>

      {/* Filters (only for Depts / Courses) */}
      {activeTab !== "faculties" && (
        <div className="filter-card">
          <label>Filter by Faculty:</label>
          <select value={selectedFacultyFilter} onChange={(e) => setSelectedFacultyFilter(e.target.value)}>
            <option value="all">All Faculties</option>
            {faculties.map(f => (
              <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
            ))}
          </select>
        </div>
      )}

      {/* Faculties Tab */}
      {activeTab === "faculties" && (
        <div className="grid">
          {/* Form */}
          <div className="card">
            <h3>{facultyForm.id ? "Edit Faculty" : "Add Faculty"}</h3>
            <form onSubmit={handleFacultySubmit}>
              <div className="form-group">
                <label>Faculty Code (e.g. FOS)</label>
                <input
                  type="text"
                  value={facultyForm.code}
                  onChange={(e) => setFacultyForm({ ...facultyForm, code: e.target.value.toUpperCase() })}
                  placeholder="FOS"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Faculty Name</label>
                <input
                  type="text"
                  value={facultyForm.name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                  placeholder="Science"
                  disabled={loading}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {facultyForm.id ? "Update Faculty" : "Create Faculty"}
                </button>
                {facultyForm.id && (
                  <button type="button" className="btn-secondary" onClick={() => setFacultyForm({ id: null, code: "", name: "" })} disabled={loading}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="card">
            <h3>Registered Faculties ({faculties.length})</h3>
            <div className="list-wrapper">
              {faculties.length === 0 ? (
                <p className="no-data">No faculties registered.</p>
              ) : (
                <table className="setup-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faculties.map(f => (
                      <tr key={f.id}>
                        <td className="bold">{f.code}</td>
                        <td>{f.name}</td>
                        <td>
                          <button className="btn-edit" onClick={() => setFacultyForm({ id: f.id, code: f.code, name: f.name })}>Edit</button>
                          <button className="btn-delete" onClick={() => handleFacultyDelete(f.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Departments Tab */}
      {activeTab === "departments" && (
        <div className="grid">
          {/* Form */}
          <div className="card">
            <h3>{departmentForm.id ? "Edit Department" : "Add Department"}</h3>
            <form onSubmit={handleDepartmentSubmit}>
              <div className="form-group">
                <label>Faculty</label>
                <select
                  value={departmentForm.faculty_id}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, faculty_id: e.target.value })}
                  disabled={loading}
                >
                  <option value="">Select Faculty</option>
                  {faculties.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Department Name</label>
                <input
                  type="text"
                  value={departmentForm.name}
                  onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                  placeholder="Computer Science"
                  disabled={loading}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {departmentForm.id ? "Update Department" : "Create Department"}
                </button>
                {departmentForm.id && (
                  <button type="button" className="btn-secondary" onClick={() => setDepartmentForm({ id: null, faculty_id: "", name: "" })} disabled={loading}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="card">
            <h3>Registered Departments ({filteredDepartments.length})</h3>
            <div className="list-wrapper">
              {filteredDepartments.length === 0 ? (
                <p className="no-data">No departments found.</p>
              ) : (
                <table className="setup-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Faculty</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDepartments.map(d => (
                      <tr key={d.id}>
                        <td className="bold">{d.name}</td>
                        <td>{d.faculty?.name || "—"}</td>
                        <td>
                          <button className="btn-edit" onClick={() => setDepartmentForm({ id: d.id, faculty_id: d.faculty_id, name: d.name })}>Edit</button>
                          <button className="btn-delete" onClick={() => handleDepartmentDelete(d.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === "courses" && (
        <div className="grid">
          {/* Form */}
          <div className="card">
            <h3>{courseForm.id ? "Edit Course" : "Add Course"}</h3>
            <form onSubmit={handleCourseSubmit}>
              <div className="form-group">
                <label>Faculty</label>
                <select
                  value={courseForm.faculty_id}
                  onChange={(e) => setCourseForm({ ...courseForm, faculty_id: e.target.value, department_id: "" })}
                  disabled={loading}
                >
                  <option value="">Select Faculty</option>
                  {faculties.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Department (Optional)</label>
                <select
                  value={courseForm.department_id}
                  onChange={(e) => setCourseForm({ ...courseForm, department_id: e.target.value })}
                  disabled={loading || !courseForm.faculty_id}
                >
                  <option value="">No Department / Direct to Faculty</option>
                  {courseFormDepartments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Course / Program Name</label>
                <input
                  type="text"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  placeholder="Computer Science"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Course Duration (Years)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={courseForm.duration_years}
                  onChange={(e) => setCourseForm({ ...courseForm, duration_years: parseInt(e.target.value) })}
                  disabled={loading}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {courseForm.id ? "Update Course" : "Create Course"}
                </button>
                {courseForm.id && (
                  <button type="button" className="btn-secondary" onClick={() => setCourseForm({ id: null, faculty_id: "", department_id: "", name: "", duration_years: 4 })} disabled={loading}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="card">
            <h3>Registered Courses ({filteredCourses.length})</h3>
            <div className="list-wrapper">
              {filteredCourses.length === 0 ? (
                <p className="no-data">No courses found.</p>
              ) : (
                <table className="setup-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Faculty / Department</th>
                      <th>Duration</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map(c => (
                      <tr key={c.id}>
                        <td className="bold">{c.name}</td>
                        <td>
                          <span className="fac-badge">{c.faculty?.code || "—"}</span>
                          {c.department && <span className="dept-label"> · {c.department.name}</span>}
                        </td>
                        <td>{c.duration_years} Years</td>
                        <td>
                          <button className="btn-edit" onClick={() => setCourseForm({ id: c.id, faculty_id: c.faculty_id, department_id: c.department_id || "", name: c.name, duration_years: c.duration_years })}>Edit</button>
                          <button className="btn-delete" onClick={() => handleCourseDelete(c.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const css = `
.academic-setup {
  --blue: #5a8abb;
  --blueDark: #4574a4;
  --ink: #0f172a;
  --body: #475569;
  --muted: #7c8b9c;
  --line: #e6e9ee;
  --soft: #f5f7fa;
  --green: #2f7d4f;
  --red: #b23b3b;
  --amber: #b7791f;
  max-width: 1100px;
  margin: 0 auto;
  padding: 10px 0 60px;
}

.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  background: var(--ink);
  color: #fff;
  font-size: 13.5px;
  font-weight: 600;
  padding: 11px 18px;
  border-radius: 11px;
  box-shadow: 0 10px 30px rgba(15,23,42,.28);
}

.crumb {
  font-size: 12px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 800;
  margin-bottom: 8px;
}

.title {
  font-size: 28px;
  font-weight: 800;
  color: var(--ink);
  margin: 0 0 6px;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 15px;
  color: var(--body);
  margin: 0 0 24px;
}

.tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 1px;
  margin-bottom: 24px;
}

.tab {
  background: none;
  border: none;
  font-size: 15px;
  font-weight: 700;
  color: var(--muted);
  padding: 10px 16px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.tab:hover {
  color: var(--blue);
}

.tab.active {
  color: var(--blueDark);
}

.tab.active::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--blueDark);
}

.filter-card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-card label {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--body);
}

.filter-card select {
  padding: 6px 12px;
  font-size: 13.5px;
  border: 1px solid var(--line);
  border-radius: 8px;
  font-family: inherit;
  outline: none;
  color: var(--ink);
}

.grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 24px;
  align-items: start;
}

@media (max-width: 820px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.card h3 {
  font-size: 16px;
  font-weight: 800;
  margin: 0 0 16px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 10px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 12.5px;
  font-weight: 700;
  margin-bottom: 6px;
  color: var(--body);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid var(--line);
  border-radius: 10px;
  font-family: inherit;
  outline: none;
  color: var(--ink);
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--blue);
}

.form-actions {
  display: flex;
  gap: 10px;
}

.btn-primary {
  flex: 1;
  background: var(--blueDark);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-primary:disabled {
  background: var(--muted);
  cursor: not-allowed;
}

.btn-secondary {
  background: #fff;
  color: var(--body);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.list-wrapper {
  max-height: 500px;
  overflow-y: auto;
}

.no-data {
  text-align: center;
  font-size: 14px;
  color: var(--muted);
  padding: 30px 0;
  margin: 0;
}

.setup-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}

.setup-table th {
  text-align: left;
  font-size: 11px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 700;
  padding: 0 10px 8px;
  border-bottom: 1px solid var(--line);
}

.setup-table td {
  padding: 12px 10px;
  border-bottom: 1px solid #f1f3f6;
  color: var(--body);
  vertical-align: middle;
}

.setup-table td.bold {
  font-weight: 700;
  color: var(--ink);
}

.fac-badge {
  background: var(--soft);
  color: var(--blueDark);
  font-size: 11px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--line);
}

.dept-label {
  font-size: 12.5px;
  color: var(--body);
}

.btn-edit,
.btn-delete {
  background: none;
  border: none;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-edit {
  color: var(--blueDark);
  margin-right: 6px;
}

.btn-edit:hover {
  background: #eef4fb;
}

.btn-delete {
  color: var(--red);
}

.btn-delete:hover {
  background: #fdecec;
}
`;
