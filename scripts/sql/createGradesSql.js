const { readFile, writeFile } = require('fs/promises');

const PREFIX = 'INSERT INTO GRADES(GRADE_ID, GRADE, SCORE, RESTAURANT_ID) VALUES ('
const SUFFIX = ');';

const convert = async () => {
    let sqlStatement = '';

    try {
        const filePath = `./data/grades.csv`;
        const text = await readFile(filePath, { encoding: 'utf-8' });
        const textAsArray = text.split('\n');
        const maxIndex = textAsArray.length - 1;
        
        textAsArray.forEach((gradeRecord, idx) => {
            const recordArray = gradeRecord.split(',');
            const [ gradeId, grade, score, restaurantId ] = recordArray;
            const sql = `${PREFIX}${gradeId}, ${grade}, ${score}, ${restaurantId}${SUFFIX}`
            sqlStatement = idx === maxIndex ? sqlStatement + sql : sqlStatement + `${sql}\n`;
        });

        writeFile(`${__dirname}/grades.sql`, sqlStatement, { encoding: 'utf-8' });
    
    } catch(err) {
        console.log(err);
    }
}

convert();