const { readFile, writeFile } = require('fs/promises');
const data = require('../../data/restaurants.json');


const PREFIX = 'INSERT INTO GRADES(GRADE_DATE, GRADE, SCORE, RESTAURANT_ID) VALUES ('
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

const convertJSON = (data) => {
    let sqlStatement = '';

    try {
        const maxIndex = data.length - 1;
        data.forEach((restaurant, idx) => {
            let sql;
            let grades = restaurant.grades;
            const restaurantId = restaurant.restaurant_id;

            grades.forEach(gradeRecord => {
                const {
                    date: {
                        "$date": gradeDate,
                    },
                    grade,
                    score,
                } = gradeRecord;
                sql = `${PREFIX}'${gradeDate}', '${grade}', ${score}, '${restaurantId}'${SUFFIX}`;

                sqlStatement+= sql;
            });
        });
        writeFile(`${__dirname}/grades.sql`, sqlStatement, { encoding: 'utf-8' });
    } catch(err) {
        console.log(err);
    }
}

// convert();
convertJSON(data);