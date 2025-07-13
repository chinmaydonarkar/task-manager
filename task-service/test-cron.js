/**
 * Test Script for Enhanced Cron Job Implementation
 * Demonstrates the functionality of the daily task reminder system
 */

const cronService = require('./src/services/cronService');
const logger = require('./src/utils/logger');

async function testCronJob() {
  console.log('🧪 Testing Enhanced Cron Job Implementation\n');

  try {
    // Test 1: Get cron statistics
    console.log('1. 📊 Getting Cron Statistics...');
    const stats = cronService.getStats();
    console.log('Statistics:', JSON.stringify(stats, null, 2));

    // Test 2: Get health status
    console.log('\n2. 🏥 Getting Health Status...');
    const health = cronService.getHealthStatus();
    console.log('Health Status:', JSON.stringify(health, null, 2));

    // Test 3: Get tasks due today
    console.log('\n3. 📋 Getting Tasks Due Today...');
    const tasksByUser = await cronService.getAllTasksDueToday();
    const totalTasks = Object.values(tasksByUser).reduce((sum, tasks) => sum + tasks.length, 0);
    console.log(`Found ${Object.keys(tasksByUser).length} users with ${totalTasks} tasks due today`);

    // Test 4: Manual trigger (commented out to avoid sending actual emails)
    console.log('\n4. 🚀 Manual Trigger Test (commented out)...');
    // await cronService.triggerManually();
    console.log('Manual trigger would execute the daily reminder job');

    // Test 5: Test date range utility
    console.log('\n5. 📅 Testing Date Range Utility...');
    const dateRange = cronService.getTodayDateRange();
    console.log('Today\'s date range:', {
      today: dateRange.today.toISOString(),
      tomorrow: dateRange.tomorrow.toISOString()
    });

    // Test 6: Test task grouping utility
    console.log('\n6. 🔄 Testing Task Grouping Utility...');
    const mockTasks = [
      { user: { _id: 'user1' }, title: 'Task 1' },
      { user: { _id: 'user1' }, title: 'Task 2' },
      { user: { _id: 'user2' }, title: 'Task 3' }
    ];
    const groupedTasks = cronService.groupTasksByUser(mockTasks);
    console.log('Grouped tasks:', JSON.stringify(groupedTasks, null, 2));

    console.log('\n✅ All tests completed successfully!');
    console.log('\n📝 To test the actual email sending:');
    console.log('1. Create tasks with today\'s due date');
    console.log('2. Uncomment the manual trigger line in this script');
    console.log('3. Run: node test-cron.js');

  } catch (error) {
    console.error('❌ Test failed:', error);
    logger.error('Test script failed:', error);
  }
}

// Run the test
testCronJob().then(() => {
  console.log('\n🎉 Test script completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
}); 