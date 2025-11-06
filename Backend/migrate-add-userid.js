/**
 * Migration Script: Add userId to existing tasks
 * 
 * This script updates all existing tasks in db.json to include a userId field.
 * Run this ONCE after deploying the security fix.
 * 
 * Usage: node migrate-add-userid.js
 */

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');
const BACKUP_FILE = path.join(__dirname, 'db.backup.json');

function migrateDatabase() {
    console.log('🔄 Starting database migration...\n');

    // Read current database
    let db;
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        db = JSON.parse(data);
        console.log('✅ Database loaded successfully');
    } catch (error) {
        console.error('❌ Error reading database:', error.message);
        process.exit(1);
    }

    // Create backup
    try {
        fs.writeFileSync(BACKUP_FILE, JSON.stringify(db, null, 2));
        console.log('✅ Backup created at db.backup.json\n');
    } catch (error) {
        console.error('❌ Error creating backup:', error.message);
        process.exit(1);
    }

    // Check if tasks exist
    if (!db.tasks || !Array.isArray(db.tasks)) {
        console.log('⚠️  No tasks found in database');
        return;
    }

    console.log(`📊 Found ${db.tasks.length} tasks to migrate\n`);

    // Get all users
    const users = db.users || [];
    if (users.length === 0) {
        console.log('⚠️  No users found in database');
        console.log('💡 All tasks will be assigned to userId: "1" (default)');
    }

    // Migration logic
    let migratedCount = 0;
    let alreadyMigratedCount = 0;
    let orphanedTasksCount = 0;

    db.tasks.forEach((task, index) => {
        if (task.userId) {
            // Task already has userId
            alreadyMigratedCount++;
            return;
        }

        // Assign userId based on assignee email or default to first user
        let assignedUserId = null;

        // Try to match by assignee email
        if (task.assignee && users.length > 0) {
            const matchedUser = users.find(u => u.email === task.assignee || u.name === task.assignee);
            if (matchedUser) {
                assignedUserId = matchedUser.id.toString();
            }
        }

        // If no match, assign to first user or use default
        if (!assignedUserId) {
            if (users.length > 0) {
                assignedUserId = users[0].id.toString();
            } else {
                // No users exist - assign to default user ID "1"
                assignedUserId = "1";
                orphanedTasksCount++;
            }
        }

        // Update task with userId
        task.userId = assignedUserId;
        migratedCount++;

        console.log(`  ✓ Task ${task.id}: "${task.title}" → userId: ${assignedUserId}`);
    });

    // Write updated database
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
        console.log('\n✅ Database updated successfully\n');
    } catch (error) {
        console.error('❌ Error writing database:', error.message);
        console.log('💡 You can restore from db.backup.json');
        process.exit(1);
    }

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 MIGRATION SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Total tasks:        ${db.tasks.length}`);
    console.log(`  ✅ Migrated:        ${migratedCount}`);
    console.log(`  ⏭️  Already migrated: ${alreadyMigratedCount}`);
    if (orphanedTasksCount > 0) {
        console.log(`  ⚠️  Orphaned tasks:  ${orphanedTasksCount} (assigned to userId "1")`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (orphanedTasksCount > 0) {
        console.log('⚠️  WARNING: Some tasks couldn\'t be matched to a user');
        console.log('   These tasks were assigned to userId "1" (default)');
        console.log('   You may need to manually reassign them to the correct users.\n');
    }

    console.log('✨ Migration completed successfully!');
    console.log('💾 Backup saved at: db.backup.json\n');
}

// Run migration
migrateDatabase();
