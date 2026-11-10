const API_URL = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/users`;

// Get data 
async function getData() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('فشل في جلب البيانات');
    return await res.json();
  } catch (err) {
    console.error('Error fetching data:', err);
    return [];
  }
}

// Add User 
async function addItem(name, loan, phone_number) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, loan, phone_number })
    });
    return await res.json();
  } catch (err) {
    console.error(err);
  }
}

// Edit User 
async function updateUser(oldName, name, loan, phone_number) {
  try {
    const res = await fetch(`${API_URL}/${oldName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, loan, phone_number })
    });
    return await res.json();
  } catch (err) {
    console.error(err);
  }
}

// Delete User
async function deleteUserApi(name) {
  try {
    const res = await fetch(`${API_URL}/${name}`, {
      method: 'DELETE'
    });
    return await res.json();
  } catch (err) {
    console.error(err);
  }
}