module.exports = [{
    type: 'list',
    name: 'config',
    message: 'Configure AWS Bucket',
    choices: [{
        name: 'Use existing config file',
        value: 'useConfig'
    }, {
        name : 'Setup config file',
        value : 'createConfig'
    }]
}]