import AWS from 'aws-sdk';

AWS.config.update({
  region:'ap-southeast-2',
  accessKeyId: '',
  secretAccessKey: ''
});

const textract = new AWS.Textract();

export default textract