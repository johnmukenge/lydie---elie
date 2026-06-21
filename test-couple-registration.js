/**
 * Test script to verify Couple registration feature
 * This simulates the RSVP flow for "Couple Pippo Baudo" format
 */

const API_ENDPOINT = 'http://localhost:3000/api/guest-log';

// Simulate the PDF generation metadata (normally from pdfGenerator)
const mockInvitationMetadata = {
  fileName: 'test-invitation.pdf',
  invitationCode: 'TEST123ABC',
  verificationHash: 'HASH789XYZ',
};

// Test 1: Register a single guest (baseline)
async function testSingleGuestRegistration() {
  console.log('\n=== TEST 1: Single Guest Registration ===');
  
  const payload = {
    action: 'add',
    variant: 'religious',
    guestData: {
      firstName: 'Marco',
      lastName: 'Rossi',
      attendanceType: 'single',
    },
    language: 'en',
    invitationData: mockInvitationMetadata,
  };

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log('✓ Single guest registered');
    console.log(`  Entries count: ${result.entries?.length || 0}`);
    if (result.entries) {
      const lastEntry = result.entries[0];
      console.log(`  Last entry: ${lastEntry.firstName} ${lastEntry.lastName}`);
    }
    return result;
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

// Test 2: Register a couple using "Couple Name Surname" format
async function testCoupleFormatRegistration() {
  console.log('\n=== TEST 2: Couple Format Registration ("Couple Pippo Baudo") ===');
  
  const payload = {
    action: 'add',
    variant: 'religious',
    guestData: {
      firstName: 'Couple Pippo Baudo',
      lastName: 'Baudo', // This will be ignored when coupleFormat is true
      attendanceType: 'couple',
      partnerFirstName: 'Pippo',
      partnerLastName: 'Baudo',
    },
    language: 'en',
    invitationData: {
      fileName: 'test-couple-invitation.pdf',
      invitationCode: 'COUPLE123',
      verificationHash: 'COUPLEHASH456',
    },
    coupleFormat: true, // Flag to create two entries
  };

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log('✓ Couple registered via format');
    console.log(`  Total entries count: ${result.entries?.length || 0}`);
    
    // Find the two entries with our code
    const coupleEntries = result.entries?.filter(
      e => e.invitationCode === 'COUPLE123'
    ) || [];
    console.log(`  Entries with COUPLE123 code: ${coupleEntries.length}`);
    
    if (coupleEntries.length >= 2) {
      console.log(`  ✓ Entry 1: ${coupleEntries[0].firstName} ${coupleEntries[0].lastName}`);
      console.log(`  ✓ Entry 2: ${coupleEntries[1].firstName} ${coupleEntries[1].lastName}`);
      console.log(`  ✓ Both have same invitationCode: ${coupleEntries[0].invitationCode === coupleEntries[1].invitationCode}`);
      console.log(`  ✓ Both have same verificationHash: ${coupleEntries[0].verificationHash === coupleEntries[1].verificationHash}`);
    } else {
      console.warn(`  ✗ Expected 2 entries but found ${coupleEntries.length}`);
    }
    
    return result;
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

// Test 3: Traditional wedding variant
async function testCoupleFormatTraditional() {
  console.log('\n=== TEST 3: Couple Format Registration (Traditional Wedding) ===');
  
  const payload = {
    action: 'add',
    variant: 'traditional',
    guestData: {
      firstName: 'Couple Anna Bianchi',
      lastName: 'Bianchi',
      attendanceType: 'couple',
      partnerFirstName: 'Anna',
      partnerLastName: 'Bianchi',
    },
    language: 'fr',
    invitationData: {
      fileName: 'test-traditional-couple.pdf',
      invitationCode: 'TRAD123',
      verificationHash: 'TRADHASH789',
    },
    coupleFormat: true,
  };

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log(`✓ Registered on traditional variant`);
    console.log(`  Variant confirmed: ${result.variant}`);
    
    const traditionalEntries = result.entries?.filter(
      e => e.invitationCode === 'TRAD123'
    ) || [];
    console.log(`  Couple entries created: ${traditionalEntries.length}`);
    
    return result;
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

// Test 4: Verify check-in with couple code
async function testCheckInCouple() {
  console.log('\n=== TEST 4: Check-in with Couple Registration Code ===');
  
  const payload = {
    action: 'checkin',
    invitationCode: 'COUPLE123',
    verificationHash: 'COUPLEHASH456',
    variant: 'religious',
  };

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log(`✓ Check-in result: ${result.result}`);
    
    // Verify both entries were checked in
    const checkedInEntries = result.entries?.filter(
      e => e.invitationCode === 'COUPLE123' && e.checkInStatus === 'checked-in'
    ) || [];
    console.log(`  Entries marked as checked-in: ${checkedInEntries.length}`);
    
    return result;
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('========================================');
  console.log('COUPLE REGISTRATION FEATURE TESTS');
  console.log('========================================');
  
  await testSingleGuestRegistration();
  await new Promise(r => setTimeout(r, 500)); // Small delay
  
  await testCoupleFormatRegistration();
  await new Promise(r => setTimeout(r, 500));
  
  await testCoupleFormatTraditional();
  await new Promise(r => setTimeout(r, 500));
  
  await testCheckInCouple();
  
  console.log('\n========================================');
  console.log('TESTS COMPLETED');
  console.log('========================================\n');
}

// Run tests
runAllTests().catch(console.error);
