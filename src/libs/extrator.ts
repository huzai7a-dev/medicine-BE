import AWS from 'aws-sdk';

const {ACCESS_KEY_ID,SECRET_ACCESS_KEY} = process.env;

AWS.config.update({
  region:'ap-southeast-2',
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY
});

const textract = new AWS.Textract();

export default textract