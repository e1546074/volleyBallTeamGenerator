// algorithm.test.js - Test suite for algorithm.js using TDD

// Load the actual algorithm module
const algorithm = require('./algorithm.js');

// Test framework
const TestRunner = {
    tests: [],
    passed: 0,
    failed: 0,
    
    addTest: function(name, testFunc) {
        this.tests.push({ name, testFunc });
    },
    
    run: function() {
        console.log('Running tests...\n');
        this.passed = 0;
        this.failed = 0;
        
        for (const test of this.tests) {
            try {
                test.testFunc();
                console.log(`✓ ${test.name}`);
                this.passed++;
            } catch (error) {
                console.log(`✗ ${test.name}`);
                console.log(`  Error: ${error.message}`);
                this.failed++;
            }
        }
        
        console.log(`\nResults: ${this.passed} passed, ${this.failed} failed`);
        return this.failed === 0;
    },
    
    assert: function(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    },
    
    assertEqual: function(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(`${message || 'Values not equal'}: expected ${expected}, got ${actual}`);
        }
    },
    
    assertCloseTo: function(actual, expected, precision, message) {
        const diff = Math.abs(actual - expected);
        if (diff > precision) {
            throw new Error(`${message || 'Values not close'}: expected ${expected}, got ${actual}, diff ${diff}`);
        }
    },
    
    assertTrue: function(value, message) {
        this.assert(value === true, message || 'Expected true, got false');
    },
    
    assertFalse: function(value, message) {
        this.assert(value === false, message || 'Expected false, got true');
    }
};

// Test 1: Verify that the sum of all attribute weights for each position equals 1.00
TestRunner.addTest('Setter weights sum to 1.00', function() {
    const setterWeights = algorithm.POSITION_WEIGHTS['Setter'];
    const sum = Object.values(setterWeights).reduce((acc, weight) => acc + weight, 0);
    TestRunner.assertCloseTo(sum, 1.00, 0.001, `Setter weights sum to ${sum}, expected 1.00`);
});

TestRunner.addTest('Middle Blocker weights sum to 1.00', function() {
    const mbWeights = algorithm.POSITION_WEIGHTS['Middle Blocker'];
    const sum = Object.values(mbWeights).reduce((acc, weight) => acc + weight, 0);
    TestRunner.assertCloseTo(sum, 1.00, 0.001, `Middle Blocker weights sum to ${sum}, expected 1.00`);
});

TestRunner.addTest('Outside Hitter weights sum to 1.00', function() {
    const ohWeights = algorithm.POSITION_WEIGHTS['Outside Hitter'];
    const sum = Object.values(ohWeights).reduce((acc, weight) => acc + weight, 0);
    TestRunner.assertCloseTo(sum, 1.00, 0.001, `Outside Hitter weights sum to ${sum}, expected 1.00`);
});

// Test 2: Verify the corrected weights for each position
TestRunner.addTest('Setter has correct weight for setting', function() {
    const setterWeights = algorithm.POSITION_WEIGHTS['Setter'];
    TestRunner.assertCloseTo(setterWeights.setting, 0.1471, 0.0001, `Setter setting weight is ${setterWeights.setting}, expected 0.1471`);
});

TestRunner.addTest('Setter has correct weight for gameIQ', function() {
    const setterWeights = algorithm.POSITION_WEIGHTS['Setter'];
    TestRunner.assertCloseTo(setterWeights.gameIQ, 0.1324, 0.0001, `Setter gameIQ weight is ${setterWeights.gameIQ}, expected 0.1324`);
});

TestRunner.addTest('Setter has correct weight for height', function() {
    const setterWeights = algorithm.POSITION_WEIGHTS['Setter'];
    TestRunner.assertCloseTo(setterWeights.height, 0.0882, 0.0001, `Setter height weight is ${setterWeights.height}, expected 0.0882`);
});

TestRunner.addTest('Setter has correct weight for verticalJump', function() {
    const setterWeights = algorithm.POSITION_WEIGHTS['Setter'];
    TestRunner.assertCloseTo(setterWeights.verticalJump, 0.0735, 0.0001, `Setter verticalJump weight is ${setterWeights.verticalJump}, expected 0.0735`);
});

TestRunner.addTest('Setter has correct weight for speedAgility', function() {
    const setterWeights = algorithm.POSITION_WEIGHTS['Setter'];
    TestRunner.assertCloseTo(setterWeights.speedAgility, 0.1177, 0.0001, `Setter speedAgility weight is ${setterWeights.speedAgility}, expected 0.1177`);
});

TestRunner.addTest('Setter has correct weight for spiking', function() {
    const setterWeights = algorithm.POSITION_WEIGHTS['Setter'];
    TestRunner.assertCloseTo(setterWeights.spiking, 0.0588, 0.0001, `Setter spiking weight is ${setterWeights.spiking}, expected 0.0588`);
});

TestRunner.addTest('Setter has correct weight for blocking', function() {
    const setterWeights = algorithm.POSITION_WEIGHTS['Setter'];
    TestRunner.assertCloseTo(setterWeights.blocking, 0.0882, 0.0001, `Setter blocking weight is ${setterWeights.blocking}, expected 0.0882`);
});

TestRunner.addTest('Setter has correct weight for passing', function() {
    const setterWeights = algorithm.POSITION_WEIGHTS['Setter'];
    TestRunner.assertCloseTo(setterWeights.passing, 0.1029, 0.0001, `Setter passing weight is ${setterWeights.passing}, expected 0.1029`);
});

TestRunner.addTest('Setter has correct weight for defense', function() {
    const setterWeights = algorithm.POSITION_WEIGHTS['Setter'];
    TestRunner.assertCloseTo(setterWeights.defense, 0.1029, 0.0001, `Setter defense weight is ${setterWeights.defense}, expected 0.1029`);
});

TestRunner.addTest('Setter has correct weight for serving', function() {
    const setterWeights = algorithm.POSITION_WEIGHTS['Setter'];
    TestRunner.assertCloseTo(setterWeights.serving, 0.0882, 0.0001, `Setter serving weight is ${setterWeights.serving}, expected 0.0882`);
});

// Middle Blocker weights
TestRunner.addTest('Middle Blocker has correct weight for height', function() {
    const mbWeights = algorithm.POSITION_WEIGHTS['Middle Blocker'];
    TestRunner.assertCloseTo(mbWeights.height, 0.1308, 0.0001, `Middle Blocker height weight is ${mbWeights.height}, expected 0.1308`);
});

TestRunner.addTest('Middle Blocker has correct weight for verticalJump', function() {
    const mbWeights = algorithm.POSITION_WEIGHTS['Middle Blocker'];
    TestRunner.assertCloseTo(mbWeights.verticalJump, 0.1163, 0.0001, `Middle Blocker verticalJump weight is ${mbWeights.verticalJump}, expected 0.1163`);
});

TestRunner.addTest('Middle Blocker has correct weight for speedAgility', function() {
    const mbWeights = algorithm.POSITION_WEIGHTS['Middle Blocker'];
    TestRunner.assertCloseTo(mbWeights.speedAgility, 0.1018, 0.0001, `Middle Blocker speedAgility weight is ${mbWeights.speedAgility}, expected 0.1018`);
});

TestRunner.addTest('Middle Blocker has correct weight for spiking', function() {
    const mbWeights = algorithm.POSITION_WEIGHTS['Middle Blocker'];
    TestRunner.assertCloseTo(mbWeights.spiking, 0.0872, 0.0001, `Middle Blocker spiking weight is ${mbWeights.spiking}, expected 0.0872`);
});

TestRunner.addTest('Middle Blocker has correct weight for blocking', function() {
    const mbWeights = algorithm.POSITION_WEIGHTS['Middle Blocker'];
    TestRunner.assertCloseTo(mbWeights.blocking, 0.1308, 0.0001, `Middle Blocker blocking weight is ${mbWeights.blocking}, expected 0.1308`);
});

TestRunner.addTest('Middle Blocker has correct weight for setting', function() {
    const mbWeights = algorithm.POSITION_WEIGHTS['Middle Blocker'];
    TestRunner.assertCloseTo(mbWeights.setting, 0.0581, 0.0001, `Middle Blocker setting weight is ${mbWeights.setting}, expected 0.0581`);
});

TestRunner.addTest('Middle Blocker has correct weight for passing', function() {
    const mbWeights = algorithm.POSITION_WEIGHTS['Middle Blocker'];
    TestRunner.assertCloseTo(mbWeights.passing, 0.0685, 0.0001, `Middle Blocker passing weight is ${mbWeights.passing}, expected 0.0685`);
});

TestRunner.addTest('Middle Blocker has correct weight for defense', function() {
    const mbWeights = algorithm.POSITION_WEIGHTS['Middle Blocker'];
    TestRunner.assertCloseTo(mbWeights.defense, 0.1096, 0.0001, `Middle Blocker defense weight is ${mbWeights.defense}, expected 0.1096`);
});

TestRunner.addTest('Middle Blocker has correct weight for serving', function() {
    const mbWeights = algorithm.POSITION_WEIGHTS['Middle Blocker'];
    TestRunner.assertCloseTo(mbWeights.serving, 0.0872, 0.0001, `Middle Blocker serving weight is ${mbWeights.serving}, expected 0.0872`);
});

TestRunner.addTest('Middle Blocker has correct weight for gameIQ', function() {
    const mbWeights = algorithm.POSITION_WEIGHTS['Middle Blocker'];
    TestRunner.assertCloseTo(mbWeights.gameIQ, 0.1096, 0.0001, `Middle Blocker gameIQ weight is ${mbWeights.gameIQ}, expected 0.1096`);
});

// Outside Hitter weights
TestRunner.addTest('Outside Hitter has correct weight for height', function() {
    const ohWeights = algorithm.POSITION_WEIGHTS['Outside Hitter'];
    TestRunner.assertCloseTo(ohWeights.height, 0.1018, 0.0001, `Outside Hitter height weight is ${ohWeights.height}, expected 0.1018`);
});

TestRunner.addTest('Outside Hitter has correct weight for verticalJump', function() {
    const ohWeights = algorithm.POSITION_WEIGHTS['Outside Hitter'];
    TestRunner.assertCloseTo(ohWeights.verticalJump, 0.1163, 0.0001, `Outside Hitter verticalJump weight is ${ohWeights.verticalJump}, expected 0.1163`);
});

TestRunner.addTest('Outside Hitter has correct weight for speedAgility', function() {
    const ohWeights = algorithm.POSITION_WEIGHTS['Outside Hitter'];
    TestRunner.assertCloseTo(ohWeights.speedAgility, 0.1163, 0.0001, `Outside Hitter speedAgility weight is ${ohWeights.speedAgility}, expected 0.1163`);
});

TestRunner.addTest('Outside Hitter has correct weight for spiking', function() {
    const ohWeights = algorithm.POSITION_WEIGHTS['Outside Hitter'];
    TestRunner.assertCloseTo(ohWeights.spiking, 0.1309, 0.0001, `Outside Hitter spiking weight is ${ohWeights.spiking}, expected 0.1309`);
});

TestRunner.addTest('Outside Hitter has correct weight for blocking', function() {
    const ohWeights = algorithm.POSITION_WEIGHTS['Outside Hitter'];
    TestRunner.assertCloseTo(ohWeights.blocking, 0.1018, 0.0001, `Outside Hitter blocking weight is ${ohWeights.blocking}, expected 0.1018`);
});

TestRunner.addTest('Outside Hitter has correct weight for setting', function() {
    const ohWeights = algorithm.POSITION_WEIGHTS['Outside Hitter'];
    TestRunner.assertCloseTo(ohWeights.setting, 0.0525, 0.0001, `Outside Hitter setting weight is ${ohWeights.setting}, expected 0.0525`);
});

TestRunner.addTest('Outside Hitter has correct weight for passing', function() {
    const ohWeights = algorithm.POSITION_WEIGHTS['Outside Hitter'];
    TestRunner.assertCloseTo(ohWeights.passing, 0.0918, 0.0001, `Outside Hitter passing weight is ${ohWeights.passing}, expected 0.0918`);
});

TestRunner.addTest('Outside Hitter has correct weight for defense', function() {
    const ohWeights = algorithm.POSITION_WEIGHTS['Outside Hitter'];
    TestRunner.assertCloseTo(ohWeights.defense, 0.0918, 0.0001, `Outside Hitter defense weight is ${ohWeights.defense}, expected 0.0918`);
});

TestRunner.addTest('Outside Hitter has correct weight for serving', function() {
    const ohWeights = algorithm.POSITION_WEIGHTS['Outside Hitter'];
    TestRunner.assertCloseTo(ohWeights.serving, 0.0918, 0.0001, `Outside Hitter serving weight is ${ohWeights.serving}, expected 0.0918`);
});

TestRunner.addTest('Outside Hitter has correct weight for gameIQ', function() {
    const ohWeights = algorithm.POSITION_WEIGHTS['Outside Hitter'];
    TestRunner.assertCloseTo(ohWeights.gameIQ, 0.1050, 0.0001, `Outside Hitter gameIQ weight is ${ohWeights.gameIQ}, expected 0.1050`);
});

// Test 3: Verify that all required attributes are present for each position
TestRunner.addTest('Setter has all 10 attributes', function() {
    const setterWeights = algorithm.POSITION_WEIGHTS['Setter'];
    const expectedAttributes = ['blocking', 'defense', 'gameIQ', 'height', 'passing', 'serving', 'setting', 'speedAgility', 'spiking', 'verticalJump'];
    const actualAttributes = Object.keys(setterWeights).sort();
    TestRunner.assertEqual(JSON.stringify(actualAttributes), JSON.stringify(expectedAttributes), 'Setter missing some attributes');
});

TestRunner.addTest('Middle Blocker has all 10 attributes', function() {
    const mbWeights = algorithm.POSITION_WEIGHTS['Middle Blocker'];
    const expectedAttributes = ['blocking', 'defense', 'gameIQ', 'height', 'passing', 'serving', 'setting', 'speedAgility', 'spiking', 'verticalJump'];
    const actualAttributes = Object.keys(mbWeights).sort();
    TestRunner.assertEqual(JSON.stringify(actualAttributes), JSON.stringify(expectedAttributes), 'Middle Blocker missing some attributes');
});

TestRunner.addTest('Outside Hitter has all 10 attributes', function() {
    const ohWeights = algorithm.POSITION_WEIGHTS['Outside Hitter'];
    const expectedAttributes = ['blocking', 'defense', 'gameIQ', 'height', 'passing', 'serving', 'setting', 'speedAgility', 'spiking', 'verticalJump'];
    const actualAttributes = Object.keys(ohWeights).sort();
    TestRunner.assertEqual(JSON.stringify(actualAttributes), JSON.stringify(expectedAttributes), 'Outside Hitter missing some attributes');
});

// Test 4: Verify position score calculation with corrected weights
TestRunner.addTest('Position score calculation for Setter with max ratings', function() {
    const player = {
        ratings: {
            height: 100,
            verticalJump: 100,
            speedAgility: 100,
            spiking: 100,
            blocking: 100,
            setting: 100,
            passing: 100,
            defense: 100,
            serving: 100,
            gameIQ: 100
        }
    };
    
    const score = algorithm.calculatePositionScore(player, 'Setter');
    // With all max ratings (100), the score should be 10.0
    TestRunner.assertEqual(score, 10.0, `Setter score with max ratings is ${score}, expected 10.0`);
});

TestRunner.addTest('Position score calculation for Middle Blocker with max ratings', function() {
    const player = {
        ratings: {
            height: 100,
            verticalJump: 100,
            speedAgility: 100,
            spiking: 100,
            blocking: 100,
            setting: 100,
            passing: 100,
            defense: 100,
            serving: 100,
            gameIQ: 100
        }
    };
    
    const score = algorithm.calculatePositionScore(player, 'Middle Blocker');
    TestRunner.assertEqual(score, 10.0, `Middle Blocker score with max ratings is ${score}, expected 10.0`);
});

TestRunner.addTest('Position score calculation for Outside Hitter with max ratings', function() {
    const player = {
        ratings: {
            height: 100,
            verticalJump: 100,
            speedAgility: 100,
            spiking: 100,
            blocking: 100,
            setting: 100,
            passing: 100,
            defense: 100,
            serving: 100,
            gameIQ: 100
        }
    };
    
    const score = algorithm.calculatePositionScore(player, 'Outside Hitter');
    TestRunner.assertEqual(score, 10.0, `Outside Hitter score with max ratings is ${score}, expected 10.0`);
});

TestRunner.addTest('Position score calculation for Setter with zero ratings', function() {
    const player = {
        ratings: {
            height: 0,
            verticalJump: 0,
            speedAgility: 0,
            spiking: 0,
            blocking: 0,
            setting: 0,
            passing: 0,
            defense: 0,
            serving: 0,
            gameIQ: 0
        }
    };
    
    const score = algorithm.calculatePositionScore(player, 'Setter');
    TestRunner.assertEqual(score, 0, `Setter score with zero ratings is ${score}, expected 0`);
});

// Test 5: Verify position score calculation with specific ratings
TestRunner.addTest('Position score calculation for Setter with 50 ratings', function() {
    const player = {
        ratings: {
            height: 50,
            verticalJump: 50,
            speedAgility: 50,
            spiking: 50,
            blocking: 50,
            setting: 50,
            passing: 50,
            defense: 50,
            serving: 50,
            gameIQ: 50
        }
    };
    
    const score = algorithm.calculatePositionScore(player, 'Setter');
    // With all 50 ratings, the score should be 5.0
    TestRunner.assertEqual(score, 5.0, `Setter score with 50 ratings is ${score}, expected 5.0`);
});

TestRunner.addTest('calculateAllPositionScores returns scores for all positions', function() {
    const player = {
        ratings: {
            height: 100,
            verticalJump: 100,
            speedAgility: 100,
            spiking: 100,
            blocking: 100,
            setting: 100,
            passing: 100,
            defense: 100,
            serving: 100,
            gameIQ: 100
        }
    };
    
    const scores = algorithm.calculateAllPositionScores(player);
    TestRunner.assertTrue('Setter' in scores, 'Setter score missing');
    TestRunner.assertTrue('Middle Blocker' in scores, 'Middle Blocker score missing');
    TestRunner.assertTrue('Outside Hitter' in scores, 'Outside Hitter score missing');
    TestRunner.assertEqual(scores['Setter'], 10.0, 'Setter score incorrect');
    TestRunner.assertEqual(scores['Middle Blocker'], 10.0, 'Middle Blocker score incorrect');
    TestRunner.assertEqual(scores['Outside Hitter'], 10.0, 'Outside Hitter score incorrect');
});

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
    const success = TestRunner.run();
    process.exit(success ? 0 : 1);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TestRunner, algorithm };
}
