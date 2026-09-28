// ===== Storage keys =====
const DB = 'skillstrack_users';
const SESSION = 'skillstrack_session';

// ===== Storage helpers =====

function getUsers() {
  return JSON.parse(localStorage.getItem(DB) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(DB, JSON.stringify(users));
}

// Shows a temporary message in the element with the given id.
// err = true -> styled as an error, err = false -> styled as a success.
function msg(id, text, err = true) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.style.display = 'block';
  el.className = err ? 'error' : 'success';

  setTimeout(() => {
    el.style.display = 'none';
  }, 3500);
}

// ===== Auth: sign up =====

function createAccount(e) {
  e.preventDefault();

  const name = document.getElementById('su_name').value.trim();
  const email = document.getElementById('su_email').value.trim().toLowerCase();
  const pass = document.getElementById('su_pass').value;
  const role = document.getElementById('su_role').value;

  if (!name || !email || !pass) {
    return msg('su_err', 'Fill all fields');
  }
  if (pass.length < 4) {
    return msg('su_err', 'Password min 4 chars');
  }

  const users = getUsers();
  if (users.find(u => u.email === email)) {
    return msg('su_err', 'Email already registered');
  }

  users.push({
    id: Date.now(),
    name,
    email,
    password: pass,
    role,
    progress: Math.floor(Math.random() * 60) + 20
  });
  saveUsers(users);

  msg('su_ok', 'Account created! Go to login...', false);

  setTimeout(() => {
    location.href = role === 'assessor' ? 'assessor-login.html' : 'learner-login.html';
  }, 1200);
}

// ===== Auth: student login =====

function studentLogin(e) {
  e.preventDefault();

  const input = document.getElementById('st_user').value.trim().toLowerCase();
  const pass = document.getElementById('st_pass').value;

  // Seed demo accounts on first-ever login attempt
  let users = getUsers();
  if (users.length === 0) seed();
  users = getUsers();

  const user = users.find(u =>
    (u.email === input || u.name.toLowerCase() === input) &&
    u.password === pass &&
    u.role !== 'assessor'
  );

  if (!user) {
    return msg('st_err', 'Invalid student credentials. Create account first.');
  }

  localStorage.setItem(SESSION, JSON.stringify(user));
  msg('st_ok', 'Welcome ' + user.name + '!', false);

  setTimeout(() => {
    location.href = 'learner-login.html';
  }, 800);
}

// ===== Auth: assessor login =====

function assessorLogin(e) {
  e.preventDefault();

  const input = document.getElementById('as_user').value.trim().toLowerCase();
  const pass = document.getElementById('as_pass').value;

  // Seed demo accounts on first-ever login attempt
  let users = getUsers();
  if (users.length === 0) seed();
  users = getUsers();

  const user = users.find(u =>
    (u.email === input || u.name.toLowerCase() === input) &&
    u.password === pass
  );

  if (!user) {
    return msg('as_err', 'Invalid. Try assessor@skillstrack.com / 1234');
  }
  if (user.role !== 'assessor' && input !== 'assessor@skillstrack.com') {
    return msg('as_err', 'This is not an assessor account');
  }

  localStorage.setItem(SESSION, JSON.stringify(user));
  msg('as_ok', 'Welcome Assessor ' + user.name + '!', false);

  setTimeout(() => {
    location.href = 'assessor.html';
  }, 800);
}

// Populates localStorage with demo accounts (1 assessor + 4 students)
function seed() {
  const demoUsers = [
    { id: 1, name: 'Sam Assessor', email: 'assessor@skillstrack.com', password: '1234', role: 'assessor', progress: 61 },
    { id: 2, name: 'Alex Morgan',  email: 'alex@student.com',        password: '1234', role: 'learner',  progress: 75 },
    { id: 3, name: 'Jordan Lee',   email: 'jordan@student.com',      password: '1234', role: 'learner',  progress: 45 },
    { id: 4, name: 'Casey Rivera', email: 'casey@student.com',       password: '1234', role: 'learner',  progress: 90 },
    { id: 5, name: 'Sam Wu',       email: 'sam@student.com',         password: '1234', role: 'learner',  progress: 60 }
  ];
  saveUsers(demoUsers);
}

// ===== Assessor dashboard =====

function loadAssessor() {
  const session = JSON.parse(localStorage.getItem(SESSION) || 'null');

  if (!session) {
    location.href = 'assessor-login.html';
    return;
  }

  const isAssessor = session.role === 'assessor' || session.email === 'assessor@skillstrack.com';
  if (!isAssessor) {
    if (confirm('Not assessor. Go to student dashboard?')) {
      location.href = 'student.html';
    } else {
      location.href = 'assessor-login.html';
    }
    return;
  }

  document.getElementById('assessorName').textContent = session.name;
  document.getElementById('welcomeName').textContent = session.name;
  document.getElementById('lastLogin').textContent =
    'Last login: Today at ' + new Date().toLocaleTimeString() + ' - 5 submissions awaiting review';

  renderLearners();

  const learnerCount = getUsers().filter(u => u.role !== 'assessor').length;
  document.getElementById('totalLearners').textContent = learnerCount;
  document.getElementById('learnerCount').textContent = learnerCount;
}

// Switches the active tab in the assessor dashboard
function showTab(tab) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.sidebar .nav').forEach(n => n.classList.remove('active'));

  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('nav-' + tab).classList.add('active');

  const titles = {
    overview: 'Assessor Overview',
    learners: 'Learners Management',
    reviews: 'Reviews & Submissions',
    schedule: 'Schedule & Sessions'
  };
  document.getElementById('tabTitle').textContent = titles[tab];
}

// Renders the learners table on the "Learners" tab
function renderLearners() {
  const learners = getUsers().filter(u => u.role !== 'assessor');
  const tableBody = document.getElementById('learnersBody');
  if (!tableBody) return;

  tableBody.innerHTML = learners.map(u => `
    <tr>
      <td><span class="avatar">${u.name.substring(0, 2).toUpperCase()}</span> ${u.name}</td>
      <td>${u.email}</td>
      <td>
        <div class="progress-mini"><span style="width:${u.progress}%"></span></div>
        ${u.progress}%
      </td>
      <td>
        <span class="badge ${u.progress > 70 ? 'reviewed' : 'pending'}">
          ${u.progress > 70 ? 'Active' : 'Learning'}
        </span>
      </td>
      <td>
        <button class="action-btn" onclick="alert('View ${u.name}')">View</button>
        <button class="action-btn" onclick="alert('Message ${u.name}')">Message</button>
      </td>
    </tr>
  `).join('');
}

// Filters the learners table by search text (matches any column)
function filterLearners() {
  const query = document.getElementById('learnerSearch').value.toLowerCase();

  document.querySelectorAll('#learnersBody tr').forEach(row => {
    const matches = row.textContent.toLowerCase().includes(query);
    row.style.display = matches ? '' : 'none';
  });
}

// Filters the reviews table: 'all', 'pending', or 'reviewed'
function filterReviews(type, activeBtn) {
  document.querySelectorAll('#tab-reviews .filter').forEach(btn => btn.classList.remove('active'));
  activeBtn.classList.add('active');

  document.querySelectorAll('#reviewsBody tr').forEach(row => {
    const isPending = row.innerHTML.includes('Pending');

    if (type === 'all') {
      row.style.display = '';
    } else if (type === 'pending') {
      row.style.display = isPending ? '' : 'none';
    } else {
      row.style.display = !isPending ? '' : 'none';
    }
  });
}


// ===== Student dashboard =====

function loadStudent() {
  const session = JSON.parse(localStorage.getItem(SESSION) || 'null');

  if (!session) {
    location.href = 'index.html';
    return;
  }

  const nameEl = document.getElementById('studentName');
  if (nameEl) nameEl.textContent = session.name;

  const emailEl = document.getElementById('studentEmail');
  if (emailEl) emailEl.textContent = session.email;
}

// ===== Shared actions =====

function logout() {
  localStorage.removeItem(SESSION);
  location.href = 'index.html';
}

function markReviewed(el) {
  el.textContent = 'Reviewed';
  el.className = 'badge reviewed';
}

function viewSchedule() {
  showTab('schedule');
}