const test = async () => {
  try {
    const res = await fetch('https://food-bridge-pneo.onrender.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testdonor' + Date.now() + '@example.com',
        password: 'password123',
        name: 'Test Donor',
        role: 'donor'
      })
    });
    console.log('Status:', res.status);
    console.log('Body:', await res.json());
  } catch (err) {
    console.error(err);
  }
};
test();
