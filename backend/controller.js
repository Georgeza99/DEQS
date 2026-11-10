const db = require('./db');

//get controller
exports.getData = async (req, res) => {
  try {
    const data = await db('customers').select('*');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// add controller
exports.addUser = async (req, res) => {
  try {
    const { name, loan, phone_number } = req.body;
    
    
    if (!name || !loan || !phone_number) {
      return res.status(400).json({ error: 'اكمل ادخال البيانات ناقصة' });
    }

   
    const [newUser] = await db('customers')
      .insert({
        user: name,        
        loan: loan,
        phone_number: phone_number
      })
      .returning('*');

    res.status(201).json({ message: 'تم إضافة المستخدم بنجاح', user: newUser });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// edit controller
exports.editUser = async (req, res) => {
  try {
    const userName = req.params.name;
    const { name, loan, phone_number } = req.body;

    const updateData = {};
    if (name) updateData.user = name; 
    if (loan) updateData.loan = loan;
    if (phone_number) updateData.phone_number = phone_number;


    const updatedRows = await db('customers')
      .where({ user: userName }) 
      .update(updateData)
      .returning('*');

    if (updatedRows.length === 0) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    res.json({ message: 'تم تعديل المستخدم بنجاح', user: updatedRows[0] });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// delete controller 
exports.deleteUser = async (req, res) => {
  try {
    const userName = req.params.name; 

    const deletedRows = await db('customers').where({ user: userName }).del();
    
    if (deletedRows === 0) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    res.json({ message: 'تم حذف المستخدم بنجاح' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};