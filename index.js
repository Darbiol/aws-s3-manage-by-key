const conf = require('./config');
const questions = require('./src/questions');

const fs = require('fs');
const AWS = require('aws-sdk');
const inquirer = require('inquirer');

let bucket;
let config;

async function listFolders (prefix='') {
    var params = {
        Bucket: config.bucket,
        Prefix : prefix,
        MaxKeys: 1000000
    };
    return bucket.listObjectsV2(params).promise();
}

async function getFile (key) {
    var params = {
        Bucket: config.bucket,
        Key : key
    };
    return bucket.getObject(params).promise();
}

function uploader (pathName, file) {
    const payload = {
        'Key' : `${bucket.config.params.Prefix}${pathName}`,
        'Body': file
    };
    console.log(`uploading ${payload.Key}...`);
    return bucket.upload( payload ).promise();
}

async function iterateAndUpload (dir, path) {
    let files = fs.readdirSync( dir );
    for( const filename of files ) {
        let relativePath = path ? `${path}/${filename}` : filename;
        let filePath = `${dir}/${filename}`;
        if(fs.lstatSync(filePath).isDirectory()){
            iterateAndUpload(filePath, relativePath)
        } else {
            let data = fs.readFileSync(filePath); 
            try {
                if(relativePath.split('/').pop() !== '.DS_Store'){
                    await uploader(relativePath, data);
                    console.log('Upload finished!')
                }
            } catch (error) {
                console.log('Error', error)
            }
        }
    }
}

function initAws(){
     // setup AWS
     const awsCreds = {
        'accessKeyId'    : config.key,
        'secretAccessKey': config.secret
    };

    AWS.config.update(awsCreds);

    bucket = new AWS.S3({
        'params': {
            'Bucket'   : config.bucket,
            'Delimiter': '/',
            'Prefix'   : ''
        }
    });
};

async function doUpload () {
    let dir = `${process.cwd()}/content`;
    initAws();
    await iterateAndUpload(dir, '');
}



async function callList(prefix) {
    let list = await listFolders(prefix);
    
    if(list.Contents.length === 1){
        let obj = await getFile(prefix);
        return obj.Body;
    } else {
        return list.Contents.map(i=>i.Key).concat(list.CommonPrefixes.map(i=>i.Prefix));
    }
}

async function doPrompt (prefix='') {
    let result = await callList(prefix);
    
    if(result instanceof Buffer){
        console.log('BAPER')
        return mainMenu();
    } else {
        let prompt = [{
            type: 'list',
            name: 'file',
            message: 'Choose folder/file', 
            choices: result.map(i=>({
                name: i,
                value: i
            }))
        }];
        return inquirer.prompt(prompt)
            .then( answer => doPrompt(answer.file) )
    }
    
}

async function showlist () {
    initAws();
    await doPrompt();
}

function doExit () {
    process.exit(0);
}

function mainMenu () {
    let optionObj = {
        'list' : showlist,
        'upload' : doUpload,
        'exit' : doExit
    };
    return inquirer.prompt(questions.main)
        .then( async answer => {
            return await optionObj[answer.bucketOperation]();
        } )
        .then(() => {
            return mainMenu();
        });
}

function main(){
    let questionsOptions = {
        config : {
            'useConfig' : questions.main,
            'createConfig' : questions.config
        }
    };
    return inquirer.prompt(questions.init)
        .then(answer => {
            return answer.config === 'createConfig' ? inquirer.prompt(questionsOptions.config[answer.config]) : Promise.resolve(conf.aws)
        })
        .then( userConf => {
            config = userConf;
            return mainMenu();
        })
        .then(() => {
            console.log('upload finished');
            return mainMenu();
        });
}


// doUpload();
// doList();
main();