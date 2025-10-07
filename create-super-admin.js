// Script to create the first super admin
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const uri = process.env.MONGODB_URL || "mongodb+srv://meyiraq24_db_user:7lrxqXWdjag0ODSB@mey.wb2vows.mongodb.net/mey?retryWrites=true&w=majority&appName=Mey";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createSuperAdmin() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    const database = client.db('mey');
    const usersCollection = database.collection('users');
    
    // Check if super admin already exists
    const existingSuperAdmin = await usersCollection.findOne({ role: 'super_admin' });
    
    if (existingSuperAdmin) {
      console.log('⚠️  Super admin already exists:');
      console.log(`   Username: ${existingSuperAdmin.username}`);
      console.log(`   Email: ${existingSuperAdmin.email}\n`);
      
      const overwrite = await question('Do you want to create another super admin? (yes/no): ');
      if (overwrite.toLowerCase() !== 'yes') {
        console.log('❌ Operation cancelled');
        rl.close();
        return;
      }
    }
    
    console.log('🔐 Create Super Admin Account\n');
    console.log('⚠️  Password requirements:');
    console.log('   - At least 8 characters');
    console.log('   - One uppercase letter');
    console.log('   - One lowercase letter');
    console.log('   - One number');
    console.log('   - One special character (@$!%*?&)\n');
    
    const username = await question('Username: ');
    const email = await question('Email: ');
    const password = await question('Password: ');
    
    // Validate password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      console.log('\n❌ Password does not meet requirements');
      rl.close();
      return;
    }
    
    // Check if username or email already exists
    const existingUser = await usersCollection.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      console.log('\n❌ Username or email already exists');
      rl.close();
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create super admin
    const result = await usersCollection.insertOne({
      username,
      email,
      password: hashedPassword,
      role: 'super_admin',
      refreshToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log('\n✅ Super admin created successfully!');
    console.log(`   ID: ${result.insertedId}`);
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: super_admin\n`);
    
    console.log('🔑 You can now login at: http://localhost:3000/api/v1/admin/auth/login');
    console.log('📚 API Documentation: http://localhost:3000/api/docs\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    rl.close();
  }
}

createSuperAdmin();

