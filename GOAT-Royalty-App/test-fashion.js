const { getAgentFactory } = require('./src/agents/agentFactory');

async function testFashion() {
    console.log('Testing Fashion Agent...');
    
    try {
        const factory = getAgentFactory();
        const designer = factory.getAgentByType('FashionDesigner');
        
        console.log('Got FashionDesigner agent:', designer.name);
        
        const result = await designer.executeCapability('design_generation', {
            style: 'sustainable streetwear',
            garmentType: 'jacket',
            targetAudience: 'Gen Z professionals'
        });
        
        console.log('Result:', result);
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testFashion();