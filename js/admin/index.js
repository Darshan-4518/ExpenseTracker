

let users = [];
let userNumberToDelete = null;
const userId = localStorage.getItem("userId");

const userTable = document.getElementById("userTable");
const adminTable = document.getElementById("adminTable");
const userCount = document.getElementById("userCount");
const adminCount = document.getElementById("adminCount");


async function callSendEmailApis(subject, message, emails) {
    fetch("http://127.0.0.1:3000/api/send-mails", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject, message: message, emails: emails })
    })
}

async function callDeteteUserApis(user,reason) {
    fetch("http://127.0.0.1:3000/api/user", {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user:user,reason:reason,adminId:userId})
    })
}

function showDeleteModal(index) {
    userNumberToDelete = index;
    document.getElementById('deleteModal').classList.remove('hidden');
}

function cancelDelete() {
    userNumberToDelete = null;
    document.getElementById('deleteReason').value = '';
    document.getElementById('deleteModal').classList.add('hidden');
}

function confirmDelete() {
    const reason = document.getElementById('deleteReason').value.trim();
    if (!reason) {
        alert('Please provide a reason for deletion.');
        return;
    }

    console.log(`Deleting user ${userNumberToDelete} for reason: ${reason}`);
    deleteUser(reason);
    cancelDelete();
}

function renderUsers() {
    userTable.innerHTML = "";
    userCount.textContent = users.length + 1;
    adminCount.textContent = users.filter(u => u.role === "ADMIN").length + 1;
    let userNumber = 0;
    users.forEach(user => {
        userNumber++;
        const row = document.createElement("tr");
        row.innerHTML = `
          <td><input type="checkbox" class="userCheckbox" value="${user.email}"></td>
          <td class="py-2">${user.firstName}</td>
          <td>${user.email}</td>
          <td>${user.ROLE.toLowerCase()}</td>
          <td><button onclick="showDeleteModal(${userNumber})" class="text-red-600 hover:underline">Delete</button></td>
        `;
        userTable.appendChild(row);
    });
}

function renderOtherAdmins() {
    adminTable.innerHTML = "";
    const otherAdmins = users.filter(u => u.ROLE === "ADMIN");
    otherAdmins.forEach(admin => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="py-2">${admin.firstName}</td>
          <td>${admin.email}</td>
          <td>${admin.ROLE.toLowerCase()}</td>
        `;
        adminTable.appendChild(row);
    });
}

function deleteUser(reason) {
    if (userNumberToDelete) {
        let index = userNumberToDelete - 1;
        callDeteteUserApis(users.splice(index, 1)[0],reason)
        renderUsers();
        renderOtherAdmins();
    }
}

function getEmailDetails() {
    const subject = document.getElementById("emailSubject").value.trim();
    const content = document.getElementById("emailContent").value.trim();

    if (!subject || !content) {
        alert("Please enter both subject and message content.");
        return null;
    }

    return { subject, content };
}

function sendEmailToAll() {
    const details = getEmailDetails();
    if (!details) return;

    const emails = users.map(u => u.email);
    alert(`Sending email to ALL users:\n\nSubject: ${details.subject}\nMessage: ${details.content}\nRecipients: ${emails.join(", ")}`);
    callSendEmailApis(details.subject, details.content, emails);
}

function sendEmailToSelected() {
    const details = getEmailDetails();
    if (!details) return;

    const selected = Array.from(document.querySelectorAll(".userCheckbox:checked"))
        .map(cb => cb.value);

    if (selected.length === 0) {
        alert("No users selected.");
        return;
    }

    alert(`Sending email to SELECTED users:\n\nSubject: ${details.subject}\nMessage: ${details.content}\nRecipients: ${selected.join(", ")}`);
    callSendEmailApis(details.subject, details.content, selected);
}

async function getAllTheUsers() {
    return fetch("http://localhost:3000/api/users").then(async (e) => {
        const response = await e.json();

        users = response.data.filter(u => u._id !== userId);
    })
}

getAllTheUsers().then(() => {
    renderUsers();
    renderOtherAdmins();
})