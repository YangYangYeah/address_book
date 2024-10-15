document.addEventListener('DOMContentLoaded', function() {
    fetchContacts();

    const addContactForm = document.getElementById('add-contact-form');
    if (addContactForm) {
        addContactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            addContact();
        });
    }
});


function fetchBlacklistContacts() {
    fetch('/blacklist_contacts')
        .then(response => response.text())
        .then(html => {
            document.body.innerHTML = html; // 更新整个页面内容为返回的 HTML
        })
        .catch(error => console.error('Error fetching blacklist contacts:', error));
}

// 从后端获取联系人数据并更新表格
function fetchContacts() {
    fetch('/contacts')
        .then(response => response.json())
        .then(data => {
            const contactList = document.getElementById('contact-list');
            contactList.innerHTML = '';  // 清空列表，避免重复渲染
            data.forEach(contact => {
                const row = document.createElement('tr');
                row.className = 'contact';
                row.innerHTML = `
                    <td class="${contact.special_care ? 'special-care' : ''}">${contact.name}</td>
                    <td>${contact.phone}</td>
                    <td>${contact.student_id}</td>
                    <td>${contact.special_care ? '是' : '否'}</td>
                    <td>${contact.blacklist ? '是' : '否'}</td>
                    <td>
                        <div class="action-buttons">
                            <button onclick="deleteContact(${contact.id})">删除</button>
                            <button onclick="toggleSpecialCare(${contact.id})">${contact.special_care ? '取消特别关心' : '特别关心'}</button>
                            <button onclick="toggleBlacklist(${contact.id})">${contact.blacklist ? '移出黑名单' : '黑名单'}</button>
                        </div>
                    </td>
                `;
                contactList.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching contacts:', error));
}


// 添加联系人
function addContact() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const studentId = document.getElementById('student_id').value;

    fetch('/add_contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, phone, student_id: studentId })
    })
    .then(response => {
        if (response.ok) {
            // 成功后重新获取联系人列表
            fetchContacts();
            // 重置表单
            document.getElementById('add-contact-form').reset();
        } else {
            console.error('Failed to add contact');
        }
    })
    .catch(error => console.error('Error adding contact:', error));
}


// 删除联系人
function deleteContact(id) {
    fetch(`/delete_contact/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            // 成功后重新获取联系人列表
            fetchContacts();
        } else {
            console.error('Failed to delete contact');
        }
    })
    .catch(error => console.error('Error deleting contact:', error));
}


// 切换特别关心状态
function toggleSpecialCare(id) {
    fetch(`/toggle_special_care/${id}`, {
        method: 'POST'
    })
    .then(response => {
        if (response.ok) {
            fetchContacts();  // 成功后重新获取联系人列表
        } else {
            console.error('Failed to toggle special care');
        }
    })
    .catch(error => console.error('Error toggling special care:', error));
}


// 切换黑名单状态
function toggleBlacklist(id) {
    fetch(`/toggle_blacklist/${id}`, {
        method: 'POST'
    })
    .then(response => {
        if (response.ok) {
            // 检查当前页面是否是黑名单页面
            if (window.location.pathname === '/blacklist_contacts') {
                fetchBlacklistContacts();  // 如果在黑名单页面，重新获取黑名单联系人
            } else {
                fetchContacts();  // 如果在主页面，重新获取联系人列表
            }
        } else {
            console.error('Failed to toggle blacklist');
        }
    })
    .catch(error => console.error('Error toggling blacklist:', error));
}




