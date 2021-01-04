module.exports = [{
    type: 'list',
    name: 'bucketOperation',
    message: 'What do you want to do?',
    choices: [{
        name: 'Upload file/s to bucket',
        value: 'upload'
    }, {
        name : 'Show bucket List',
        value : 'list'
    }, {
        name : 'Exit',
        value : 'exit'
    }]
}]