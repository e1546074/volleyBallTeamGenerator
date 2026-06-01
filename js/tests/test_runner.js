// test_runner.js - Main test runner that executes all test types

const fs = require('fs');
const path = require('path');

// Test framework
const TestRunner = {
    totalPassed: 0,
    totalFailed: 0,
    testSuites: [],
    
    addTestSuite: function(name, testModule) {
        this.testSuites.push({ name, module: testModule });
    },
    
    runAll: function() {
        console.log('='.repeat(80));
        console.log('VOLLEYBALL TEAM GENERATOR - COMPREHENSIVE TEST SUITE');
        console.log('='.repeat(80));
        console.log();
        
        this.totalPassed = 0;
        this.totalFailed = 0;
        
        for (const suite of this.testSuites) {
            console.log(`\n${'─'.repeat(80)}`);
            console.log(`📁 ${suite.name}`);
            console.log('─'.repeat(80));
            
            try {
                const success = suite.module.run();
                if (success) {
                    console.log(`✅ All ${suite.module.passed} tests passed in ${suite.name}`);
                } else {
                    console.log(`❌ ${suite.module.failed} tests failed in ${suite.name}`);
                }
                this.totalPassed += suite.module.passed;
                this.totalFailed += suite.module.failed;
            } catch (error) {
                console.log(`❌ Error running ${suite.name}: ${error.message}`);
                this.totalFailed++;
            }
        }
        
        console.log(`\n${'='.repeat(80)}`);
        console.log('TEST SUMMARY');
        console.log('='.repeat(80));
        console.log(`Total Tests Passed: ${this.totalPassed}`);
        console.log(`Total Tests Failed: ${this.totalFailed}`);
        console.log(`Total Tests Run: ${this.totalPassed + this.totalFailed}`);
        console.log('='.repeat(80));
        
        if (this.totalFailed === 0) {
            console.log('🎉 ALL TESTS PASSED! 🎉');
        } else {
            console.log(`⚠️  ${this.totalFailed} test(s) failed`);
        }
        console.log();
        
        return this.totalFailed === 0;
    },
    
    runByType: function(type) {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`VOLLEYBALL TEAM GENERATOR - ${type.toUpperCase()} TESTS`);
        console.log('='.repeat(80));
        console.log();
        
        this.totalPassed = 0;
        this.totalFailed = 0;
        
        const typeSuites = this.testSuites.filter(suite => 
            suite.name.toLowerCase().includes(type.toLowerCase())
        );
        
        if (typeSuites.length === 0) {
            console.log(`❌ No test suites found for type: ${type}`);
            return false;
        }
        
        for (const suite of typeSuites) {
            console.log(`\n${'─'.repeat(80)}`);
            console.log(`📁 ${suite.name}`);
            console.log('─'.repeat(80));
            
            try {
                const success = suite.module.run();
                if (success) {
                    console.log(`✅ All ${suite.module.passed} tests passed in ${suite.name}`);
                } else {
                    console.log(`❌ ${suite.module.failed} tests failed in ${suite.name}`);
                }
                this.totalPassed += suite.module.passed;
                this.totalFailed += suite.module.failed;
            } catch (error) {
                console.log(`❌ Error running ${suite.name}: ${error.message}`);
                this.totalFailed++;
            }
        }
        
        console.log(`\n${'='.repeat(80)}`);
        console.log(`${type.toUpperCase()} TEST SUMMARY`);
        console.log('='.repeat(80));
        console.log(`Total Tests Passed: ${this.totalPassed}`);
        console.log(`Total Tests Failed: ${this.totalFailed}`);
        console.log(`Total Tests Run: ${this.totalPassed + this.totalFailed}`);
        console.log('='.repeat(80));
        
        if (this.totalFailed === 0) {
            console.log(`🎉 ALL ${type.toUpperCase()} TESTS PASSED! 🎉`);
        } else {
            console.log(`⚠️  ${this.totalFailed} ${type} test(s) failed`);
        }
        console.log();
        
        return this.totalFailed === 0;
    }
};

// Load all test files dynamically
function loadTestFiles() {
    const testDirs = ['unit', 'integration', 'system'];
    
    for (const dir of testDirs) {
        const dirPath = path.join(__dirname, dir);
        
        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.test.js'));
            
            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const moduleName = path.basename(file, '.test.js');
                const displayName = `${dir.toUpperCase()}: ${moduleName.replace(/_/g, ' ')}`;
                
                try {
                    const module = require(filePath);
                    TestRunner.addTestSuite(displayName, module.TestRunner);
                } catch (error) {
                    console.error(`Error loading test file ${filePath}: ${error.message}`);
                }
            }
        }
    }
    
    // Also load the original algorithm.test.js if it exists
    const originalAlgorithmTest = path.join(__dirname, '..', 'algorithm.test.js');
    if (fs.existsSync(originalAlgorithmTest)) {
        try {
            const module = require(originalAlgorithmTest);
            TestRunner.addTestSuite('LEGACY: Algorithm Tests', module.TestRunner);
        } catch (error) {
            console.error(`Error loading legacy test file: ${error.message}`);
        }
    }
}

// Load test files
loadTestFiles();

// Handle command line arguments
const args = process.argv.slice(2);
const type = args[0];

if (type === 'unit' || type === 'integration' || type === 'system') {
    const success = TestRunner.runByType(type);
    process.exit(success ? 0 : 1);
} else {
    // Run all tests
    const success = TestRunner.runAll();
    process.exit(success ? 0 : 1);
}
